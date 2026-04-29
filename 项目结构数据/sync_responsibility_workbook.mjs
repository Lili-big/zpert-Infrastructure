import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workbookPath = path.join(__dirname, "责任区域配置.xlsx");
const outputDir = path.join(__dirname, "output");
const csvPath = path.join(outputDir, "construction_units.csv");
const projectStructurePath = path.join(outputDir, "project_structure_data.json");
const jsonPath = path.join(outputDir, "responsibility_area_data.json");
const jsPath = path.join(outputDir, "responsibility_area_data.js");

const SHEETS = {
  resources: "队伍班组基础数据",
  assignments: "责任区域设置",
  directions: "班组施工方向",
  beamDirections: "架梁方向设置",
  productivity: "理论工效配置",
  workpointOrder: "工点推进顺序",
  scheduleTasks: "计划排程任务配置",
};

const RESOURCE_HEADERS = [
  "作业主体ID",
  "施工队伍ID",
  "施工队伍名称",
  "班组ID",
  "班组名称",
  "作业主体类型",
  "展示名称",
  "是否启用",
  "备注",
];

const ASSIGNMENT_HEADERS = [
  "节点ID",
  "父节点ID",
  "工点ID",
  "工点名称",
  "计划工点ID",
  "计划工点名称",
  "名称",
  "类型",
  "层级",
  "编码",
  "是否末级施工单元",
  "施工单元ID",
  "施工队伍ID",
  "施工队伍名称",
  "作业主体ID",
  "作业主体名称",
  "同步状态",
  "校验结果",
  "原始路径",
];

const DIRECTION_HEADERS = [
  "方向ID",
  "计划工点ID",
  "计划工点名称",
  "作业主体ID",
  "作业主体名称",
  "施工队伍ID",
  "施工队伍名称",
  "施工范围",
  "主要工程内容",
  "施工方向",
  "同步状态",
  "备注",
];

const BEAM_DIRECTION_HEADERS = [
  "架梁方向ID",
  "架梁方向名称",
  "起点墩台",
  "终点墩台",
  "架桥资源",
  "转场时间(天)",
  "前置架梁方向",
  "计划开始时间",
  "是否启用",
  "同步状态",
  "校验结果",
  "备注",
];

const PRODUCTIVITY_HEADERS = [
  "工效ID",
  "专业",
  "结构树类型",
  "施工工序",
  "默认施工工艺",
  "工效",
  "工效单位",
  "形象进度单位",
  "匹配关键字",
  "是否启用",
  "备注",
];

const WORKPOINT_ORDER_HEADERS = [
  "工点ID",
  "专业",
  "工点名称",
  "前序工点",
  "间隔天数",
  "手动开始时间",
  "排序号",
  "同步状态",
  "备注",
];

const TASK_CONFIG_HEADERS = [
  "配置ID",
  "工点ID",
  "工点名称",
  "结构对象ID",
  "结构对象名称",
  "任务序号",
  "任务名称",
  "前置任务",
  "关系类型",
  "间隔天数",
  "形象进度量",
  "单位",
  "施工工艺",
  "工效",
  "作业班组",
  "工期",
  "同步状态",
  "备注",
];

