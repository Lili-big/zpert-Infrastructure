import type { ResponsibilityPayload } from "@construction/shared";

interface SheetSpec<T extends Record<string, unknown>> {
  name: string;
  headers: Array<{ key: keyof T & string; label: string }>;
  rows: T[];
}

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cell(value: unknown) {
  return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function worksheet<T extends Record<string, unknown>>(sheet: SheetSpec<T>) {
  const headerRow = `<Row>${sheet.headers.map((header) => cell(header.label)).join("")}</Row>`;
  const rows = sheet.rows
    .map((row) => `<Row>${sheet.headers.map((header) => cell(row[header.key])).join("")}</Row>`)
    .join("");

  return [
    `<Worksheet ss:Name="${escapeXml(sheet.name).slice(0, 31)}">`,
    "<Table>",
    headerRow,
    rows,
    "</Table>",
    "</Worksheet>",
  ].join("");
}

export function buildConfigWorkbookXml(config: ResponsibilityPayload, projectId: string) {
  const sheets: Array<SheetSpec<Record<string, unknown>>> = [
    {
      name: "资源",
      rows: config.resources || [],
      headers: [
        { key: "subjectId", label: "作业主体ID" },
        { key: "teamId", label: "队伍ID" },
        { key: "teamName", label: "队伍名称" },
        { key: "crewId", label: "班组ID" },
        { key: "crewName", label: "班组名称" },
        { key: "type", label: "主体类型" },
        { key: "displayName", label: "显示名称" },
        { key: "enabled", label: "启用" },
        { key: "note", label: "备注" },
      ],
    },
    {
      name: "责任区域",
      rows: config.assignments || [],
      headers: [
        { key: "nodeId", label: "节点ID" },
        { key: "parentId", label: "父节点ID" },
        { key: "plannedWorkpointId", label: "计划工点ID" },
        { key: "plannedWorkpointName", label: "计划工点" },
        { key: "name", label: "节点名称" },
        { key: "type", label: "节点类型" },
        { key: "isLeaf", label: "是否末级" },
        { key: "teamName", label: "施工队伍" },
        { key: "subjectName", label: "作业主体" },
        { key: "syncStatus", label: "同步状态" },
        { key: "validation", label: "校验" },
      ],
    },
    {
      name: "班组施工方向",
      rows: config.directions || [],
      headers: [
        { key: "directionId", label: "方向ID" },
        { key: "plannedWorkpointName", label: "计划工点" },
        { key: "subjectName", label: "作业主体" },
        { key: "teamName", label: "队伍" },
        { key: "scope", label: "范围" },
        { key: "content", label: "内容" },
        { key: "direction", label: "施工方向" },
        { key: "note", label: "备注" },
      ],
    },
    {
      name: "架梁方向",
      rows: config.beamLines || [],
      headers: [
        { key: "id", label: "方向ID" },
        { key: "name", label: "名称" },
        { key: "startPier", label: "起点墩台" },
        { key: "endPier", label: "终点墩台" },
        { key: "resource", label: "资源" },
        { key: "transfer", label: "转场天数" },
        { key: "prev", label: "前置方向" },
        { key: "startTime", label: "计划开始" },
      ],
    },
    {
      name: "理论工效",
      rows: config.productivity || [],
      headers: [
        { key: "productivityId", label: "工效ID" },
        { key: "discipline", label: "专业" },
        { key: "structureType", label: "结构类型" },
        { key: "procedure", label: "工序" },
        { key: "craft", label: "工艺" },
        { key: "productivity", label: "工效" },
        { key: "productivityUnit", label: "工效单位" },
        { key: "quantityUnit", label: "工程量单位" },
        { key: "keywords", label: "匹配关键字" },
      ],
    },
    {
      name: "工点推进顺序",
      rows: config.workpointOrder || [],
      headers: [
        { key: "workpointId", label: "工点ID" },
        { key: "discipline", label: "专业" },
        { key: "name", label: "工点名称" },
        { key: "prev", label: "前置工点" },
        { key: "gap", label: "间隔天数" },
        { key: "start", label: "手动开始" },
        { key: "order", label: "顺序" },
        { key: "note", label: "备注" },
      ],
    },
    {
      name: "计划任务",
      rows: config.scheduleTasks || [],
      headers: [
        { key: "configId", label: "配置ID" },
        { key: "workpointName", label: "工点" },
        { key: "structureId", label: "结构ID" },
        { key: "structureName", label: "结构名称" },
        { key: "taskOrder", label: "任务序号" },
        { key: "name", label: "任务名称" },
        { key: "prev", label: "前置任务" },
        { key: "relation", label: "关系" },
        { key: "gap", label: "间隔" },
        { key: "qty", label: "工程量" },
        { key: "unit", label: "单位" },
        { key: "craft", label: "工艺" },
        { key: "metric", label: "工效" },
        { key: "crew", label: "班组" },
        { key: "duration", label: "工期" },
      ],
    },
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    ' xmlns:o="urn:schemas-microsoft-com:office:office"',
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">',
    `<Title>${escapeXml(projectId)} construction config</Title>`,
    `<Created>${new Date().toISOString()}</Created>`,
    "</DocumentProperties>",
    ...sheets.map((sheet) => worksheet(sheet)),
    "</Workbook>",
  ].join("");
}
