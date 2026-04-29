import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const inputPath = "D:/codex/项目结构物数据.txt";
const outputDir = "D:/codex/outputs/project-structure-tree";
const outputPath = path.join(outputDir, "项目结构物树形结构.xlsx");

const raw = await fs.readFile(inputPath, "utf8");
const parsed = JSON.parse(raw);
const root = parsed.data ?? parsed;

const maxDepth = 6;
const rows = [];
const levelStats = new Map();
const typeStats = new Map();

function getChildren(node) {
  return Array.isArray(node.children) ? node.children : [];
}

function addStat(map, key, patch) {
  const current = map.get(key) ?? { total: 0, leaves: 0 };
  current.total += patch.total ?? 0;
  current.leaves += patch.leaves ?? 0;
  map.set(key, current);
}

function walk(node, depth, ancestors, parent, siblingIndex, siblingCount, prefixParts) {
  const children = getChildren(node);
  const isRoot = depth === 0;
  const isLast = siblingIndex === siblingCount - 1;
  const branch = isRoot ? "" : isLast ? "└─ " : "├─ ";
  const treeName = `${prefixParts.join("")}${branch}${node.name ?? ""}`;
  const pathNames = [...ancestors.map((item) => item.name ?? ""), node.name ?? ""];
  const levelColumns = Array.from({ length: maxDepth }, (_, index) => pathNames[index] ?? "");
  const isLeaf = children.length === 0;
  const displayLevel = depth + 1;

  rows.push([
    rows.length + 1,
    displayLevel,
    treeName,
    node.name ?? "",
    ...levelColumns,
    node.id ?? "",
    parent?.id ?? "",
    parent?.name ?? "",
    node.pid ?? "",
    pathNames.join(" / "),
    isLeaf ? "是" : "否",
    children.length,
    node.workPointId ?? "",
    node.categoryType ?? "",
    node.typeName ?? "",
    node.relationId ?? "",
    node.leaf ?? "",
    node.unit ?? "",
  ]);

  addStat(levelStats, displayLevel, { total: 1, leaves: isLeaf ? 1 : 0 });
  const typeKey = `${node.typeName ?? "未填写"}||${node.categoryType ?? ""}`;
  addStat(typeStats, typeKey, { total: 1, leaves: isLeaf ? 1 : 0 });

  const nextPrefixParts = isRoot ? [] : [...prefixParts, isLast ? "   " : "│  "];
  children.forEach((child, index) => {
    walk(child, depth + 1, [...ancestors, node], node, index, children.length, nextPrefixParts);
  });
}

walk(root, 0, [], null, 0, 1, []);

const headers = [
  "序号",
  "层级",
  "树形名称",
  "名称",
  "一级名称",
  "二级名称",
  "三级名称",
  "四级名称",
  "五级名称",
  "六级名称",
  "节点ID",
  "父节点ID",
  "父级名称",
  "源pid",
  "完整路径",
  "是否叶子",
  "子节点数",
  "workPointId",
  "categoryType",
  "typeName",
  "relationId",
  "源leaf",
  "unit",
];