const DEFAULT_PRODUCTIVITY = [
  ["bridge-pile-rotary", "桥梁专业", "桩基", "桩基", "旋挖钻", "2", "天/根", "根", "桩基", "是", "桩基默认按旋挖钻"],
  ["bridge-pile-circulation", "桥梁专业", "桩基", "桩基", "回旋钻", "2", "天/根", "根", "桩基", "是", ""],
  ["bridge-pile-impact", "桥梁专业", "桩基", "桩基", "冲击钻", "2", "天/根", "根", "桩基", "是", ""],
  ["bridge-spread-foundation", "桥梁专业", "扩大基础", "扩大基础", "--", "15", "天/个", "个", "扩大基础", "是", ""],
  ["bridge-tie-beam", "桥梁专业", "桩系梁", "桩系梁", "--", "3", "天/个", "个", "桩系梁", "是", ""],
  ["bridge-footing", "桥梁专业", "承台", "承台", "--", "7", "天/个", "个", "承台", "是", ""],
  ["bridge-middle-tie-beam", "桥梁专业", "中系梁", "中系梁", "--", "4", "天/个", "个", "中系梁", "是", ""],
  ["bridge-pier-integral", "桥梁专业", "墩身", "墩身", "整体式浇筑", "20", "天/个", "个", "墩身|桥台", "是", "墩身默认按整体式浇筑"],
  ["bridge-pier-climbing", "桥梁专业", "墩身", "墩身", "爬模施工", "4", "天/节", "节", "墩身", "是", ""],
  ["bridge-pier-slip", "桥梁专业", "墩身", "墩身", "滑模施工", "6", "天/节", "节", "墩身", "是", ""],
  ["bridge-pier-turnover", "桥梁专业", "墩身", "墩身", "翻模施工", "12", "天/节", "节", "墩身", "是", ""],
  ["bridge-abutment", "桥梁专业", "桥台", "桥台", "--", "15", "天/个", "个", "桥台", "是", ""],
  ["bridge-cap", "桥梁专业", "盖梁", "盖梁", "--", "10", "天/个", "个", "盖梁", "是", ""],
  ["bridge-beam-prefab", "桥梁专业", "制梁", "制梁", "--", "35", "天/片", "片", "制梁", "是", ""],
  ["bridge-beam-erection", "桥梁专业", "架梁", "架梁", "--", "0.2", "天/片", "片", "架梁|梁片|简支箱梁", "是", ""],
  ["bridge-cip-0", "桥梁专业", "现浇连续梁", "0号块", "0号块", "45", "天/块", "块", "0#块|0号块", "是", ""],
  ["bridge-cip-standard", "桥梁专业", "现浇连续梁", "标准块", "标准块", "10", "天/块", "块", "标准块|T构块", "是", ""],
  ["bridge-cip-close", "桥梁专业", "现浇连续梁", "合拢段", "合拢段", "15", "天/块", "块", "合拢段", "是", ""],
  ["bridge-cip-straight", "桥梁专业", "现浇连续梁", "直线段", "直线段", "35", "天/块", "块", "直线段", "是", ""],
  ["bridge-cast-box", "桥梁专业", "现浇箱梁", "现浇箱梁", "--", "45", "天/联", "联", "现浇箱梁", "是", ""],
  ["bridge-steel-box", "桥梁专业", "钢箱梁", "钢箱梁", "--", "30", "天/片", "片", "钢箱梁", "是", ""],
  ["bridge-deck", "桥梁专业", "桥面系", "桥面系", "--", "30", "米/天", "米", "桥面系|桥面铺装|防撞护栏|伸缩缝", "是", ""],
  ["tunnel-excavate-i", "隧道专业", "开挖及初支", "开挖及初支", "I级围岩", "6", "m/天", "米", "开挖初支|I", "是", ""],
  ["tunnel-excavate-ii", "隧道专业", "开挖及初支", "开挖及初支", "II级围岩", "5", "m/天", "米", "开挖初支|II", "是", ""],
  ["tunnel-excavate-iii", "隧道专业", "开挖及初支", "开挖及初支", "III级围岩", "4", "m/天", "米", "开挖初支|III", "是", ""],
  ["tunnel-excavate-iv", "隧道专业", "开挖及初支", "开挖及初支", "IV级围岩", "2.3", "m/天", "米", "开挖初支|IV", "是", ""],
  ["tunnel-excavate-v", "隧道专业", "开挖及初支", "开挖及初支", "V级围岩", "1.3", "m/天", "米", "开挖初支|V", "是", ""],
  ["tunnel-excavate-vi", "隧道专业", "开挖及初支", "开挖及初支", "VI级围岩", "0.7", "m/天", "米", "开挖初支|VI", "是", ""],
  ["tunnel-portal", "隧道专业", "洞门", "洞门", "--", "45", "天/个", "个", "洞门", "是", ""],
];

const DEFAULT_RESOURCES = [
  ["team-bridge-1", "team-bridge-1", "桥梁1队", "", "", "队伍", "桥梁1队", "是", "可直接作为作业主体"],
  ["team-bridge-1-pile", "team-bridge-1", "桥梁1队", "pile", "桩基1工班", "队伍-班组", "桥梁1队 / 桩基1工班", "是", ""],
  ["team-bridge-1-structure", "team-bridge-1", "桥梁1队", "structure", "结构1工班", "队伍-班组", "桥梁1队 / 结构1工班", "是", ""],
  ["team-bridge-1-deck", "team-bridge-1", "桥梁1队", "deck", "桥面系工班", "队伍-班组", "桥梁1队 / 桥面系工班", "是", ""],
  ["team-bridge-2", "team-bridge-2", "桥梁2队", "", "", "队伍", "桥梁2队", "是", ""],
  ["team-bridge-2-pile", "team-bridge-2", "桥梁2队", "pile", "桩基2工班", "队伍-班组", "桥梁2队 / 桩基2工班", "是", ""],
  ["team-bridge-2-structure", "team-bridge-2", "桥梁2队", "structure", "结构2工班", "队伍-班组", "桥梁2队 / 结构2工班", "是", ""],
  ["team-tunnel-1", "team-tunnel-1", "隧道1队", "", "", "队伍", "隧道1队", "是", ""],
  ["team-tunnel-1-excavation", "team-tunnel-1", "隧道1队", "excavation", "隧道开挖班组", "队伍-班组", "隧道1队 / 隧道开挖班组", "是", ""],
  ["team-tunnel-1-lining", "team-tunnel-1", "隧道1队", "lining", "二衬班组", "队伍-班组", "隧道1队 / 二衬班组", "是", ""],
  ["team-road-1", "team-road-1", "路基1队", "", "", "队伍", "路基1队", "是", ""],
  ["team-road-1-earthwork", "team-road-1", "路基1队", "earthwork", "土石方班组", "队伍-班组", "路基1队 / 土石方班组", "是", ""],
  ["team-road-1-fill", "team-road-1", "路基1队", "fill", "填筑班组", "队伍-班组", "路基1队 / 填筑班组", "是", ""],
  ["team-road-1-protection", "team-road-1", "路基1队", "protection", "防护班组", "队伍-班组", "路基1队 / 防护班组", "是", ""],
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift() || [];
  return rows
    .filter((values) => values.some((value) => String(value || "").trim()))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function asText(value) {
  return String(value ?? "").trim();
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(asText) : [];
  } catch {
    return [];
  }
}

async function readProjectStructureData() {
  try {
    return JSON.parse(await fs.readFile(projectStructurePath, "utf8"));
  } catch {
    return {};
  }
}

