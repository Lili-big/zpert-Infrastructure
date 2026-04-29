import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOST = "127.0.0.1";
const PORT = 8787;
const DATA_DIR = path.join(__dirname, "项目结构数据");
const OUTPUT_DIR = path.join(DATA_DIR, "output");
const WORKBOOK_PATH = path.join(DATA_DIR, "责任区域配置.xlsx");
const JSON_PATH = path.join(OUTPUT_DIR, "responsibility_area_data.json");
const JS_PATH = path.join(OUTPUT_DIR, "responsibility_area_data.js");

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

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asText(value) {
  return String(value ?? "").trim();
}

function responseHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extra,
  };
}

function sendJson(res, status, body) {
  res.writeHead(status, responseHeaders({ "Content-Type": "application/json; charset=utf-8" }));
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 30 * 1024 * 1024) throw new Error("请求体过大");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function matrixFromObjects(headers, rows, mapper) {
  return [
    headers,
    ...asArray(rows).map((row) => headers.map((header) => mapper(row, header) ?? "")),
  ];
}

function sheetValuesToObjects(values) {
  if (!values.length) return [];
  const headers = values[0].map(asText);
  return values.slice(1)
    .filter((row) => row.some((value) => asText(value)))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, asText(row[index])])));
}

async function readExistingPageData() {
  try {
    return JSON.parse(await fs.readFile(JSON_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function readWorkbookSheets() {
  const result = {};
  try {
    await fs.access(WORKBOOK_PATH);
  } catch {
    return result;
  }

  const file = await FileBlob.load(WORKBOOK_PATH);
  const workbook = await SpreadsheetFile.importXlsx(file);
  for (const sheetName of Object.values(SHEETS)) {
    try {
      const sheet = workbook.worksheets.getItem(sheetName);
      const range = sheet.getUsedRange(true);
      result[sheetName] = sheetValuesToObjects(range?.values || []);
    } catch {
      result[sheetName] = [];
    }
  }
  return result;
}

function normalizeResources(resourceRows, fallbackRows = []) {
  const sourceRows = resourceRows?.length ? resourceRows : fallbackRows;
  const seen = new Set();
  return asArray(sourceRows)
    .map((row) => {
      const crewId = asText(row["班组ID"] ?? row.crewId);
      const crewName = asText(row["班组名称"] ?? row.crewName);
      const teamName = asText(row["施工队伍名称"] ?? row.teamName);
      return {
        subjectId: asText(row["作业主体ID"] ?? row.subjectId),
        teamId: asText(row["施工队伍ID"] ?? row.teamId),
        teamName,
        crewId,
        crewName,
        type: asText(row["作业主体类型"] ?? row.type) || (crewId ? "队伍-班组" : "队伍"),
        displayName: asText(row["展示名称"] ?? row.displayName) || (crewName ? `${teamName} / ${crewName}` : teamName),
        enabled: asText(row["是否启用"] ?? row.enabled) || "是",
        note: asText(row["备注"] ?? row.note),
      };
    })
    .filter((row) => {
      if (!row.subjectId || !row.teamId || !row.teamName) return false;
      if (!["队伍", "队伍-班组"].includes(row.type)) return false;
      if (seen.has(row.subjectId)) return false;
      seen.add(row.subjectId);
      return true;
    });
}

function enabledResources(resources) {
  return asArray(resources).filter((row) => row.enabled !== "否");
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

function normalizeAssignments(assignmentRows, fallbackRows = [], resources = []) {
  const sourceRows = assignmentRows?.length ? assignmentRows : fallbackRows;
  const validResources = enabledResources(resources);
  const resourcesBySubject = new Map(validResources.map((row) => [row.subjectId, row]));
  const teamsById = new Map(validResources.filter((row) => row.type === "队伍").map((row) => [row.teamId, row]));

  return asArray(sourceRows)
    .map((row) => {
      const teamId = asText(row["施工队伍ID"] ?? row.teamId);
      const subjectId = asText(row["作业主体ID"] ?? row.subjectId);
      const team = teamsById.get(teamId);
      const subject = resourcesBySubject.get(subjectId);
      const assignment = {
        nodeId: asText(row["节点ID"] ?? row.nodeId),
        parentId: asText(row["父节点ID"] ?? row.parentId),
        workpointId: asText(row["工点ID"] ?? row.workpointId),
        workpointName: asText(row["工点名称"] ?? row.workpointName),
        plannedWorkpointId: asText(row["计划工点ID"] ?? row.plannedWorkpointId),
        plannedWorkpointName: asText(row["计划工点名称"] ?? row.plannedWorkpointName),
        name: asText(row["名称"] ?? row.name),
        type: asText(row["类型"] ?? row.type),
        level: asText(row["层级"] ?? row.level),
        code: asText(row["编码"] ?? row.code),
        isLeaf: asText(row["是否末级施工单元"] ?? row.isLeaf),
        constructionUnitId: asText(row["施工单元ID"] ?? row.constructionUnitId),
        teamId,
        teamName: team?.teamName || asText(row["施工队伍名称"] ?? row.teamName),
        subjectId,
        subjectName: subject?.displayName || asText(row["作业主体名称"] ?? row.subjectName),
        syncStatus: asText(row["同步状态"] ?? row.syncStatus) || "已同步",
        validation: "",
        rawPath: asText(row["原始路径"] ?? row.rawPath),
      };
      assignment.validation = validateAssignment(assignment, resourcesBySubject, teamsById);
      return assignment;
    })
    .filter((row) => row.nodeId);
}

function leafAssignments(assignments) {
  return asArray(assignments).filter((row) => row.isLeaf === "是" && row.teamId);
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
  asArray(assignments).forEach((row) => {
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
  asArray(rows).forEach((row) => {
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
  return [...new Set(asArray(rows).map(contentTypeForAssignment).filter(Boolean))].join("、");
}

function normalizeDirections(directionRows, assignments, resources) {
  const oldById = new Map(asArray(directionRows).map((row) => [asText(row["方向ID"] ?? row.directionId), row]));
  const resourcesBySubject = new Map(enabledResources(resources).map((row) => [row.subjectId, row]));
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
      direction: asText(old["施工方向"] ?? old.direction) || "从小到大",
      syncStatus: asText(old["同步状态"] ?? old.syncStatus) || (oldById.has(row.directionId) ? "已同步" : "新增"),
      note: asText(old["备注"] ?? old.note),
    };
  });
}

function normalizeBeamLines(beamRows, fallbackRows = []) {
  const sourceRows = beamRows?.length ? beamRows : fallbackRows;
  return asArray(sourceRows)
    .map((row) => ({
      id: asText(row["架梁方向ID"] ?? row.id),
      name: asText(row["架梁方向名称"] ?? row.name),
      startPier: asText(row["起点墩台"] ?? row.startPier),
      endPier: asText(row["终点墩台"] ?? row.endPier),
      resource: asText(row["架桥资源"] ?? row.resource),
      transfer: asText(row["转场时间(天)"] ?? row.transfer) || "0",
      prev: asText(row["前置架梁方向"] ?? row.prev),
      startTime: asText(row["计划开始时间"] ?? row.startTime),
      enabled: asText(row["是否启用"] ?? row.enabled) || "是",
      syncStatus: asText(row["同步状态"] ?? row.syncStatus),
      validation: asText(row["校验结果"] ?? row.validation),
      note: asText(row["备注"] ?? row.note),
    }))
    .filter((row) => row.id || row.name);
}

function normalizeProductivity(productivityRows, fallbackRows = []) {
  const defaultRows = DEFAULT_PRODUCTIVITY.map((row) => Object.fromEntries(PRODUCTIVITY_HEADERS.map((header, index) => [header, row[index] || ""])));
  const sourceRows = productivityRows?.length ? productivityRows : fallbackRows?.length ? fallbackRows : defaultRows;
  const seen = new Set();
  return asArray(sourceRows)
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
  return asArray(sourceRows)
    .map((row, index) => ({
      workpointId: asText(row["工点ID"] ?? row.id ?? row.workpointId),
      discipline: asText(row["专业"] ?? row.discipline),
      name: asText(row["工点名称"] ?? row.name),
      prev: asText(row["前序工点"] ?? row.prev),
      gap: asText(row["间隔天数"] ?? row.gap) || "0",
      start: asText(row["手动开始时间"] ?? row.start),
      order: asText(row["排序号"] ?? row.order) || String(index + 1),
      syncStatus: asText(row["同步状态"] ?? row.syncStatus) || "页面保存",
      note: asText(row["备注"] ?? row.note),
    }))
    .filter((row) => row.workpointId || row.name);
}

function normalizeScheduleTasks(taskRows, fallbackRows = []) {
  const sourceRows = taskRows?.length ? taskRows : fallbackRows;
  return asArray(sourceRows)
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
  const text = String(name || "");
  if (text.includes("隧道")) return "tunnel";
  if (text.includes("路基")) return "road";
  return "bridge";
}

function buildResponsibility(assignments, directions, resources) {
  const resourcesBySubject = new Map(enabledResources(resources).map((row) => [row.subjectId, row]));
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
  const crewRows = asArray(directions).map((row) => ({
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
  teamRows.forEach((row) => workpointResponsibility[kindForWorkpoint(row.scope)]?.team.push(row));
  crewRows.forEach((row) => workpointResponsibility[kindForWorkpoint(row.scope)]?.crew.push(row));
  return {
    responsibility: { team: teamRows, crew: crewRows },
    workpointResponsibility,
  };
}

function toPagePayload(payload) {
  const resources = enabledResources(payload.resources);
  const beamLines = asArray(payload.beamLines)
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
  const built = buildResponsibility(payload.assignments, payload.directions, resources);
  return {
    ...payload,
    source: {
      ...(payload.source || {}),
      resourceCount: resources.length,
      assignmentCount: asArray(payload.assignments).length,
      directionCount: asArray(payload.directions).length,
      beamDirectionCount: beamLines.length,
    },
    resources,
    teams: resources.filter((row) => row.type === "队伍"),
    subjects: resources,
    beamLines,
    productivity: normalizeProductivity([], payload.productivity),
    workpointOrder: normalizeWorkpointOrder([], payload.workpointOrder),
    scheduleTasks: normalizeScheduleTasks([], payload.scheduleTasks),
    ...built,
  };
}

async function buildPageDataFromWorkbook() {
  const fallback = await readExistingPageData();
  const existing = await readWorkbookSheets();
  const workbookStat = await fs.stat(WORKBOOK_PATH).catch(() => null);
  const resources = normalizeResources(existing[SHEETS.resources], fallback.resources);
  const assignments = normalizeAssignments(existing[SHEETS.assignments], fallback.assignments, resources);
  const directions = normalizeDirections(existing[SHEETS.directions], assignments, resources);
  const beamLines = normalizeBeamLines(existing[SHEETS.beamDirections], fallback.beamLines);
  const productivity = normalizeProductivity(existing[SHEETS.productivity], fallback.productivity);
  const workpointOrder = normalizeWorkpointOrder(existing[SHEETS.workpointOrder], fallback.workpointOrder);
  const scheduleTasks = normalizeScheduleTasks(existing[SHEETS.scheduleTasks], fallback.scheduleTasks);
  return toPagePayload({
    ...fallback,
    source: {
      ...(fallback.source || {}),
      workbook: WORKBOOK_PATH,
      generatedAt: workbookStat?.mtime?.toISOString() || new Date().toISOString(),
      excelLoadedAt: new Date().toISOString(),
    },
    resources,
    assignments,
    directions,
    beamLines,
    productivity,
    workpointOrder,
    scheduleTasks,
  });
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

function normalizePayload(payload, resourceOverride = null) {
  const now = new Date().toISOString();
  const resources = resourceOverride || normalizeResources([], payload.resources);
  const assignments = normalizeAssignments([], payload.assignments, resources);
  const directions = normalizeDirections(payload.directions, assignments, resources);
  const beamLines = normalizeBeamLines([], payload.beamLines);
  const productivity = normalizeProductivity([], payload.productivity);
  const workpointOrder = normalizeWorkpointOrder([], payload.workpointOrder);
  const scheduleTasks = normalizeScheduleTasks([], payload.scheduleTasks);
  return {
    ...payload,
    source: {
      ...(payload.source || {}),
      workbook: WORKBOOK_PATH,
      generatedAt: now,
      browserSavedAt: payload.source?.browserSavedAt || now,
      resourceCount: resources.filter((row) => row.enabled !== "否").length,
      assignmentCount: assignments.length,
      directionCount: directions.length,
      beamDirectionCount: beamLines.length,
      productivityCount: productivity.filter((row) => row.enabled !== "否").length,
      workpointOrderCount: workpointOrder.length,
      scheduleTaskCount: scheduleTasks.length,
    },
    resources,
    teams: asArray(payload.teams),
    subjects: asArray(payload.subjects),
    assignments,
    directions,
    beamLines,
    productivity,
    workpointOrder,
    scheduleTasks,
  };
}

async function exportWorkbook(payload) {
  const workbook = Workbook.create();
  const resourceSheet = workbook.worksheets.add("队伍班组基础数据");
  const assignmentSheet = workbook.worksheets.add("责任区域设置");
  const directionSheet = workbook.worksheets.add("班组施工方向");
  const beamDirectionSheet = workbook.worksheets.add("架梁方向设置");
  const productivitySheet = workbook.worksheets.add("理论工效配置");
  const workpointOrderSheet = workbook.worksheets.add("工点推进顺序");
  const taskConfigSheet = workbook.worksheets.add("计划排程任务配置");

  writeSheet(resourceSheet, matrixFromObjects(RESOURCE_HEADERS, payload.resources, (row, header) => ({
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

  writeSheet(assignmentSheet, matrixFromObjects(ASSIGNMENT_HEADERS, payload.assignments, (row, header) => ({
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
    "同步状态": row.syncStatus || "页面保存",
    "校验结果": row.validation,
    "原始路径": row.rawPath,
  })[header]), [320, 320, 140, 170, 150, 190, 190, 110, 70, 90, 130, 150, 140, 150, 150, 220, 90, 240, 520]);

  writeSheet(directionSheet, matrixFromObjects(DIRECTION_HEADERS, payload.directions, (row, header) => ({
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
    "同步状态": row.syncStatus || "页面保存",
    "备注": row.note,
  })[header]), [300, 150, 190, 150, 220, 140, 150, 190, 420, 110, 90, 220]);

  writeSheet(beamDirectionSheet, matrixFromObjects(BEAM_DIRECTION_HEADERS, payload.beamLines, (row, header) => ({
    "架梁方向ID": row.id,
    "架梁方向名称": row.name,
    "起点墩台": row.startPier,
    "终点墩台": row.endPier,
    "架桥资源": row.resource,
    "转场时间(天)": row.transfer,
    "前置架梁方向": row.prev,
    "计划开始时间": row.startTime,
    "是否启用": row.enabled || "是",
    "同步状态": row.syncStatus || "页面保存",
    "校验结果": row.validation,
    "备注": row.note,
  })[header]), [130, 150, 240, 240, 140, 110, 150, 130, 90, 90, 260, 220]);

  writeSheet(productivitySheet, matrixFromObjects(PRODUCTIVITY_HEADERS, payload.productivity, (row, header) => ({
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

  writeSheet(workpointOrderSheet, matrixFromObjects(WORKPOINT_ORDER_HEADERS, payload.workpointOrder, (row, header) => ({
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

  writeSheet(taskConfigSheet, matrixFromObjects(TASK_CONFIG_HEADERS, payload.scheduleTasks, (row, header) => ({
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
  await xlsx.save(WORKBOOK_PATH);
}

async function writePageData(payload) {
  const pagePayload = toPagePayload(payload);
  const text = JSON.stringify(pagePayload, null, 2);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(JSON_PATH, `${text}\n`, "utf8");
  await fs.writeFile(JS_PATH, `window.RESPONSIBILITY_AREA_DATA = ${text};\n`, "utf8");
  return pagePayload;
}

async function refreshPageDataFromWorkbook() {
  const payload = await buildPageDataFromWorkbook();
  await writePageData(payload);
  return payload;
}

async function saveResponsibility(req, res) {
  try {
    const rawBody = await readBody(req);
    const incoming = JSON.parse(rawBody || "{}");
    const existing = await readWorkbookSheets();
    const workbookResources = normalizeResources(existing[SHEETS.resources], incoming.resources);
    const payload = normalizePayload(incoming, workbookResources);
    await exportWorkbook(payload);
    const workbookStat = await fs.stat(WORKBOOK_PATH).catch(() => null);
    if (workbookStat?.mtime) payload.source.generatedAt = workbookStat.mtime.toISOString();
    const pagePayload = await writePageData(payload);
    sendJson(res, 200, {
      ok: true,
      workbook: WORKBOOK_PATH,
      generatedAt: pagePayload.source.generatedAt,
      resourceCount: pagePayload.resources.length,
      assignmentCount: pagePayload.assignments.length,
      directionCount: pagePayload.directions.length,
      beamDirectionCount: pagePayload.beamLines.length,
      productivityCount: pagePayload.productivity.length,
      workpointOrderCount: pagePayload.workpointOrder.length,
      scheduleTaskCount: pagePayload.scheduleTasks.length,
    });
  } catch (error) {
    const locked = error?.code === "EBUSY";
    sendJson(res, locked ? 423 : 500, {
      ok: false,
      message: locked ? "Excel 文件正在被占用，请关闭后重试。" : error.message,
      code: error?.code || "SAVE_FAILED",
    });
  }
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = requestUrl.pathname === "/" ? "/responsibility-area-settings.html" : requestUrl.pathname;
  const decodedPath = decodeURIComponent(pathname);
  const targetPath = path.resolve(__dirname, `.${decodedPath}`);
  if (!targetPath.startsWith(__dirname)) {
    sendJson(res, 403, { ok: false, message: "Forbidden" });
    return;
  }

  try {
    if (
      decodedPath === "/项目结构数据/output/responsibility_area_data.js"
      || decodedPath === "/项目结构数据/output/responsibility_area_data.json"
    ) {
      await refreshPageDataFromWorkbook();
    }
    const data = await fs.readFile(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    res.writeHead(200, responseHeaders({ "Content-Type": MIME_TYPES[ext] || "application/octet-stream" }));
    res.end(data);
  } catch {
    sendJson(res, 404, { ok: false, message: "Not found" });
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, responseHeaders());
    res.end();
    return;
  }

  const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);
  if (req.method === "POST" && requestUrl.pathname === "/api/responsibility/save") {
    await saveResponsibility(req, res);
    return;
  }
  if (req.method === "GET" && requestUrl.pathname === "/api/responsibility/data") {
    try {
      const payload = await refreshPageDataFromWorkbook();
      sendJson(res, 200, { ok: true, ...payload });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        message: error.message,
        code: error?.code || "READ_FAILED",
      });
    }
    return;
  }
  if (req.method === "GET" && requestUrl.pathname === "/api/status") {
    sendJson(res, 200, { ok: true, workbook: WORKBOOK_PATH });
    return;
  }
  if (req.method === "GET") {
    await serveStatic(req, res);
    return;
  }
  sendJson(res, 405, { ok: false, message: "Method not allowed" });
});

server.listen(PORT, HOST, () => {
  console.log(`本地配置服务已启动：http://${HOST}:${PORT}/responsibility-area-settings.html`);
  console.log(`Excel 写入目标：${WORKBOOK_PATH}`);
  console.log("保存时请关闭已打开的 Excel/WPS 文件，按 Ctrl+C 可停止服务。");
});