function colLetter(indexZeroBased) {
  let number = indexZeroBased + 1;
  let letter = "";
  while (number > 0) {
    const remainder = (number - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    number = Math.floor((number - 1) / 26);
  }
  return letter;
}

function writeTable(sheet, topLeft, tableRows, widths, tableName) {
  const startCell = topLeft.match(/^([A-Z]+)(\d+)$/);
  if (!startCell) throw new Error(`Invalid top-left cell: ${topLeft}`);
  const startRow = Number(startCell[2]);
  const endRow = startRow + tableRows.length - 1;
  const endCol = colLetter(tableRows[0].length - 1);
  const rangeAddress = `${topLeft}:${endCol}${endRow}`;
  sheet.getRange(rangeAddress).values = tableRows;
  const headerRange = sheet.getRange(`${topLeft}:${endCol}${startRow}`);
  headerRange.format.font.bold = true;
  headerRange.format.font.color = "#FFFFFF";
  headerRange.format.fill.color = "#1F4E78";
  headerRange.format.horizontalAlignment = "Center";
  headerRange.format.verticalAlignment = "Center";
  sheet.getRange(rangeAddress).format.wrapText = false;
  const table = sheet.tables.add(rangeAddress, true);
  table.name = tableName;
  table.style = "TableStyleMedium2";
  table.showBandedRows = true;
  table.showFilterButton = true;
  widths.forEach((width, index) => {
    sheet.getRange(`${colLetter(index)}:${colLetter(index)}`).format.columnWidthPx = width;
  });
  sheet.freezePanes.freezeRows(startRow);
}

function setTitle(sheet, title, subtitle, colCount) {
  const lastCol = colLetter(colCount - 1);
  sheet.getRange(`A1:${lastCol}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format.font.bold = true;
  sheet.getRange("A1").format.font.size = 16;
  sheet.getRange("A1").format.font.color = "#17365D";
  sheet.getRange(`A2:${lastCol}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A2").format.font.color = "#666666";
}

const workbook = Workbook.create();
const treeSheet = workbook.worksheets.add("树形结构");
setTitle(
  treeSheet,
  "项目结构物树形结构",
  `来源：项目结构物数据.txt；共 ${rows.length} 个节点，最深 ${Math.max(...rows.map((row) => row[1]))} 层。`,
  headers.length,
);
writeTable(
  treeSheet,
  "A4",
  [headers, ...rows],
  [60, 60, 280, 180, 160, 170, 170, 170, 170, 170, 190, 190, 160, 190, 520, 80, 80, 190, 110, 120, 190, 80, 80],
  "TreeStructure",
);
treeSheet.getRange("A:A").format.horizontalAlignment = "Center";
treeSheet.getRange("B:B").format.horizontalAlignment = "Center";
treeSheet.getRange("P:Q").format.horizontalAlignment = "Center";
treeSheet.getRange("S:S").format.horizontalAlignment = "Center";
treeSheet.getRange("W:W").format.horizontalAlignment = "Center";

const levelSheet = workbook.worksheets.add("层级汇总");
const levelRows = [
  ["层级", "节点数", "叶子节点数", "非叶子节点数"],
  ...[...levelStats.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([level, stat]) => [level, stat.total, stat.leaves, stat.total - stat.leaves]),
];
setTitle(levelSheet, "层级汇总", "按展开后的树层级统计节点数量。", 4);
writeTable(levelSheet, "A4", levelRows, [80, 110, 120, 130], "LevelSummary");

const typeSheet = workbook.worksheets.add("类型汇总");
const typeRows = [
  ["typeName", "categoryType", "节点数", "叶子节点数", "非叶子节点数"],
  ...[...typeStats.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .map(([key, stat]) => {
      const [typeName, categoryType] = key.split("||");
      return [typeName, categoryType, stat.total, stat.leaves, stat.total - stat.leaves];
    }),
];
setTitle(typeSheet, "类型汇总", "按 typeName 和 categoryType 统计节点数量。", 5);
writeTable(typeSheet, "A4", typeRows, [140, 120, 100, 120, 130], "TypeSummary");

const infoSheet = workbook.worksheets.add("源信息");
const infoRows = [
  ["项目", "值"],
  ["源文件", inputPath],
  ["接口 code", parsed.code ?? ""],
  ["接口 message", parsed.message ?? ""],
  ["根节点ID", root.id ?? ""],
  ["根节点名称", root.name ?? ""],
  ["总节点数", rows.length],
  ["叶子节点数", rows.filter((row) => row[15] === "是").length],
  ["最大层级", Math.max(...rows.map((row) => row[1]))],
];
setTitle(infoSheet, "源信息", "原始 JSON 的基础信息和本次展开结果概览。", 2);
writeTable(infoSheet, "A4", infoRows, [160, 520], "SourceInfo");

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errorScan.ndjson);

await workbook.render({ sheetName: "树形结构", range: "A1:W18", scale: 1 });
await workbook.render({ sheetName: "层级汇总", range: "A1:D12", scale: 1 });
await workbook.render({ sheetName: "类型汇总", range: "A1:E12", scale: 1 });
await workbook.render({ sheetName: "源信息", range: "A1:B14", scale: 1 });

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({ outputPath, rowCount: rows.length, sheets: workbook.worksheets.items.map((sheet) => sheet.name) }, null, 2));