function plannedWorkpoint(row) {
  const side = asText(row.side);
  const name = asText(row.work_point_name);
  const id = asText(row.work_point_id);
  const isBridge = `${row.professional_name}${name}`.includes("桥");
  if (isBridge && ["左幅", "右幅"].includes(side)) {
    return {
      id: `${id}-${side === "左幅" ? "left" : "right"}`,
      name: `${name}${side}`,
    };
  }
  return { id, name };
}

function levelType(index) {
  return ["项目", "专业", "工点", "子分部工程", "分项工程", "施工单元"][index] || "结构节点";
}

function buildStructureRows(csvRows) {
  const nodes = new Map();
  let order = 0;

  csvRows.forEach((row) => {
    const ids = parseJsonArray(row.path_ids_json);
    const names = parseJsonArray(row.path_names_json);
    const planned = plannedWorkpoint(row);
    const maxLevel = Math.min(ids.length, names.length);
    for (let index = 2; index < maxLevel; index += 1) {
      const pathIds = ids.slice(0, index + 1);
      const nodeId = pathIds.join(">");
      if (nodes.has(nodeId)) continue;
      const parentId = index > 2 ? ids.slice(0, index).join(">") : "";
      const isLeaf = index === maxLevel - 1 && asText(row.leaf_flag) === "1";
      nodes.set(nodeId, {
        nodeId,
        parentId,
        workpointId: asText(row.work_point_id),
        workpointName: asText(row.work_point_name),
        plannedWorkpointId: isLeaf ? planned.id : "",
        plannedWorkpointName: isLeaf ? planned.name : "",
        name: names[index] || "",
        type: isLeaf ? "施工单元" : levelType(index),
        level: index - 1,
        code: pathIds.slice(2).map((_, codeIndex) => codeIndex + 1).join("."),
        isLeaf: isLeaf ? "是" : "否",
        constructionUnitId: isLeaf ? asText(row.construction_unit_id) : "",
        rawPath: names.join(" / "),
        sourceOrder: order,
      });
      order += 1;
    }
  });

  return [...nodes.values()].sort((a, b) => a.sourceOrder - b.sourceOrder);
}

async function readExistingWorkbook() {
  try {
    await fs.access(workbookPath);
  } catch {
    return {};
  }

  const file = await FileBlob.load(workbookPath);
  const workbook = await SpreadsheetFile.importXlsx(file);
  const result = {};

  for (const sheetName of Object.values(SHEETS)) {
    try {
      const sheet = workbook.worksheets.getItem(sheetName);
      const range = sheet.getUsedRange(true);
      const values = range?.values || [];
      result[sheetName] = sheetValuesToObjects(values);
    } catch {
      result[sheetName] = [];
    }
  }
  return result;
}

function sheetValuesToObjects(values) {
  if (!values.length) return [];
  const headers = values[0].map(asText);
  return values.slice(1)
    .filter((row) => row.some((value) => asText(value)))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, asText(row[index])])));
}

function normalizeResources(existingRows) {
  const sourceRows = existingRows?.length
    ? existingRows
    : DEFAULT_RESOURCES.map((row) => Object.fromEntries(RESOURCE_HEADERS.map((header, index) => [header, row[index] || ""])));

  const seen = new Set();
  return sourceRows
    .map((row) => ({
      subjectId: asText(row["作业主体ID"]),
      teamId: asText(row["施工队伍ID"]),
      teamName: asText(row["施工队伍名称"]),
      crewId: asText(row["班组ID"]),
      crewName: asText(row["班组名称"]),
      type: asText(row["作业主体类型"]) || (asText(row["班组ID"]) ? "队伍-班组" : "队伍"),
      displayName: asText(row["展示名称"]) || (asText(row["班组名称"]) ? `${asText(row["施工队伍名称"])} / ${asText(row["班组名称"])}` : asText(row["施工队伍名称"])),
      enabled: asText(row["是否启用"]) || "是",
      note: asText(row["备注"]),
    }))
    .filter((row) => {
      if (!row.subjectId || !row.teamId || !row.teamName) return false;
      if (!["队伍", "队伍-班组"].includes(row.type)) return false;
      if (seen.has(row.subjectId)) return false;
      seen.add(row.subjectId);
      return true;
    });
}

function validateAssignment(row, resourcesBySubject, teamsById) {
  if (!row.teamId) return "";
  const team = teamsById.get(row.teamId);
  if (!team) return "施工队伍ID不在基础数据中";
  if (!row.subjectId) return "";
  const subject = resourcesBySubject.get(row.subjectId);
  if (!subject) return "作业主体ID不在基础数据中";
  if (subject.teamId !== row.teamId) return "作业主体所属队伍与施工队伍不一致";
  return "";
}

function syncAssignments(structureRows, existingRows, resources) {
  const oldByNodeId = new Map((existingRows || []).map((row) => [asText(row["节点ID"]), row]));
  const resourcesBySubject = new Map(resources.map((row) => [row.subjectId, row]));
  const teamsById = new Map(resources.filter((row) => row.type === "队伍").map((row) => [row.teamId, row]));

  const assignments = structureRows.map((node) => {
    const old = oldByNodeId.get(node.nodeId) || {};
    const oldTeamId = asText(old["施工队伍ID"]);
    const oldSubjectId = asText(old["作业主体ID"]);
    const team = teamsById.get(oldTeamId);
    const subject = resourcesBySubject.get(oldSubjectId);
    const assignment = {
      ...node,
      teamId: oldTeamId,
      teamName: team?.teamName || asText(old["施工队伍名称"]),
      subjectId: oldSubjectId,
      subjectName: subject?.displayName || asText(old["作业主体名称"]),
      syncStatus: oldByNodeId.has(node.nodeId) ? "已同步" : "新增",
    };
    assignment.validation = validateAssignment(assignment, resourcesBySubject, teamsById);
    return assignment;
  });

  applyParentAssignments(assignments, resourcesBySubject, teamsById);
  return assignments;
}

