(function attachProjectScheduleEngine(global) {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;

  const DEFAULT_SYSTEM_PARAMS = {
    tunnelPassageLagDays: 7,
    roadPassageLagDays: 3,
  };

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeText(value) {
    return String(value ?? "").replace(/\s+/g, "").replace(/[，、,]/g, "|");
  }

  function compactText(value) {
    return String(value ?? "").replace(/\s+/g, "").replace(/-/g, "");
  }

  function uniqueBy(items, getKey) {
    const seen = new Set();
    return items.filter((item) => {
      const key = getKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function addDays(date, days) {
    return new Date(date.getTime() + Number(days || 0) * DAY_MS);
  }

  function maxDate(a, b) {
    if (!a) return b;
    if (!b) return a;
    return a.getTime() >= b.getTime() ? a : b;
  }

  function minDate(a, b) {
    if (!a) return b;
    if (!b) return a;
    return a.getTime() <= b.getTime() ? a : b;
  }

  function parseDate(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return { date: null, valid: true, raw };

    let match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!match) match = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
    if (!match) return { date: null, valid: false, raw };

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    const valid =
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;
    return { date: valid ? date : null, valid, raw };
  }

  function formatDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseNonNegativeInteger(value, fallback = 0) {
    const raw = String(value ?? "").trim();
    if (!/^\d+$/.test(raw)) return { value: fallback, valid: false, raw };
    return { value: Number(raw), valid: true, raw };
  }

  function parsePositiveNumber(value) {
    const match = String(value ?? "").match(/[\d.]+/);
    if (!match) return 0;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function parseDurationDays(task) {
    const explicit = parsePositiveNumber(task.duration);
    if (explicit > 0) return Math.max(1, Math.ceil(explicit));

    const qty = parsePositiveNumber(task.qty);
    const metric = parsePositiveNumber(task.metric);
    if (qty > 0 && metric > 0) {
      const metricText = String(task.metric || "");
      const days = /天\s*\//.test(metricText) ? qty * metric : qty / metric;
      return Math.max(1, Math.ceil(days));
    }

    return 1;
  }

  function makeIssue({ level = "warning", module, row = 0, levelName, nodeName, moduleName, message, nodeId }) {
    return { level, module, row, levelName, nodeName, moduleName, message, nodeId };
  }

  function dedupeIssues(issues) {
    return uniqueBy(issues, (issue) => [issue.level, issue.module, issue.nodeId, issue.message].join("|"));
  }

  function inferWorkpointKind(workpoint) {
    const text = `${workpoint?.discipline || ""}${workpoint?.name || ""}`;
    if (text.includes("隧道")) return "tunnel";
    if (text.includes("路基")) return "road";
    return "bridge";
  }

  function flattenStructureTree(nodes, level = 0, parent = null, rows = []) {
    asArray(nodes).forEach((node, index) => {
      const row = {
        ...node,
        level,
        parentId: parent?.id || "",
        parentName: parent?.name || "",
        siblingIndex: index,
      };
      rows.push(row);
      if (node.children) flattenStructureTree(node.children, level + 1, row, rows);
    });
    return rows;
  }

  function leafStructures(nodes) {
    return flattenStructureTree(nodes).filter((node) => !Array.isArray(node.children) || node.children.length === 0);
  }

  function structureTreeForWorkpoint(ctx, workpoint) {
    const specific = ctx.structureTemplatesByWorkpoint?.[workpoint.id];
    if (Array.isArray(specific) && specific.length) return specific;
    return ctx.structureTemplates[workpoint.kind] || ctx.structureTemplates.bridge || [];
  }

  function inferTaskKind(structure, workpointKind) {
    const text = `${structure?.id || ""}${structure?.name || ""}${structure?.type || ""}`;
    if (workpointKind === "tunnel") return "tunnel";
    if (workpointKind === "road") return "road";
    if (text.includes("pile") || text.includes("桩基")) return "pile";
    if (text.includes("cap") || text.includes("承台") || text.includes("盖梁")) return "cap";
    if (text.includes("body") || text.includes("wall") || text.includes("身") || text.includes("洞门墙")) return "body";
    if (text.includes("box") || text.includes("简支箱梁") || text.includes("现浇梁")) return "girder";
    if (text.includes("deck") || text.includes("桥面")) return "deck";
    return "cap";
  }

  function parseStructureNumber(value) {
    const match = String(value ?? "").match(/(\d+)\s*#/);
    return match ? Number(match[1]) : null;
  }

  function parseKRange(value) {
    const text = String(value ?? "");
    const match = text.match(/K(\d+)\+(\d+)\s*[~～-]\s*K?(\d+)\+(\d+)/i);
    if (!match) return null;
    const start = Number(match[1]) * 1000 + Number(match[2]);
    const end = Number(match[3]) * 1000 + Number(match[4]);
    return { start: Math.min(start, end), end: Math.max(start, end) };
  }

  function rangeContains(container, target) {
    if (!container || !target) return false;
    return container.start <= target.start && container.end >= target.end;
  }

  function rangeOverlaps(a, b) {
    if (!a || !b) return false;
    return a.start <= b.end && b.start <= a.end;
  }

  function standardizeConfig(input = {}) {
    const systemParams = { ...DEFAULT_SYSTEM_PARAMS, ...(input.systemParams || {}) };
    const workpoints = asArray(input.workpoints).map((workpoint, index) => {
      const start = parseDate(workpoint.start);
      const gap = parseNonNegativeInteger(workpoint.gap ?? "0");
      const kind = inferWorkpointKind(workpoint);
      return {
        ...workpoint,
        index,
        kind,
        gapDays: gap.value,
        gapValid: gap.valid,
        startDate: start.date,
        startDateValid: start.valid,
        routeRange: parseKRange(workpoint.name),
      };
    });

    const beamLines = asArray(input.beamLines).map((line, index) => {
      const start = parseDate(line.startTime);
      const transfer = parseNonNegativeInteger(line.transfer);
      return {
        ...line,
        index,
        transferDays: transfer.value,
        transferValid: transfer.valid,
        startDate: start.date,
        startDateValid: start.valid,
      };
    });

    const manualDates = [
      ...workpoints.map((item) => item.startDate),
      ...beamLines.map((item) => item.startDate),
    ].filter(Boolean);

    return {
      workpoints,
      workpointsById: new Map(workpoints.map((item) => [item.id, item])),
      workpointsByName: new Map(workpoints.map((item) => [item.name, item])),
      beamLines,
      beamLinesByName: new Map(beamLines.map((item) => [item.name, item])),
      responsibility: input.responsibility || { team: [], crew: [] },
      workpointResponsibility: input.workpointResponsibility || {},
      structureTemplates: input.structureTemplates || {},
      structureTemplatesByWorkpoint: input.structureTemplatesByWorkpoint || {},
      structureTasks: input.structureTasks || {},
      structureTasksByStructure: buildStructureTaskMap(input.structureTasksByStructure || input.scheduleTasks),
      systemParams,
      baseDate: manualDates.reduce((result, item) => minDate(result, item), null) || new Date(Date.UTC(2025, 0, 1)),
    };
  }

  function normalizeTaskTemplate(row) {
    return {
      name: row.name || row.taskName || "施工任务",
      taskOrder: row.taskOrder,
      prev: row.prev || "",
      relation: row.relation || "FS",
      gap: row.gap ?? "0",
      qty: row.qty ?? "1",
      unit: row.unit || "项",
      craft: row.craft || "",
      metric: row.metric || "",
      crew: row.crew || row.subjectName || "",
      duration: row.duration || "",
    };
  }

  function buildStructureTaskMap(source) {
    const map = new Map();
    if (!source) return map;

    if (Array.isArray(source)) {
      source.forEach((row) => {
        if (!row?.structureId) return;
        const key = `${row.workpointId || ""}|${row.structureId}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(normalizeTaskTemplate(row));
      });
      map.forEach((rows) => rows.sort((a, b) => Number(a.taskOrder || 0) - Number(b.taskOrder || 0)));
      return map;
    }

    Object.entries(source).forEach(([key, rows]) => {
      if (!Array.isArray(rows)) return;
      map.set(key, rows.map(normalizeTaskTemplate));
    });
    return map;
  }

  function taskTemplatesForStructure(ctx, workpoint, structure) {
    const specific =
      ctx.structureTasksByStructure.get(`${workpoint.id}|${structure.id}`) ||
      ctx.structureTasksByStructure.get(`|${structure.id}`) ||
      ctx.structureTasksByStructure.get(structure.id);
    if (specific?.length) return specific;
    return asArray(ctx.structureTasks[inferTaskKind(structure, workpoint.kind)]);
  }

  function validateProjectWorkpoints(ctx, issues) {
    ctx.workpoints.forEach((workpoint) => {
      if (!workpoint.startDateValid) {
        issues.push(makeIssue({
          level: "error",
          module: "project-workpoint",
          row: workpoint.index,
          levelName: "项目级",
          nodeName: "垫丰武高速公路工程TJ00标",
          moduleName: "工点推进顺序",
          message: `${workpoint.name} 的开工时间格式不合法，请使用 YYYY-MM-DD 或 2025年4月1日。`,
          nodeId: "project-root",
        }));
      }
    });
  }

  function validateBeamLines(ctx, issues) {
    const names = new Set(ctx.beamLines.map((item) => item.name));
    const prevMap = new Map(ctx.beamLines.map((item) => [item.name, item.prev]));

    ctx.beamLines.forEach((line) => {
      if (!line.transferValid) {
        issues.push(makeIssue({
          level: "error",
          module: "beam",
          row: line.index,
          levelName: "项目级",
          nodeName: "桥梁工程",
          moduleName: "架梁施工顺序",
          message: `${line.name} 的转场时间必须是非负整数。`,
          nodeId: "bridge",
        }));
      }
      if (!line.startDateValid) {
        issues.push(makeIssue({
          level: "error",
          module: "beam",
          row: line.index,
          levelName: "项目级",
          nodeName: "桥梁工程",
          moduleName: "架梁施工顺序",
          message: `${line.name} 的开始架梁时间格式不合法。`,
          nodeId: "bridge",
        }));
      }
      if (!line.startPier || !line.endPier) {
        issues.push(makeIssue({
          level: "error",
          module: "beam",
          row: line.index,
          levelName: "项目级",
          nodeName: "桥梁工程",
          moduleName: "架梁施工顺序",
          message: `${line.name} 必须配置架梁起点和终点。`,
          nodeId: "bridge",
        }));
      }
      if (!line.resource) {
        issues.push(makeIssue({
          level: "error",
          module: "beam",
          row: line.index,
          levelName: "项目级",
          nodeName: "桥梁工程",
          moduleName: "架梁施工顺序",
          message: `${line.name} 必须配置架桥资源。`,
          nodeId: "bridge",
        }));
      }
      if (line.prev && !names.has(line.prev)) {
        issues.push(makeIssue({
          level: "error",
          module: "beam",
          row: line.index,
          levelName: "项目级",
          nodeName: "桥梁工程",
          moduleName: "架梁施工顺序",
          message: `${line.name} 的前置架设区段不存在。`,
          nodeId: "bridge",
        }));
      }
    });

    ctx.beamLines.forEach((line) => {
      const visited = new Set();
      let cursor = line.name;
      while (prevMap.get(cursor)) {
        cursor = prevMap.get(cursor);
        if (visited.has(cursor)) {
          issues.push(makeIssue({
            level: "error",
            module: "beam",
            row: line.index,
            levelName: "项目级",
            nodeName: "桥梁工程",
            moduleName: "架梁施工顺序",
            message: `${line.name} 所在架梁方向链存在循环依赖。`,
            nodeId: "bridge",
          }));
          break;
        }
        visited.add(cursor);
      }
    });

    const byResource = new Map();
    ctx.beamLines.forEach((line) => {
      if (!byResource.has(line.resource)) byResource.set(line.resource, []);
      byResource.get(line.resource).push(line);
    });
    byResource.forEach((rows, resource) => {
      const roots = rows.filter((line) => !line.prev);
      if (rows.length > 1 && roots.length > 1) {
        issues.push(makeIssue({
          level: "warning",
          module: "beam",
          row: roots[1].index,
          levelName: "项目级",
          nodeName: "桥梁工程",
          moduleName: "架梁施工顺序",
          message: `${resource} 存在多条无前置架设区段的方向，算法将按开始时间和线路顺序串行，但建议显式确认资源顺序。`,
          nodeId: "bridge",
        }));
      }
    });
  }

  function validateResponsibility(ctx, issues) {
    const teamRows = asArray(ctx.responsibility.team);

    ctx.workpoints.forEach((workpoint) => {
      const wpName = compactText(workpoint.name);
      const wpRange = workpoint.routeRange;
      const matches = teamRows.filter((row) => {
        const scope = compactText(row.scope);
        const rowRange = parseKRange(row.scope);
        return scope.includes(wpName) || rangeContains(rowRange, wpRange);
      });

      if (!matches.length) {
        issues.push(makeIssue({
          level: "error",
          module: "responsibility",
          row: workpoint.index,
          levelName: "项目级",
          nodeName: "垫丰武高速公路工程TJ00标",
          moduleName: "队伍/班组责任区域",
          message: `${workpoint.name} 未匹配到项目级责任队伍，发布前需要补充责任区域。`,
          nodeId: "project-root",
        }));
      }
      if (matches.length > 1) {
        issues.push(makeIssue({
          level: "warning",
          module: "responsibility",
          row: workpoint.index,
          levelName: "项目级",
          nodeName: "垫丰武高速公路工程TJ00标",
          moduleName: "队伍/班组责任区域",
          message: `${workpoint.name} 同时匹配到多个责任队伍，请确认边界是否重叠。`,
          nodeId: "project-root",
        }));
      }
    });

    teamRows.forEach((row, index) => {
      const rowRange = parseKRange(row.scope);
      if (!rowRange) return;
      teamRows.slice(index + 1).forEach((other) => {
        const otherRange = parseKRange(other.scope);
        if (!otherRange || !rangeOverlaps(rowRange, otherRange)) return;
        issues.push(makeIssue({
          level: "warning",
          module: "responsibility",
          row: index,
          levelName: "项目级",
          nodeName: "垫丰武高速公路工程TJ00标",
          moduleName: "队伍/班组责任区域",
          message: `${row.name} 与 ${other.name} 的里程责任范围存在重叠，请确认是否允许。`,
          nodeId: "project-root",
        }));
      });
    });

    asArray(ctx.responsibility.crew).forEach((row, index) => {
      if (!row.direction) {
        issues.push(makeIssue({
          level: "error",
          module: "responsibility",
          row: index,
          levelName: "项目级",
          nodeName: "垫丰武高速公路工程TJ00标",
          moduleName: "队伍/班组责任区域",
          message: `${row.name} 的施工方向不可为空。`,
          nodeId: "project-root",
        }));
      }
    });
  }

  function validateStructureTaskTemplates(ctx, issues) {
    Object.entries(ctx.structureTasks).forEach(([kind, tasks]) => {
      const names = new Set(asArray(tasks).map((task) => task.name));
      asArray(tasks).forEach((task, index) => {
        const moduleName = `结构任务项拆解(${kind})`;
        if (index === 0 && task.prev) {
          issues.push(makeIssue({
            level: "error",
            module: "task",
            row: index,
            levelName: "工点级",
            nodeName: "任务模板",
            moduleName,
            message: `${task.name} 是首任务，不应设置前置任务。`,
            nodeId: "project-root",
          }));
        }
        if (index > 0 && !task.prev) {
          issues.push(makeIssue({
            level: "error",
            module: "task",
            row: index,
            levelName: "工点级",
            nodeName: "任务模板",
            moduleName,
            message: `${task.name} 不是首任务，需要设置前置任务。`,
            nodeId: "project-root",
          }));
        }
        if (task.prev && !names.has(task.prev)) {
          issues.push(makeIssue({
            level: "error",
            module: "task",
            row: index,
            levelName: "工点级",
            nodeName: "任务模板",
            moduleName,
            message: `${task.name} 的前置任务 ${task.prev} 不在同一结构对象任务拆解内。`,
            nodeId: "project-root",
          }));
        }
        if (task.relation && task.relation !== "FS") {
          issues.push(makeIssue({
            level: "error",
            module: "task",
            row: index,
            levelName: "工点级",
            nodeName: "任务模板",
            moduleName,
            message: `${task.name} 当前关系类型为 ${task.relation}，MVP 版本仅支持 FS。`,
            nodeId: "project-root",
          }));
        }
        if (!parseNonNegativeInteger(task.gap).valid) {
          issues.push(makeIssue({
            level: "error",
            module: "task",
            row: index,
            levelName: "工点级",
            nodeName: "任务模板",
            moduleName,
            message: `${task.name} 的间隔必须是非负整数。`,
            nodeId: "project-root",
          }));
        }
        if (!task.qty || !task.metric || !task.craft || !task.crew) {
          issues.push(makeIssue({
            level: "warning",
            module: "task",
            row: index,
            levelName: "工点级",
            nodeName: "任务模板",
            moduleName,
            message: `${task.name} 缺少形象进度量、进度指标、施工工艺或作业班组。`,
            nodeId: "project-root",
          }));
        }
      });
    });
  }

  function validateStructureTrees(ctx, issues) {
    ctx.workpoints.forEach((workpoint) => {
      const tree = structureTreeForWorkpoint(ctx, workpoint);
      const leaves = leafStructures(tree);
      if (!leaves.length) {
        issues.push(makeIssue({
          level: "error",
          module: "task",
          row: workpoint.index,
          levelName: "工点级",
          nodeName: workpoint.name,
          moduleName: "结构对象",
          message: `${workpoint.name} 未配置可施工结构对象。`,
          nodeId: workpoint.id,
        }));
        return;
      }

      leaves.forEach((leaf, index) => {
        if (!taskTemplatesForStructure(ctx, workpoint, leaf).length) {
          issues.push(makeIssue({
            level: "error",
            module: "task",
            row: index,
            levelName: "工点级",
            nodeName: workpoint.name,
            moduleName: "结构任务项拆解",
            message: `${leaf.name} 未匹配到可施工任务模板。`,
            nodeId: workpoint.id,
          }));
        }
      });
    });
  }

  function validateConfig(ctx, mode) {
    const issues = [];
    validateProjectWorkpoints(ctx, issues);
    validateBeamLines(ctx, issues);
    validateResponsibility(ctx, issues);

    if (mode !== "save") {
      validateStructureTaskTemplates(ctx, issues);
      validateStructureTrees(ctx, issues);
    }

    return dedupeIssues(issues);
  }

  function createNetwork(ctx, issues) {
    const nodes = new Map();
    const relations = [];
    const relationKeys = new Set();
    let nodeSeq = 1;

    const taskIndex = {
      byWorkpoint: new Map(),
      byWorkpointAndStructure: new Map(),
      byWorkpointCrewTask: new Map(),
      beamTasksByWorkpoint: new Map(),
    };

    function nextId(prefix) {
      const id = `${prefix}-${nodeSeq}`;
      nodeSeq += 1;
      return id;
    }

    function addNode(node) {
      nodes.set(node.id, node);
      return node;
    }

    function addRelation(from, to, source, lagDays = 0, relationType = "FS") {
      if (!from || !to || from === to || !nodes.has(from) || !nodes.has(to)) return null;
      const lag = Math.max(0, Number(lagDays || 0));
      const key = `${from}->${to}:${source}:${lag}`;
      if (relationKeys.has(key)) return null;
      relationKeys.add(key);
      const relation = { from, to, relationType, lagDays: lag, source };
      relations.push(relation);
      return relation;
    }

    function indexTask(task) {
      if (!taskIndex.byWorkpoint.has(task.workpointId)) taskIndex.byWorkpoint.set(task.workpointId, []);
      taskIndex.byWorkpoint.get(task.workpointId).push(task);

      const structureKey = `${task.workpointId}|${task.structureId}`;
      if (!taskIndex.byWorkpointAndStructure.has(structureKey)) taskIndex.byWorkpointAndStructure.set(structureKey, []);
      taskIndex.byWorkpointAndStructure.get(structureKey).push(task);

      const crewTaskKey = `${task.workpointId}|${task.crew}|${task.taskName}`;
      if (!taskIndex.byWorkpointCrewTask.has(crewTaskKey)) taskIndex.byWorkpointCrewTask.set(crewTaskKey, []);
      taskIndex.byWorkpointCrewTask.get(crewTaskKey).push(task);

      if (task.isBeamTask) {
        if (!taskIndex.beamTasksByWorkpoint.has(task.workpointId)) taskIndex.beamTasksByWorkpoint.set(task.workpointId, []);
        taskIndex.beamTasksByWorkpoint.get(task.workpointId).push(task);
      }
    }

    function workpointStartId(workpoint) {
      return `control-workpoint-start-${workpoint.id}`;
    }

    function addWorkpointStartNodes() {
      ctx.workpoints.forEach((workpoint) => {
        addNode({
          id: workpointStartId(workpoint),
          nodeType: "control",
          controlType: "workpointStart",
          name: `${workpoint.name}虚拟开始`,
          workpointId: workpoint.id,
          workpointName: workpoint.name,
          durationDays: 0,
          anchorDate: workpoint.startDate,
          anchorText: workpoint.start ? String(workpoint.start) : "",
        });
      });
    }

    function addTaskInstances() {
      ctx.workpoints.forEach((workpoint) => {
        const leaves = leafStructures(ctx.structureTemplates[workpoint.kind]);
        leaves.forEach((structure, structureOrder) => {
          const taskKind = inferTaskKind(structure, workpoint.kind);
          const taskTemplates = asArray(ctx.structureTasks[taskKind]);
          const createdTasks = [];

          taskTemplates.forEach((template, taskOrder) => {
            const task = {
              id: nextId("task"),
              nodeType: "task",
              activityCode: `${workpoint.id}-${structure.id}-${taskOrder + 1}`,
              name: `${workpoint.name}/${structure.name}/${template.name}`,
              taskName: template.name,
              workpointId: workpoint.id,
              workpointName: workpoint.name,
              workpointKind: workpoint.kind,
              discipline: workpoint.discipline,
              structureId: structure.id,
              structureName: structure.name,
              structureType: structure.type,
              parentStructureId: structure.parentId,
              parentStructureName: structure.parentName,
              structureOrder,
              taskOrder,
              taskKind,
              qty: template.qty,
              unit: template.unit,
              craft: template.craft,
              metric: template.metric,
              crew: template.crew || "未指定班组",
              durationDays: parseDurationDays(template),
              configuredGapDays: parseNonNegativeInteger(template.gap).value,
              isBeamTask: template.name.includes("架设") || String(template.craft || "").includes("架桥机"),
            };
            addNode(task);
            indexTask(task);
            createdTasks.push(task);
          });

          createdTasks.forEach((task, taskOrder) => {
            const template = taskTemplates[taskOrder];
            if (taskOrder === 0) {
              addRelation(workpointStartId(workpoint), task.id, "工点虚拟开始", 0);
              return;
            }

            const prevTask =
              createdTasks.find((item) => item.taskName === template.prev) ||
              createdTasks[taskOrder - 1];
            if (prevTask) {
              addRelation(prevTask.id, task.id, "结构对象内部逻辑", task.configuredGapDays);
            }
          });
        });
      });
    }

    function structureTasks(workpointId, structureId) {
      return taskIndex.byWorkpointAndStructure.get(`${workpointId}|${structureId}`) || [];
    }

    function descendantLeaves(root) {
      return flattenStructureTree(asArray(root.children), 0, root).filter((node) => !node.children || !node.children.length);
    }

    function addBridgeStructureControlLogic() {
      ctx.workpoints.filter((workpoint) => workpoint.kind === "bridge").forEach((workpoint) => {
        const roots = asArray(ctx.structureTemplates.bridge);
        const supportControls = new Map();

        roots.forEach((root) => {
          const rootText = `${root.id || ""}${root.name || ""}${root.type || ""}`;
          const isSupport = rootText.includes("abutment") || rootText.includes("pier") || /墩|台/.test(rootText);
          const isSpan = rootText.includes("span") || rootText.includes("跨");
          if (!isSupport || isSpan) return;

          const lowerLeaves = descendantLeaves(root).filter((leaf) => inferTaskKind(leaf, "bridge") !== "girder" && inferTaskKind(leaf, "bridge") !== "deck");
          if (!lowerLeaves.length) return;

          const control = addNode({
            id: `control-lower-done-${workpoint.id}-${root.id}`,
            nodeType: "control",
            controlType: "lowerStructureDone",
            name: `${workpoint.name}/${root.name}下部结构完成`,
            workpointId: workpoint.id,
            workpointName: workpoint.name,
            structureId: root.id,
            structureName: root.name,
            durationDays: 0,
          });
          const supportNo = parseStructureNumber(root.name);
          if (supportNo !== null) supportControls.set(supportNo, control);

          lowerLeaves.forEach((leaf) => {
            const tasks = structureTasks(workpoint.id, leaf.id);
            const lastTask = tasks.at(-1);
            if (lastTask) addRelation(lastTask.id, control.id, "下部结构完成汇总", 0);
          });
        });

        roots.filter((root) => `${root.id}${root.name}${root.type}`.includes("span") || `${root.name}${root.type}`.includes("跨")).forEach((span) => {
          const spanNo = parseStructureNumber(span.name);
          if (spanNo === null) return;

          const leaves = descendantLeaves(span);
          const boxLeaf = leaves.find((leaf) => inferTaskKind(leaf, "bridge") === "girder");
          const deckLeaf = leaves.find((leaf) => inferTaskKind(leaf, "bridge") === "deck");
          const beamTask = structureTasks(workpoint.id, boxLeaf?.id).find((task) => task.isBeamTask);

          [spanNo - 1, spanNo].forEach((supportNo) => {
            const supportControl = supportControls.get(supportNo);
            if (supportControl && beamTask) {
              addRelation(supportControl.id, beamTask.id, "架梁前置条件：两端下部结构完成", 0);
            }
          });

          const boxTasks = structureTasks(workpoint.id, boxLeaf?.id);
          const deckTasks = structureTasks(workpoint.id, deckLeaf?.id);
          if (boxTasks.length && deckTasks.length) {
            addRelation(boxTasks.at(-1).id, deckTasks[0].id, "上部结构后续任务依赖架梁完成", 0);
          }
        });
      });
    }

    function directionForCrew(workpoint, crewName) {
      const rows = asArray(ctx.workpointResponsibility[workpoint.kind]?.crew);
      const exact = rows.find((row) => row.name === crewName && (
        row.plannedWorkpointId === workpoint.id
        || row.scope === workpoint.name
        || compactText(row.scope).includes(compactText(workpoint.name))
      ));
      return (exact || rows.find((row) => row.name === crewName))?.direction || "从小到大";
    }

    function taskSortByDirection(workpoint, crewName) {
      const multiplier = directionForCrew(workpoint, crewName).includes("大到小") ? -1 : 1;
      return (a, b) => multiplier * (a.structureOrder - b.structureOrder || a.taskOrder - b.taskOrder);
    }

    function addIntraWorkpointCrewFlow() {
      ctx.workpoints.forEach((workpoint) => {
        const tasks = (taskIndex.byWorkpoint.get(workpoint.id) || []).filter((task) => !task.isBeamTask);
        const groups = new Map();
        tasks.forEach((task) => {
          const key = `${task.crew}|${task.taskName}`;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(task);
        });

        groups.forEach((rows) => {
          if (rows.length < 2) return;
          rows.sort(taskSortByDirection(workpoint, rows[0].crew));
          rows.forEach((task, index) => {
            if (index > 0) addRelation(rows[index - 1].id, task.id, "工点内班组流水", 0);
          });
        });
      });
    }

    function workpointOrderForDiscipline(discipline) {
      return ctx.workpoints
        .filter((workpoint) => workpoint.discipline === discipline)
        .sort((a, b) => a.index - b.index);
    }

    function addCrossWorkpointCrewFlow() {
      const disciplines = [...new Set(ctx.workpoints.map((workpoint) => workpoint.discipline))];
      disciplines.forEach((discipline) => {
        const ordered = workpointOrderForDiscipline(discipline);
        ordered.forEach((workpoint, index) => {
          if (index === 0) return;
          const prevWorkpoint = ordered[index - 1];
          const prevTasks = (taskIndex.byWorkpoint.get(prevWorkpoint.id) || []).filter((task) => !task.isBeamTask);
          const currentTasks = (taskIndex.byWorkpoint.get(workpoint.id) || []).filter((task) => !task.isBeamTask);
          const prevKeys = new Map();

          prevTasks.forEach((task) => {
            const key = `${task.crew}|${task.taskName}`;
            if (!prevKeys.has(key)) prevKeys.set(key, []);
            prevKeys.get(key).push(task);
          });

          currentTasks.forEach((task) => {
            const key = `${task.crew}|${task.taskName}`;
            const upstream = prevKeys.get(key);
            if (!upstream?.length) return;
            upstream.sort((a, b) => a.structureOrder - b.structureOrder || a.taskOrder - b.taskOrder);
            addRelation(upstream.at(-1).id, task.id, "跨工点班组流水", workpoint.gapDays);
          });
        });
      });
    }

    function parsePierWorkpointHints(pierName) {
      const side = String(pierName || "").includes("左幅") ? "左幅" : String(pierName || "").includes("右幅") ? "右幅" : "";
      const compact = compactText(pierName);
      const workpoint = ctx.workpoints
        .filter((item) => item.kind === "bridge")
        .find((item) => compact.includes(compactText(item.name)) || compactText(item.name).includes(compact.replace(/\d+#.*/, "")));
      return { side, workpoint };
    }

    function resolveBeamRoute(line) {
      const start = parsePierWorkpointHints(line.startPier);
      const end = parsePierWorkpointHints(line.endPier);
      const bridgeWorkpoints = ctx.workpoints.filter((workpoint) => workpoint.kind === "bridge");
      if (!start.workpoint || !end.workpoint) {
        return [...bridgeWorkpoints].sort((a, b) => a.mile - b.mile || a.index - b.index);
      }

      const direction = start.workpoint.mile <= end.workpoint.mile ? 1 : -1;
      const low = Math.min(start.workpoint.mile, end.workpoint.mile);
      const high = Math.max(start.workpoint.mile, end.workpoint.mile);
      const side = start.side && start.side === end.side ? start.side : "";
      return bridgeWorkpoints
        .filter((workpoint) => workpoint.mile >= low && workpoint.mile <= high)
        .filter((workpoint) => !side || workpoint.name.includes(side))
        .sort((a, b) => direction * (a.mile - b.mile || a.index - b.index));
    }

    function addBeamStartAnchor(line, firstTask) {
      if (!line.startDate || !firstTask) return;
      const control = addNode({
        id: `control-beam-start-${line.id}`,
        nodeType: "control",
        controlType: "beamStart",
        name: `${line.name}开始架梁锚点`,
        durationDays: 0,
        anchorDate: line.startDate,
        anchorText: line.startTime,
      });
      addRelation(control.id, firstTask.id, "开始架梁时间锚点", 0);
    }

    function addPassageControl(workpoint) {
      const id = `control-passage-${workpoint.id}`;
      if (nodes.has(id)) return nodes.get(id);

      const tasks = taskIndex.byWorkpoint.get(workpoint.id) || [];
      const lastConditionTask =
        tasks.findLast?.((task) => workpoint.kind === "tunnel" ? task.taskName.includes("二次衬砌") : task.taskName.includes("路基填筑")) ||
        [...tasks].reverse().find((task) => workpoint.kind === "tunnel" ? task.taskName.includes("二次衬砌") : task.taskName.includes("路基填筑")) ||
        tasks.at(-1);
      const lag = workpoint.kind === "tunnel" ? ctx.systemParams.tunnelPassageLagDays : ctx.systemParams.roadPassageLagDays;
      const control = addNode({
        id,
        nodeType: "control",
        controlType: "passageReady",
        name: `${workpoint.name}具备通行条件`,
        workpointId: workpoint.id,
        workpointName: workpoint.name,
        durationDays: 0,
      });
      if (lastConditionTask) addRelation(lastConditionTask.id, control.id, "通行条件定义", lag);
      return control;
    }

    function addBeamSequenceAndResourceLogic() {
      const lineRuntime = new Map();

      function firstUncoveredTask(currentRuntime, prevRuntime) {
        if (!currentRuntime?.tasks?.length) return null;
        const covered = new Set(prevRuntime?.tasks?.map((task) => task.id) || []);
        return currentRuntime.tasks.find((task) => !covered.has(task.id)) || null;
      }

      ctx.beamLines.forEach((line) => {
        const route = resolveBeamRoute(line);
        const lineTasks = route.flatMap((workpoint) => taskIndex.beamTasksByWorkpoint.get(workpoint.id) || []);
        lineTasks.forEach((task, index) => {
          if (index > 0) addRelation(lineTasks[index - 1].id, task.id, "架梁方向内部顺序", 0);
        });

        addBeamStartAnchor(line, lineTasks[0]);
        lineRuntime.set(line.name, {
          line,
          route,
          tasks: lineTasks,
          first: lineTasks[0],
          last: lineTasks.at(-1),
        });
      });

      ctx.beamLines.forEach((line) => {
        if (!line.prev) return;
        const prevRuntime = lineRuntime.get(line.prev);
        const currentRuntime = lineRuntime.get(line.name);
        const targetTask = firstUncoveredTask(currentRuntime, prevRuntime);
        if (prevRuntime?.last && targetTask) {
          addRelation(prevRuntime.last.id, targetTask.id, "前置架设区段", line.transferDays);
        }
      });

      const byResource = new Map();
      ctx.beamLines.forEach((line) => {
        if (!byResource.has(line.resource)) byResource.set(line.resource, []);
        byResource.get(line.resource).push(line);
      });
      byResource.forEach((lines) => {
        lines
          .sort((a, b) => {
            const aTime = a.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const bTime = b.startDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
            return aTime - bTime || a.index - b.index;
          })
          .forEach((line, index, ordered) => {
            if (index === 0) return;
            const prevRuntime = lineRuntime.get(ordered[index - 1].name);
            const currentRuntime = lineRuntime.get(line.name);
            const targetTask = firstUncoveredTask(currentRuntime, prevRuntime);
            if (prevRuntime?.last && targetTask) {
              addRelation(prevRuntime.last.id, targetTask.id, "架桥资源串行", line.transferDays);
            }
          });
      });

      lineRuntime.forEach((runtime) => {
        runtime.route.forEach((workpoint, index) => {
          if (index === 0) return;
          const prevBridge = runtime.route[index - 1];
          const targetBeamTask = (taskIndex.beamTasksByWorkpoint.get(workpoint.id) || [])[0];
          if (!targetBeamTask) return;
          const low = Math.min(prevBridge.mile, workpoint.mile);
          const high = Math.max(prevBridge.mile, workpoint.mile);
          ctx.workpoints
            .filter((item) => item.kind === "tunnel" || item.kind === "road")
            .filter((item) => item.mile > low && item.mile < high)
            .forEach((middleWorkpoint) => {
              const control = addPassageControl(middleWorkpoint);
              addRelation(control.id, targetBeamTask.id, "架梁跨工点通行条件", 0);
            });
        });
      });
    }

    addWorkpointStartNodes();
    addTaskInstances();
    addBridgeStructureControlLogic();
    addIntraWorkpointCrewFlow();
    addCrossWorkpointCrewFlow();
    addBeamSequenceAndResourceLogic();

    return { nodes, relations, taskIndex, issues };
  }

  function forwardSchedule(network, baseDate) {
    const nodes = network.nodes;
    const outgoing = new Map();
    const incoming = new Map();
    const indegree = new Map();

    nodes.forEach((_, id) => {
      outgoing.set(id, []);
      incoming.set(id, []);
      indegree.set(id, 0);
    });

    network.relations.forEach((relation) => {
      outgoing.get(relation.from)?.push(relation);
      incoming.get(relation.to)?.push(relation);
      indegree.set(relation.to, (indegree.get(relation.to) || 0) + 1);
    });

    const queue = [...nodes.keys()].filter((id) => indegree.get(id) === 0).sort();
    const order = [];
    while (queue.length) {
      const id = queue.shift();
      order.push(id);
      outgoing.get(id).forEach((relation) => {
        const next = relation.to;
        indegree.set(next, indegree.get(next) - 1);
        if (indegree.get(next) === 0) {
          queue.push(next);
          queue.sort();
        }
      });
    }

    if (order.length !== nodes.size) {
      return {
        hasCycle: true,
        cycleNodeIds: [...nodes.keys()].filter((id) => indegree.get(id) > 0),
        scheduledNodes: new Map(),
      };
    }

    const scheduledNodes = new Map();
    order.forEach((id) => {
      const node = nodes.get(id);
      let startDate = node.anchorDate || baseDate;
      incoming.get(id).forEach((relation) => {
        const predecessor = scheduledNodes.get(relation.from);
        if (!predecessor) return;
        startDate = maxDate(startDate, addDays(predecessor.finishDate, relation.lagDays));
      });
      const durationDays = Math.max(0, Number(node.durationDays || 0));
      const finishDate = durationDays > 0 ? addDays(startDate, durationDays) : startDate;
      scheduledNodes.set(id, {
        ...node,
        startDate,
        finishDate,
        startText: formatDate(startDate),
        finishText: formatDate(finishDate),
        predecessorSources: incoming.get(id).map((relation) => relation.source),
      });
    });

    return { hasCycle: false, cycleNodeIds: [], scheduledNodes };
  }

  function summarizeSchedule(network, scheduledNodes) {
    const rows = [...scheduledNodes.values()]
      .filter((node) => node.nodeType === "task")
      .sort((a, b) => a.startDate - b.startDate || a.finishDate - b.finishDate || a.activityCode.localeCompare(b.activityCode))
      .map((node) => ({
        id: node.id,
        activityCode: node.activityCode,
        workpointId: node.workpointId,
        workpointName: node.workpointName,
        structureName: node.structureName,
        taskName: node.taskName,
        crew: node.crew,
        durationDays: node.durationDays,
        planStart: node.startText,
        planFinish: node.finishText,
        predecessorSources: uniqueBy(node.predecessorSources, (item) => item).join("、"),
      }));

    const byWorkpoint = new Map();
    rows.forEach((row) => {
      if (!byWorkpoint.has(row.workpointId)) {
        byWorkpoint.set(row.workpointId, {
          workpointId: row.workpointId,
          workpointName: row.workpointName,
          planStart: row.planStart,
          planFinish: row.planFinish,
          taskCount: 0,
        });
      }
      const summary = byWorkpoint.get(row.workpointId);
      summary.taskCount += 1;
      if (row.planStart < summary.planStart) summary.planStart = row.planStart;
      if (row.planFinish > summary.planFinish) summary.planFinish = row.planFinish;
    });

    return {
      rows,
      workpointResults: [...byWorkpoint.values()].sort((a, b) => a.planStart.localeCompare(b.planStart)),
      stats: {
        taskCount: rows.length,
        controlNodeCount: [...network.nodes.values()].filter((node) => node.nodeType === "control").length,
        relationCount: network.relations.length,
        projectStart: rows[0]?.planStart || "",
        projectFinish: rows.reduce((finish, row) => (row.planFinish > finish ? row.planFinish : finish), rows[0]?.planFinish || ""),
      },
    };
  }

  function run(input = {}, options = {}) {
    const mode = options.mode || "check";
    const ctx = standardizeConfig(input);
    const issues = validateConfig(ctx, mode);

    if (mode === "save") {
      return {
        ok: !issues.some((issue) => issue.level === "error"),
        mode,
        issues,
        stats: null,
        scheduleRows: [],
        workpointResults: [],
        relations: [],
        nodes: [],
      };
    }

    const network = createNetwork(ctx, issues);
    const forward = forwardSchedule(network, ctx.baseDate);
    if (forward.hasCycle) {
      issues.push(makeIssue({
        level: "error",
        module: "network",
        row: 0,
        levelName: "全局网络",
        nodeName: "项目计划",
        moduleName: "任务网络",
        message: `任务网络存在循环依赖，涉及 ${forward.cycleNodeIds.length} 个节点，请检查前置关系、班组流水或架梁顺序。`,
        nodeId: "project-root",
      }));
    }

    const summary = forward.hasCycle
      ? { rows: [], workpointResults: [], stats: { taskCount: 0, controlNodeCount: network.nodes.size, relationCount: network.relations.length, projectStart: "", projectFinish: "" } }
      : summarizeSchedule(network, forward.scheduledNodes);
    const finalIssues = dedupeIssues(issues);

    return {
      ok: !finalIssues.some((issue) => issue.level === "error"),
      mode,
      issues: finalIssues,
      stats: summary.stats,
      scheduleRows: summary.rows,
      workpointResults: summary.workpointResults,
      relations: network.relations,
      nodes: [...network.nodes.values()],
      scheduledNodes: forward.scheduledNodes,
      cycleNodeIds: forward.cycleNodeIds,
    };
  }

  const ProjectScheduleEngine = {
    run,
    standardizeConfig,
    parseDate,
    formatDate,
  };

  global.ProjectScheduleEngine = ProjectScheduleEngine;
  if (typeof module !== "undefined" && module.exports) module.exports = ProjectScheduleEngine;
})(typeof window !== "undefined" ? window : globalThis);