function applyParentAssignments(assignments, resourcesBySubject, teamsById) {
  const rowsByPrefix = assignments.filter((row) => row.isLeaf !== "是" && (row.teamId || row.subjectId));
  rowsByPrefix.forEach((parent) => {
    const subject = resourcesBySubject.get(parent.subjectId);
    const descendants = assignments.filter((row) => row.isLeaf === "是" && row.nodeId.startsWith(`${parent.nodeId}>`));
    descendants.forEach((leaf) => {
      if (parent.teamId) {
        leaf.teamId = parent.teamId;
        leaf.teamName = teamsById.get(parent.teamId)?.teamName || parent.teamName;
      }
      if (!parent.subjectId) {
        leaf.validation = validateAssignment(leaf, resourcesBySubject, teamsById);
        return;
      }
      if (!subject || subject.teamId !== leaf.teamId) {
        leaf.validation = "父节点作业主体与当前施工队伍不匹配";
        return;
      }
      leaf.subjectId = parent.subjectId;
      leaf.subjectName = subject.displayName;
      leaf.validation = "";
    });
  });
}

function leafAssignments(assignments) {
  return assignments.filter((row) => row.isLeaf === "是" && row.teamId);
}

function contentTypeForAssignment(row) {
  const parts = String(row.rawPath || "").split("/").map((part) => part.trim()).filter(Boolean);
  const parentPart = parts.length > 1 ? parts.at(-2) : "";
  const text = `${parentPart}${row.name || ""}`;
  const types = [
    "桩基",
    "扩大基础",
    "承台",
    "墩身",
    "桥台",
    "盖梁",
    "支座垫石",
    "简支箱梁",
    "现浇连续梁",
    "桥面铺装",
    "防撞护栏",
    "伸缩缝",
    "桥面系",
    "开挖初支",
    "二次衬砌",
    "仰拱",
    "清表",
    "路基填筑",
    "边坡防护",
  ];
  return types.find((type) => text.includes(type)) || parentPart || row.type || "施工单元";
}

function abutmentNumberMap(assignments) {
  const map = new Map();
  assignments.forEach((row) => {
    const text = `${row.name || ""}${row.rawPath || ""}`;
    [...text.matchAll(/(\d+)\s*(?:#|号)\s*台/g)].forEach((match) => {
      const key = row.plannedWorkpointName || row.workpointName || "";
      if (!key) return;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(Number(match[1]));
    });
  });
  return map;
}

function pierLabel(numberText, workpointName, abutments) {
  const number = Number(numberText);
  const suffix = abutments.get(workpointName)?.has(number) ? "台" : "墩";
  return `${number}#${suffix}`;
}

function pierLabelsForAssignment(row, abutments) {
  const text = String(row.name || "");
  const workpointName = row.plannedWorkpointName || row.workpointName || "";
  const labels = new Set();
  [...text.matchAll(/(\d+)\s*(?:#|号)\s*(台|墩)/g)].forEach((match) => {
    labels.add(`${Number(match[1])}#${match[2]}`);
  });
  [...text.matchAll(/(\d+)\s*-\s*(\d+)\s*号梁/g)].forEach((match) => {
    labels.add(pierLabel(match[1], workpointName, abutments));
    labels.add(pierLabel(match[2], workpointName, abutments));
  });
  [...text.matchAll(/(\d+)\s*-\s*\d+\s*桩基/g)].forEach((match) => {
    labels.add(pierLabel(match[1], workpointName, abutments));
  });
  if (!labels.size) {
    const match = text.match(/(\d+)\s*#/);
    if (match) labels.add(pierLabel(match[1], workpointName, abutments));
  }
  return [...labels];
}

function sortPierLabels(labels) {
  return [...labels].sort((a, b) => {
    const an = Number(a.match(/\d+/)?.[0] || 0);
    const bn = Number(b.match(/\d+/)?.[0] || 0);
    if (an !== bn) return an - bn;
    return a.localeCompare(b, "zh-Hans-CN");
  });
}

function summarizeAssignmentScope(rows, abutments) {
  const byWorkpoint = new Map();
  rows.forEach((row) => {
    const workpointName = row.plannedWorkpointName || row.workpointName || "";
    if (!workpointName) return;
    if (!byWorkpoint.has(workpointName)) byWorkpoint.set(workpointName, new Set());
    pierLabelsForAssignment(row, abutments).forEach((label) => byWorkpoint.get(workpointName).add(label));
  });
  return [...byWorkpoint.entries()]
    .map(([workpointName, labels]) => {
      const sorted = sortPierLabels([...labels]);
      return sorted.length ? `${workpointName}-${sorted.join("、")}` : workpointName;
    })
    .join("；");
}

function summarizeAssignmentContent(rows) {
  return [...new Set(rows.map(contentTypeForAssignment).filter(Boolean))].join("、");
}

function syncDirections(assignments, existingRows, resources) {
  const oldById = new Map((existingRows || []).map((row) => [asText(row["方向ID"]), row]));
  const resourcesBySubject = new Map(resources.map((row) => [row.subjectId, row]));
  const groups = new Map();
  const abutments = abutmentNumberMap(assignments);

  leafAssignments(assignments)
    .filter((row) => row.subjectId && row.plannedWorkpointId)
    .forEach((row) => {
      const key = `${row.plannedWorkpointId}|${row.subjectId}`;
      if (!groups.has(key)) {
        const subject = resourcesBySubject.get(row.subjectId);
        groups.set(key, {
          directionId: key,
          plannedWorkpointId: row.plannedWorkpointId,
          plannedWorkpointName: row.plannedWorkpointName,
          subjectId: row.subjectId,
          subjectName: subject?.displayName || row.subjectName,
          teamId: row.teamId,
          teamName: subject?.teamName || row.teamName,
          assignments: [],
        });
      }
      groups.get(key).assignments.push(row);
    });

  return [...groups.values()].map((row) => {
    const old = oldById.get(row.directionId) || {};
    const { assignments: groupAssignments, ...baseRow } = row;
    return {
      ...baseRow,
      scope: summarizeAssignmentScope(groupAssignments, abutments) || row.plannedWorkpointName,
      content: summarizeAssignmentContent(groupAssignments),
      direction: asText(old["施工方向"]) || "从小到大",
      syncStatus: oldById.has(row.directionId) ? "已同步" : "新增",
      note: asText(old["备注"]),
    };
  });
}

function defaultBeamRows(projectData) {
  const sourceRows = Array.isArray(projectData.beamLines) ? projectData.beamLines : [];
  if (sourceRows.length) return sourceRows;
  const pierOptions = Array.isArray(projectData.pierOptions) ? projectData.pierOptions : [];
  if (pierOptions.length < 2) return [];
  return [{
    id: "beam-1",
    name: "架梁方向1",
    startPier: pierOptions[0],
    endPier: pierOptions.at(-1),
    resource: "1号架桥机",
    transfer: "0",
    prev: "",
    startTime: "",
  }];
}

function normalizeBeamDirection(row, fallback = {}) {
  return {
    id: asText(row["架梁方向ID"]) || asText(fallback.id),
    name: asText(row["架梁方向名称"]) || asText(fallback.name),
    startPier: asText(row["起点墩台"]) || asText(fallback.startPier),
    endPier: asText(row["终点墩台"]) || asText(fallback.endPier),
    resource: asText(row["架桥资源"]) || asText(fallback.resource),
    transfer: asText(row["转场时间(天)"]) || asText(fallback.transfer) || "0",
    prev: asText(row["前置架梁方向"]) || asText(fallback.prev),
    startTime: asText(row["计划开始时间"]) || asText(fallback.startTime),
    enabled: asText(row["是否启用"]) || "是",
    syncStatus: asText(row["同步状态"]),
    validation: asText(row["校验结果"]),
    note: asText(row["备注"]),
  };
}

function validateBeamDirection(row, projectData, allRows) {
  const issues = [];
  const pierOptions = new Set(projectData.pierOptions || []);
  const resources = new Set([...(projectData.resources || []), ...allRows.map((item) => item.resource).filter(Boolean)]);
  const names = new Set(allRows.map((item) => item.name).filter(Boolean));
  if (!row.id) issues.push("缺少架梁方向ID");
  if (!row.name) issues.push("缺少架梁方向名称");
  if (row.startPier && !pierOptions.has(row.startPier)) issues.push("起点墩台不在最新结构数据中");
  if (row.endPier && !pierOptions.has(row.endPier)) issues.push("终点墩台不在最新结构数据中");
  if (row.resource && !resources.has(row.resource)) issues.push("架桥资源不在资源列表中");
  if (row.transfer && !/^\d+$/.test(row.transfer)) issues.push("转场时间必须是非负整数");
  if (row.prev && !names.has(row.prev)) issues.push("前置架梁方向不存在");
  if (row.prev && row.prev === row.name) issues.push("前置架梁方向不可等于自身");
  return issues.join("；");
}

function syncBeamDirections(existingRows, projectData) {
  const defaults = defaultBeamRows(projectData);
  const defaultsById = new Map(defaults.map((row) => [asText(row.id), row]));
  const oldById = new Map((existingRows || []).map((row) => [asText(row["架梁方向ID"]), row]));
  const ids = new Set([...defaultsById.keys(), ...oldById.keys()].filter(Boolean));

  const rows = [...ids].map((id) => {
    const old = oldById.get(id);
    const fallback = defaultsById.get(id) || {};
    const row = normalizeBeamDirection(old || {}, fallback);
    row.syncStatus = old ? "已同步" : "新增";
    return row;
  });

  rows.forEach((row) => {
    row.validation = validateBeamDirection(row, projectData, rows);
  });
  return rows;
}

function normalizeProductivity(productivityRows, fallbackRows = []) {
  const defaultRows = DEFAULT_PRODUCTIVITY.map((row) => Object.fromEntries(PRODUCTIVITY_HEADERS.map((header, index) => [header, row[index] || ""])));
  const sourceRows = productivityRows?.length ? productivityRows : fallbackRows?.length ? fallbackRows : defaultRows;
  const seen = new Set();
  return sourceRows
    .map((row) => ({
      productivityId: asText(row["工效ID"] ?? row.productivityId),
      discipline: asText(row["专业"] ?? row.discipline),
      structureType: asText(row["结构树类型"] ?? row.structureType),
      procedure: asText(row["施工工序"] ?? row.procedure),
      craft: asText(row["默认施工工艺"] ?? row.craft),
      productivity: asText(row["工效"] ?? row.productivity),
      productivityUnit: asText(row["工效单位"] ?? row.productivityUnit),
      quantityUnit: asText(row["形象进度单位"] ?? row.quantityUnit),
      keywords: asText(row["匹配关键字"] ?? row.keywords),
      enabled: asText(row["是否启用"] ?? row.enabled) || "是",
      note: asText(row["备注"] ?? row.note),
    }))
    .filter((row) => {
      if (!row.productivityId || !row.structureType || !row.productivity) return false;
      if (seen.has(row.productivityId)) return false;
      seen.add(row.productivityId);
      return true;
    });
}

function normalizeWorkpointOrder(orderRows, fallbackRows = []) {
  const sourceRows = orderRows?.length ? orderRows : fallbackRows;
  return sourceRows
    .map((row, index) => ({
      workpointId: asText(row["工点ID"] ?? row.id ?? row.workpointId),
      discipline: asText(row["专业"] ?? row.discipline),
      name: asText(row["工点名称"] ?? row.name),
      prev: asText(row["前序工点"] ?? row.prev),
      gap: asText(row["间隔天数"] ?? row.gap) || "0",
      start: asText(row["手动开始时间"] ?? row.start),
      order: asText(row["排序号"] ?? row.order) || String(index + 1),
      syncStatus: asText(row["同步状态"] ?? row.syncStatus) || (orderRows?.length ? "已同步" : "新增"),
      note: asText(row["备注"] ?? row.note),
    }))
    .filter((row) => row.workpointId || row.name);
}

function normalizeScheduleTasks(taskRows, fallbackRows = []) {
  const sourceRows = taskRows?.length ? taskRows : fallbackRows;
  return sourceRows
    .map((row, index) => ({
      configId: asText(row["配置ID"] ?? row.configId),
      workpointId: asText(row["工点ID"] ?? row.workpointId),
      workpointName: asText(row["工点名称"] ?? row.workpointName),
      structureId: asText(row["结构对象ID"] ?? row.structureId),
      structureName: asText(row["结构对象名称"] ?? row.structureName),
      taskOrder: asText(row["任务序号"] ?? row.taskOrder) || String(index + 1),
      name: asText(row["任务名称"] ?? row.name),
      prev: asText(row["前置任务"] ?? row.prev),
      relation: asText(row["关系类型"] ?? row.relation) || "FS",
      gap: asText(row["间隔天数"] ?? row.gap) || "0",
      qty: asText(row["形象进度量"] ?? row.qty),
      unit: asText(row["单位"] ?? row.unit),
      craft: asText(row["施工工艺"] ?? row.craft),
      metric: asText(row["工效"] ?? row.metric),
      crew: asText(row["作业班组"] ?? row.crew),
      duration: asText(row["工期"] ?? row.duration),
      syncStatus: asText(row["同步状态"] ?? row.syncStatus) || "页面保存",
      note: asText(row["备注"] ?? row.note),
    }))
    .filter((row) => row.structureId && row.name);
}

function kindForWorkpoint(name) {
  if (name.includes("隧道")) return "tunnel";
  if (name.includes("路基")) return "road";
  if (name.includes("桥") || name.includes("梁")) return "bridge";
  return "bridge";
}

function buildResponsibility(assignments, directions, resources) {
  const resourcesBySubject = new Map(resources.map((row) => [row.subjectId, row]));
  const teamGroups = new Map();

  leafAssignments(assignments).forEach((row) => {
    const key = `${row.plannedWorkpointId}|${row.teamId}`;
    if (!teamGroups.has(key)) {
      teamGroups.set(key, {
        name: row.teamName,
        scope: row.plannedWorkpointName || row.workpointName,
        contentSet: new Set(),
        crewSet: new Set(),
        direction: "从小到大",
      });
    }
    const group = teamGroups.get(key);
    group.contentSet.add(row.name);
    if (row.subjectId) group.crewSet.add(resourcesBySubject.get(row.subjectId)?.displayName || row.subjectName);
  });

  const teamRows = [...teamGroups.values()].map((group) => ({
    name: group.name,
    scope: group.scope,
    content: [...group.contentSet].slice(0, 12).join("、"),
    direction: group.direction,
    crews: [...group.crewSet].filter(Boolean).join("、"),
  }));

  const crewRows = directions.map((row) => ({
    name: row.subjectName,
    scope: row.scope,
    content: row.content,
    direction: ["从小到大", "从大到小"].includes(row.direction) ? row.direction : "从小到大",
    team: row.teamName,
  }));

  const workpointResponsibility = {
    bridge: { team: [], crew: [] },
    tunnel: { team: [], crew: [] },
    road: { team: [], crew: [] },
  };

  teamRows.forEach((row) => {
    workpointResponsibility[kindForWorkpoint(row.scope)]?.team.push(row);
  });
  crewRows.forEach((row) => {
    workpointResponsibility[kindForWorkpoint(row.scope)]?.crew.push(row);
  });

  return {
    responsibility: { team: teamRows, crew: crewRows },
    workpointResponsibility,
  };
}

function matrixFromObjects(headers, rows, mapper) {
  return [
    headers,
    ...rows.map((row) => headers.map((header) => mapper(row, header) ?? "")),
  ];
}

function writeSheet(sheet, values, widths = []) {
  const rowCount = Math.max(values.length, 1);
  const colCount = Math.max(values[0]?.length || 1, 1);
  sheet.getRangeByIndexes(0, 0, rowCount, colCount).values = values;
  sheet.getRangeByIndexes(0, 0, 1, colCount).format = {
    fill: "#EAF2FF",
    font: { bold: true, color: "#172033" },
  };
  sheet.freezePanes.freezeRows(1);
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, rowCount, 1).format.columnWidthPx = width;
  });
  sheet.getRangeByIndexes(0, 0, rowCount, colCount).format.wrapText = false;
}

async function exportWorkbook(resources, assignments, directions, beamDirections, productivity, workpointOrder, scheduleTasks) {
  const workbook = Workbook.create();
  const resourceSheet = workbook.worksheets.add(SHEETS.resources);
  const assignmentSheet = workbook.worksheets.add(SHEETS.assignments);
  const directionSheet = workbook.worksheets.add(SHEETS.directions);
  const beamDirectionSheet = workbook.worksheets.add(SHEETS.beamDirections);
  const productivitySheet = workbook.worksheets.add(SHEETS.productivity);
  const workpointOrderSheet = workbook.worksheets.add(SHEETS.workpointOrder);
  const taskConfigSheet = workbook.worksheets.add(SHEETS.scheduleTasks);

  writeSheet(resourceSheet, matrixFromObjects(RESOURCE_HEADERS, resources, (row, header) => ({
    "作业主体ID": row.subjectId,
    "施工队伍ID": row.teamId,
    "施工队伍名称": row.teamName,
    "班组ID": row.crewId,
    "班组名称": row.crewName,
    "作业主体类型": row.type,
    "展示名称": row.displayName,
    "是否启用": row.enabled,
    "备注": row.note,
  })[header]), [150, 140, 150, 110, 150, 120, 220, 90, 220]);

  writeSheet(assignmentSheet, matrixFromObjects(ASSIGNMENT_HEADERS, assignments, (row, header) => ({
    "节点ID": row.nodeId,
    "父节点ID": row.parentId,
    "工点ID": row.workpointId,
    "工点名称": row.workpointName,
    "计划工点ID": row.plannedWorkpointId,
    "计划工点名称": row.plannedWorkpointName,
    "名称": row.name,
    "类型": row.type,
    "层级": row.level,
    "编码": row.code,
    "是否末级施工单元": row.isLeaf,
    "施工单元ID": row.constructionUnitId,
    "施工队伍ID": row.teamId,
    "施工队伍名称": row.teamName,
    "作业主体ID": row.subjectId,
    "作业主体名称": row.subjectName,
    "同步状态": row.syncStatus,
    "校验结果": row.validation,
    "原始路径": row.rawPath,
  })[header]), [320, 320, 140, 170, 150, 190, 190, 110, 70, 90, 130, 150, 140, 150, 150, 220, 90, 240, 520]);

  writeSheet(directionSheet, matrixFromObjects(DIRECTION_HEADERS, directions, (row, header) => ({
    "方向ID": row.directionId,
    "计划工点ID": row.plannedWorkpointId,
    "计划工点名称": row.plannedWorkpointName,
    "作业主体ID": row.subjectId,
    "作业主体名称": row.subjectName,
    "施工队伍ID": row.teamId,
    "施工队伍名称": row.teamName,
    "施工范围": row.scope,
    "主要工程内容": row.content,
    "施工方向": row.direction,
    "同步状态": row.syncStatus,
    "备注": row.note,
  })[header]), [300, 150, 190, 150, 220, 140, 150, 190, 420, 110, 90, 220]);

  writeSheet(beamDirectionSheet, matrixFromObjects(BEAM_DIRECTION_HEADERS, beamDirections, (row, header) => ({
    "架梁方向ID": row.id,
    "架梁方向名称": row.name,
    "起点墩台": row.startPier,
    "终点墩台": row.endPier,
    "架桥资源": row.resource,
    "转场时间(天)": row.transfer,
    "前置架梁方向": row.prev,
    "计划开始时间": row.startTime,
    "是否启用": row.enabled,
    "同步状态": row.syncStatus,
    "校验结果": row.validation,
    "备注": row.note,
  })[header]), [130, 150, 240, 240, 140, 110, 150, 130, 90, 90, 260, 220]);

  writeSheet(productivitySheet, matrixFromObjects(PRODUCTIVITY_HEADERS, productivity, (row, header) => ({
    "工效ID": row.productivityId,
    "专业": row.discipline,
    "结构树类型": row.structureType,
    "施工工序": row.procedure,
    "默认施工工艺": row.craft,
    "工效": row.productivity,
    "工效单位": row.productivityUnit,
    "形象进度单位": row.quantityUnit,
    "匹配关键字": row.keywords,
    "是否启用": row.enabled,
    "备注": row.note,
  })[header]), [160, 100, 130, 130, 150, 90, 100, 110, 260, 90, 260]);

  writeSheet(workpointOrderSheet, matrixFromObjects(WORKPOINT_ORDER_HEADERS, workpointOrder, (row, header) => ({
    "工点ID": row.workpointId,
    "专业": row.discipline,
    "工点名称": row.name,
    "前序工点": row.prev,
    "间隔天数": row.gap,
    "手动开始时间": row.start,
    "排序号": row.order,
    "同步状态": row.syncStatus,
    "备注": row.note,
  })[header]), [180, 120, 220, 220, 100, 140, 90, 90, 220]);

  writeSheet(taskConfigSheet, matrixFromObjects(TASK_CONFIG_HEADERS, scheduleTasks, (row, header) => ({
    "配置ID": row.configId,
    "工点ID": row.workpointId,
    "工点名称": row.workpointName,
    "结构对象ID": row.structureId,
    "结构对象名称": row.structureName,
    "任务序号": row.taskOrder,
    "任务名称": row.name,
    "前置任务": row.prev,
    "关系类型": row.relation,
    "间隔天数": row.gap,
    "形象进度量": row.qty,
    "单位": row.unit,
    "施工工艺": row.craft,
    "工效": row.metric,
    "作业班组": row.crew,
    "工期": row.duration,
    "同步状态": row.syncStatus,
    "备注": row.note,
  })[header]), [260, 180, 220, 180, 220, 90, 180, 180, 90, 90, 110, 80, 140, 120, 220, 90, 90, 220]);

  const xlsx = await SpreadsheetFile.exportXlsx(workbook);
  try {
    await xlsx.save(workbookPath);
    return workbookPath;
  } catch (error) {
    if (error?.code !== "EBUSY") throw error;
    const fallbackPath = path.join(__dirname, "责任区域配置_待替换.xlsx");
    await xlsx.save(fallbackPath);
    console.warn(`WARNING: Workbook is locked, saved updated copy: ${fallbackPath}`);
    return fallbackPath;
  }
}

async function writePageData(resources, assignments, directions, beamDirections, productivity, workpointOrder, scheduleTasks, savedWorkbookPath = workbookPath) {
  const enabledResources = resources.filter((row) => row.enabled !== "否");
  const enabledBeamDirections = beamDirections
    .filter((row) => row.enabled !== "否")
    .map((row) => ({
      id: row.id,
      name: row.name,
      startPier: row.startPier,
      endPier: row.endPier,
      resource: row.resource,
      transfer: row.transfer,
      prev: row.prev,
      startTime: row.startTime,
    }));
  const built = buildResponsibility(assignments, directions, enabledResources);
  const payload = {
    source: {
      workbook: savedWorkbookPath,
      generatedAt: new Date().toISOString(),
      resourceCount: enabledResources.length,
      assignmentCount: assignments.length,
      directionCount: directions.length,
      beamDirectionCount: enabledBeamDirections.length,
      productivityCount: productivity.filter((row) => row.enabled !== "否").length,
      workpointOrderCount: workpointOrder.length,
      scheduleTaskCount: scheduleTasks.length,
    },
    resources: enabledResources,
    teams: enabledResources.filter((row) => row.type === "队伍"),
    subjects: enabledResources,
    assignments,
    directions,
    beamLines: enabledBeamDirections,
    productivity,
    workpointOrder,
    scheduleTasks,
    ...built,
  };
  const text = JSON.stringify(payload, null, 2);
  await fs.writeFile(jsonPath, `${text}\n`, "utf8");
  await fs.writeFile(jsPath, `window.RESPONSIBILITY_AREA_DATA = ${text};\n`, "utf8");
}

async function main() {
  const csvText = await fs.readFile(csvPath, "utf8");
  const csvRows = parseCsv(csvText.replace(/^\uFEFF/, ""));
  const structureRows = buildStructureRows(csvRows);
  const existing = await readExistingWorkbook();
  const projectData = await readProjectStructureData();
  const resources = normalizeResources(existing[SHEETS.resources]);
  const assignments = syncAssignments(structureRows, existing[SHEETS.assignments], resources);
  const directions = syncDirections(assignments, existing[SHEETS.directions], resources);
  const beamDirections = syncBeamDirections(existing[SHEETS.beamDirections], projectData);
  const productivity = normalizeProductivity(existing[SHEETS.productivity]);
  const workpointOrder = normalizeWorkpointOrder(existing[SHEETS.workpointOrder], projectData.workpoints || []);
  const scheduleTasks = normalizeScheduleTasks(existing[SHEETS.scheduleTasks]);

  const savedWorkbookPath = await exportWorkbook(resources, assignments, directions, beamDirections, productivity, workpointOrder, scheduleTasks);
  await writePageData(resources, assignments, directions, beamDirections, productivity, workpointOrder, scheduleTasks, savedWorkbookPath);

  const invalidCount = assignments.filter((row) => row.validation).length;
  const beamInvalidCount = beamDirections.filter((row) => row.validation).length;
  console.log("====== Responsibility workbook sync ======");
  console.log(`Workbook: ${savedWorkbookPath}`);
  console.log(`Structure nodes: ${assignments.length}`);
  console.log(`Resources: ${resources.length}`);
  console.log(`Directions: ${directions.length}`);
  console.log(`Beam directions: ${beamDirections.length}`);
  console.log(`Productivity rows: ${productivity.length}`);
  console.log(`Workpoint order rows: ${workpointOrder.length}`);
  console.log(`Schedule task rows: ${scheduleTasks.length}`);
  console.log(`Validation warnings: ${invalidCount + beamInvalidCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
