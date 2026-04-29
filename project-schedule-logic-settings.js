const icons = {
  check: '<svg class="icon" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
  save: '<svg class="icon" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>',
  send: '<svg class="icon" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  plus: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  trash: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>',
  sort: '<svg class="icon" viewBox="0 0 24 24"><path d="m7 4-4 4 4 4"/><path d="M3 8h18"/><path d="m17 20 4-4-4-4"/><path d="M21 16H3"/></svg>',
  copy: '<svg class="icon" viewBox="0 0 24 24"><path d="M8 8h12v12H8Z"/><path d="M4 16V4h12"/></svg>',
  gear: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.31.52.98 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>',
  file: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
  folder: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  projectLine: '<svg class="icon tree-icon project-icon" viewBox="0 0 24 24"><path d="M4 20c2.8-2.8 2.8-6.2 5.4-8.2 2.9-2.2 6.5-.6 10.6-5.8"/><path d="M6 17h12"/><path d="M7 4v7"/><path d="M7 4h8l-1.7 2L15 8H7"/></svg>',
  workpointPin: '<svg class="icon tree-icon workpoint-icon" viewBox="0 0 24 24"><path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z"/><path d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"/><path d="M17 18h4"/><path d="M19 16v4"/></svg>',
  typeBridge: '<svg class="icon tree-icon type-icon" viewBox="0 0 24 24"><path d="M3 17h18"/><path d="M5 17c1.2-4 3.5-6 7-6s5.8 2 7 6"/><path d="M8 17v-5"/><path d="M16 17v-5"/><path d="M6 8h12"/></svg>',
  typeTunnel: '<svg class="icon tree-icon type-icon" viewBox="0 0 24 24"><path d="M4 20V11a8 8 0 0 1 16 0v9"/><path d="M8 20v-8a4 4 0 0 1 8 0v8"/><path d="M4 16h4"/><path d="M16 16h4"/></svg>',
  typeRoad: '<svg class="icon tree-icon type-icon" viewBox="0 0 24 24"><path d="M8 21 11 3"/><path d="m16 21-3-18"/><path d="M12 7v2"/><path d="M12 13v2"/><path d="M12 19v2"/></svg>',
  typeChart: '<svg class="icon tree-icon type-icon" viewBox="0 0 24 24"><path d="M12 5v6"/><path d="M6 11h12"/><path d="M5 15h5v5H5Z"/><path d="M14 15h5v5h-5Z"/><path d="M9 3h6v4H9Z"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};

const projectStructureSource = window.PROJECT_STRUCTURE_DATA || null;
const RESPONSIBILITY_STORAGE_KEY = "projectSchedule.responsibilityArea.v1";
let responsibilityAreaBaseSource = window.RESPONSIBILITY_AREA_DATA || null;

function loadSavedResponsibilityAreaSource(base) {
  if (!base) return null;
  try {
    const saved = JSON.parse(localStorage.getItem(RESPONSIBILITY_STORAGE_KEY) || "{}");
    if (saved?.payload?.source?.generatedAt === base?.source?.generatedAt) return saved.payload;
  } catch {
    return base;
  }
  return base;
}

let responsibilityAreaSource = loadSavedResponsibilityAreaSource(responsibilityAreaBaseSource);

const state = {
  selectedNodeId: "project-root",
  selectedStructureId: {},
  projectResponsibilityView: "team",
  workpointResponsibilityView: "crew",
  sortMode: "manual",
  selectedBeamIds: new Set(),
  checkDrawerOpen: false,
  modal: null,
  toast: "",
  pageStatus: "部分已配置",
  dirty: false,
  issues: [],
  scheduleResult: null,
  structureTasksById: {},
};

const fallbackTree = [
  {
    id: "project-root",
    name: "垫丰武高速公路工程TJ00标",
    type: "project",
    status: "未配置",
    expanded: true,
    children: [
      {
        id: "bridge",
        name: "桥梁工程",
        type: "discipline",
        status: "已配置",
        expanded: true,
        children: [
          { id: "qingyan-left", name: "青岩沟1号大桥左幅", type: "workpoint", status: "已配置" },
          { id: "qingyan-right", name: "青岩沟1号大桥右幅", type: "workpoint", status: "已配置" },
          { id: "baishi-left", name: "白石河大桥左幅", type: "workpoint", status: "已配置" },
          { id: "baishi-right", name: "白石河大桥右幅", type: "workpoint", status: "已配置" },
          { id: "tianwan-left", name: "田湾大桥左幅", type: "workpoint", status: "已配置" },
          { id: "tianwan-right", name: "田湾大桥右幅", type: "workpoint", status: "已配置" },
        ],
      },
      {
        id: "tunnel",
        name: "隧道工程",
        type: "discipline",
        status: "部分已配置",
        expanded: true,
        children: [
          { id: "longqing", name: "龙青山隧道", type: "workpoint", status: "已配置" },
          { id: "songlin", name: "松林隧道", type: "workpoint", status: "未配置" },
        ],
      },
      {
        id: "roadbed",
        name: "路基工程",
        type: "discipline",
        status: "已配置",
        expanded: true,
        children: [
          { id: "road-1", name: "K12+400~K12+800路基段", type: "workpoint", status: "已配置" },
          { id: "road-2", name: "K12+800~K13+200路基段", type: "workpoint", status: "已配置" },
          { id: "road-3", name: "K13+200~K13+600路基段", type: "workpoint", status: "已配置" },
        ],
      },
    ],
  },
];

const tree = Array.isArray(projectStructureSource?.tree) && projectStructureSource.tree.length
  ? projectStructureSource.tree
  : fallbackTree;

const fallbackWorkpoints = [
  { id: "qingyan-left", discipline: "桥梁工程", name: "青岩沟1号大桥左幅", prev: "", gap: "3", start: "2025年4月1日", mile: 12400 },
  { id: "qingyan-right", discipline: "桥梁工程", name: "青岩沟1号大桥右幅", prev: "青岩沟1号大桥左幅", gap: "3", start: "", mile: 12600 },
  { id: "baishi-left", discipline: "桥梁工程", name: "白石河大桥左幅", prev: "青岩沟1号大桥右幅", gap: "3", start: "", mile: 12800 },
  { id: "baishi-right", discipline: "桥梁工程", name: "白石河大桥右幅", prev: "白石河大桥左幅", gap: "3", start: "", mile: 13000 },
  { id: "tianwan-left", discipline: "桥梁工程", name: "田湾大桥左幅", prev: "白石河大桥右幅", gap: "3", start: "", mile: 13200 },
  { id: "tianwan-right", discipline: "桥梁工程", name: "田湾大桥右幅", prev: "田湾大桥左幅", gap: "3", start: "", mile: 13400 },
  { id: "longqing", discipline: "隧道工程", name: "龙青山隧道", prev: "", gap: "0", start: "2025年3月20日", mile: 13600 },
  { id: "songlin", discipline: "隧道工程", name: "松林隧道", prev: "龙青山隧道", gap: "7", start: "", mile: 14200 },
  { id: "road-1", discipline: "路基工程", name: "K12+400~K12+800路基段", prev: "", gap: "0", start: "2025年4月10日", mile: 12400 },
  { id: "road-2", discipline: "路基工程", name: "K12+800~K13+200路基段", prev: "K12+400~K12+800路基段", gap: "2", start: "", mile: 12800 },
  { id: "road-3", discipline: "路基工程", name: "K13+200~K13+600路基段", prev: "K12+800~K13+200路基段", gap: "2", start: "", mile: 13200 },
];

const workpoints = Array.isArray(projectStructureSource?.workpoints) && projectStructureSource.workpoints.length
  ? projectStructureSource.workpoints
  : fallbackWorkpoints;

const fallbackPierOptions = [
  "白石河大桥-左幅-0#台",
  "白石河大桥-左幅-5#墩",
  "白石河大桥-右幅-5#墩",
  "白石河大桥-右幅-13#台",
  "青岩沟1号大桥-左幅-0#台",
  "青岩沟1号大桥-左幅-7#墩",
  "青岩沟1号大桥-右幅-0#台",
  "田湾大桥-左幅-13#台",
  "田湾大桥-右幅-13#台",
];

const pierOptions = Array.isArray(projectStructureSource?.pierOptions) && projectStructureSource.pierOptions.length
  ? projectStructureSource.pierOptions
  : fallbackPierOptions;

const resources = [
  ...new Set([
    ...(
      Array.isArray(projectStructureSource?.resources) && projectStructureSource.resources.length
        ? projectStructureSource.resources
        : ["1号架桥机", "2号架桥机", "3号架桥机"]
    ),
    ...((responsibilityAreaSource?.beamLines || []).map((line) => line.resource).filter(Boolean)),
  ]),
];

const fallbackBeamLines = [
  { id: "beam-1", name: "架梁方向1", startPier: "白石河大桥-左幅-0#台", endPier: "田湾大桥-左幅-13#台", resource: "1号架桥机", transfer: "3", prev: "", startTime: "2025年6月1日" },
  { id: "beam-2", name: "架梁方向2", startPier: "白石河大桥-左幅-5#墩", endPier: "青岩沟1号大桥-左幅-0#台", resource: "1号架桥机", transfer: "3", prev: "架梁方向1", startTime: "" },
  { id: "beam-3", name: "架梁方向3", startPier: "白石河大桥-右幅-5#墩", endPier: "青岩沟1号大桥-右幅-0#台", resource: "2号架桥机", transfer: "3", prev: "", startTime: "2025年12月1日" },
  { id: "beam-4", name: "架梁方向4", startPier: "白石河大桥-右幅-5#墩", endPier: "田湾大桥-右幅-13#台", resource: "2号架桥机", transfer: "3", prev: "架梁方向3", startTime: "" },
];

let beamLines = Array.isArray(responsibilityAreaSource?.beamLines) && responsibilityAreaSource.beamLines.length
  ? responsibilityAreaSource.beamLines
  : Array.isArray(projectStructureSource?.beamLines) && projectStructureSource.beamLines.length
    ? projectStructureSource.beamLines
    : fallbackBeamLines;

const fallbackResponsibility = {
  team: [
    { name: "桥梁1队", scope: "青岩沟1号大桥左幅、青岩沟1号大桥右幅", content: "桩基、承台、墩台、桥面系", direction: "从小到大", crews: "桩基工班A、结构工班A、桥面系工班" },
    { name: "桥梁2队", scope: "白石河大桥左幅、白石河大桥右幅、田湾大桥左幅、田湾大桥右幅", content: "桩基、承台、墩台、简支箱梁配合", direction: "从小到大", crews: "桩基工班A、结构工班A、桥面系工班" },
    { name: "隧道1队", scope: "龙青山隧道", content: "洞口、开挖、初支、二衬", direction: "从小到大", crews: "-" },
    { name: "隧道2队", scope: "松林隧道", content: "洞口、开挖、初支、二衬", direction: "从大到小", crews: "-" },
    { name: "路基1队", scope: "K12+400~K13+600路基段", content: "土石方、填筑、防护", direction: "从小到大", crews: "土石方班组、填筑班组" },
  ],
  crew: [
    { name: "桩基工班A", scope: "青岩沟1号大桥左幅0#台~7#墩、青岩沟1号大桥右幅0#台~7#墩", content: "旋挖桩、钢筋笼、混凝土灌注", direction: "从小到大", team: "桥梁1队" },
    { name: "结构工班A", scope: "白石河大桥左幅0#台~13#台、白石河大桥右幅0#台~13#台", content: "承台、墩台、盖梁", direction: "从小到大", team: "桥梁2队" },
    { name: "桥面系工班", scope: "青岩沟1号大桥、白石河大桥、田湾大桥", content: "桥面铺装、防撞护栏、伸缩缝", direction: "从小到大", team: "桥梁1队、桥梁2队" },
    { name: "土石方班组", scope: "K12+400~K13+600路基段", content: "挖方、运方、填筑", direction: "从小到大", team: "路基1队" },
  ],
};

let responsibility = responsibilityAreaSource?.responsibility || fallbackResponsibility;

const fallbackStructureTemplates = {
  bridge: [
    { id: "abutment-0", name: "0#台", type: "墩台", expanded: true, children: [{ id: "abutment-0-pile", name: "桩基", type: "可施工部位" }, { id: "abutment-0-cap", name: "承台", type: "可施工部位" }, { id: "abutment-0-body", name: "台身", type: "可施工部位" }] },
    { id: "pier-1", name: "1#墩", type: "墩身", expanded: true, children: [{ id: "pier-1-pile", name: "桩基", type: "可施工部位" }, { id: "pier-1-cap", name: "承台", type: "可施工部位" }, { id: "pier-1-body", name: "墩身", type: "可施工部位" }, { id: "pier-1-girder", name: "盖梁", type: "可施工部位" }] },
    { id: "span-1", name: "第1跨", type: "跨号", expanded: true, children: [{ id: "span-1-box", name: "简支箱梁", type: "可施工部位" }, { id: "span-1-deck", name: "桥面系", type: "可施工部位" }] },
  ],
  tunnel: [
    { id: "portal-in", name: "进口洞门", type: "洞门", expanded: true, children: [{ id: "portal-in-slope", name: "边仰坡", type: "可施工部位" }, { id: "portal-in-wall", name: "洞门墙", type: "可施工部位" }] },
    { id: "section-a", name: "K0+000~K0+200", type: "区段", expanded: true, children: [{ id: "section-a-excavate", name: "开挖初支", type: "可施工部位" }, { id: "section-a-lining", name: "二次衬砌", type: "可施工部位" }] },
  ],
  road: [
    { id: "road-earth", name: "土石方段", type: "路基段", expanded: true, children: [{ id: "road-earth-cut", name: "挖方", type: "可施工部位" }, { id: "road-earth-fill", name: "填筑", type: "可施工部位" }] },
    { id: "road-protection", name: "防护排水", type: "附属", expanded: true, children: [{ id: "road-drain", name: "边沟", type: "可施工部位" }, { id: "road-slope", name: "边坡防护", type: "可施工部位" }] },
  ],
};

const structureTemplates = projectStructureSource?.structureTemplates && Object.keys(projectStructureSource.structureTemplates).length
  ? projectStructureSource.structureTemplates
  : fallbackStructureTemplates;

const structureTemplatesByWorkpoint = projectStructureSource?.structureTemplatesByWorkpoint || {};

const structureTasks = {
  pile: [
    { name: "桩基成孔", prev: "", relation: "FS", gap: "0", qty: "4", unit: "根", craft: "旋挖钻", metric: "1.2 根/天", crew: "桩基工班A", duration: "4天" },
    { name: "钢筋笼安装", prev: "桩基成孔", relation: "FS", gap: "0", qty: "4", unit: "根", craft: "吊装", metric: "2 根/天", crew: "桩基工班A", duration: "2天" },
    { name: "混凝土灌注", prev: "钢筋笼安装", relation: "FS", gap: "0", qty: "4", unit: "根", craft: "水下灌注", metric: "2 根/天", crew: "桩基工班A", duration: "2天" },
  ],
  cap: [
    { name: "基坑开挖", prev: "", relation: "FS", gap: "0", qty: "1", unit: "座", craft: "机械开挖", metric: "1 座/天", crew: "结构工班A", duration: "1天" },
    { name: "钢筋模板", prev: "基坑开挖", relation: "FS", gap: "1", qty: "1", unit: "座", craft: "钢筋绑扎", metric: "0.5 座/天", crew: "结构工班A", duration: "2天" },
    { name: "承台浇筑", prev: "钢筋模板", relation: "FS", gap: "0", qty: "1", unit: "座", craft: "现浇混凝土", metric: "1 座/天", crew: "结构工班A", duration: "1天" },
  ],
  body: [
    { name: "墩台身钢筋", prev: "", relation: "FS", gap: "0", qty: "1", unit: "座", craft: "钢筋绑扎", metric: "0.5 座/天", crew: "结构工班A", duration: "2天" },
    { name: "墩台身模板", prev: "墩台身钢筋", relation: "FS", gap: "0", qty: "1", unit: "座", craft: "翻模施工", metric: "0.5 座/天", crew: "结构工班A", duration: "2天" },
    { name: "墩台身浇筑", prev: "墩台身模板", relation: "FS", gap: "0", qty: "1", unit: "座", craft: "现浇混凝土", metric: "1 座/天", crew: "结构工班A", duration: "1天" },
  ],
  girder: [
    { name: "支座垫石", prev: "", relation: "FS", gap: "0", qty: "1", unit: "处", craft: "现浇混凝土", metric: "1 处/天", crew: "结构工班A", duration: "1天" },
    { name: "箱梁架设", prev: "支座垫石", relation: "FS", gap: "0", qty: "1", unit: "跨", craft: "架桥机架设", metric: "0.5 跨/天", crew: "桥面系工班", duration: "2天" },
  ],
  deck: [
    { name: "桥面铺装", prev: "", relation: "FS", gap: "0", qty: "1", unit: "跨", craft: "摊铺", metric: "0.5 跨/天", crew: "桥面系工班", duration: "2天" },
    { name: "防撞护栏", prev: "桥面铺装", relation: "FS", gap: "0", qty: "2", unit: "侧", craft: "现浇混凝土", metric: "1 侧/天", crew: "桥面系工班", duration: "2天" },
  ],
  tunnel: [
    { name: "超前支护", prev: "", relation: "FS", gap: "0", qty: "12", unit: "延米", craft: "管棚", metric: "6 延米/天", crew: "隧道开挖班组", duration: "2天" },
    { name: "开挖初支", prev: "超前支护", relation: "FS", gap: "0", qty: "12", unit: "延米", craft: "台阶法", metric: "3 延米/天", crew: "隧道开挖班组", duration: "4天" },
    { name: "二次衬砌", prev: "开挖初支", relation: "FS", gap: "2", qty: "12", unit: "延米", craft: "衬砌台车", metric: "6 延米/天", crew: "二衬班组", duration: "2天" },
  ],
  road: [
    { name: "清表", prev: "", relation: "FS", gap: "0", qty: "400", unit: "米", craft: "机械清表", metric: "200 米/天", crew: "土石方班组", duration: "2天" },
    { name: "路基填筑", prev: "清表", relation: "FS", gap: "0", qty: "12000", unit: "方", craft: "分层填筑", metric: "2000 方/天", crew: "填筑班组", duration: "6天" },
    { name: "边坡防护", prev: "路基填筑", relation: "FS", gap: "1", qty: "400", unit: "米", craft: "浆砌片石", metric: "80 米/天", crew: "防护班组", duration: "5天" },
  ],
};

const fallbackWorkpointResponsibility = {
  bridge: {
    team: [
      { name: "桥梁1队", scope: "当前桥梁工点", content: "桩基、下部结构、桥面系", direction: "从小到大", crews: "桩基工班A、结构工班A、桥面系工班" },
      { name: "架梁作业队", scope: "当前桥梁工点对应跨号", content: "简支箱梁架设配合", direction: "从小到大", crews: "架梁班组" },
    ],
    crew: [
      { name: "桩基工班A", scope: "0#台~7#墩", content: "桩基成孔、钢筋笼、灌注", direction: "从小到大", team: "桥梁1队" },
      { name: "结构工班A", scope: "0#台~7#墩", content: "承台、墩身、盖梁", direction: "从小到大", team: "桥梁1队" },
      { name: "桥面系工班", scope: "第1跨~第6跨", content: "桥面铺装、防撞护栏", direction: "从小到大", team: "桥梁1队" },
    ],
  },
  tunnel: {
    team: [{ name: "隧道1队", scope: "当前隧道工点", content: "洞口、开挖、初支、二衬", direction: "从小到大", crews: "隧道开挖班组、二衬班组" }],
    crew: [
      { name: "隧道开挖班组", scope: "进口~出口", content: "超前支护、开挖初支", direction: "从小到大", team: "隧道1队" },
      { name: "二衬班组", scope: "进口~出口", content: "仰拱、二次衬砌", direction: "从小到大", team: "隧道1队" },
    ],
  },
  road: {
    team: [{ name: "路基1队", scope: "当前路基段", content: "土石方、填筑、防护", direction: "从小到大", crews: "土石方班组、填筑班组、防护班组" }],
    crew: [
      { name: "土石方班组", scope: "全路基段", content: "清表、挖方、运方", direction: "从小到大", team: "路基1队" },
      { name: "填筑班组", scope: "全路基段", content: "分层填筑、碾压", direction: "从小到大", team: "路基1队" },
      { name: "防护班组", scope: "边坡及排水", content: "边沟、边坡防护", direction: "从小到大", team: "路基1队" },
    ],
  },
};

let workpointResponsibility = responsibilityAreaSource?.workpointResponsibility || fallbackWorkpointResponsibility;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function activeResponsibilityAssignments() {
  return asArray(responsibilityAreaSource?.assignments).filter((row) => row.isLeaf === "是" && row.teamId);
}

function activeResponsibilityDirections() {
  return asArray(responsibilityAreaSource?.directions).filter((row) => row.subjectId || row.subjectName || row.name);
}

function assignmentMatchesWorkpoint(row, workpoint) {
  if (!workpoint) return false;
  return row.plannedWorkpointId === workpoint.id
    || row.plannedWorkpointName === workpoint.name
    || row.workpointId === workpoint.sourceId
    || row.workpointId === workpoint.id
    || row.workpointName === workpoint.baseName
    || row.workpointName === workpoint.name;
}

function directionMatchesWorkpoint(row, workpoint) {
  if (!workpoint) return false;
  const scope = `${row.scope || ""}${row.plannedWorkpointName || ""}`;
  return row.plannedWorkpointId === workpoint.id
    || row.plannedWorkpointName === workpoint.name
    || scope.includes(workpoint.name);
}

function responsibilityRowsForWorkpoints(view, scopedWorkpoints) {
  const workpointList = asArray(scopedWorkpoints);
  if (!workpointList.length) return view === "team" ? responsibility.team : responsibility.crew;
  if (!activeResponsibilityAssignments().length) {
    const keywords = workpointList.map((workpoint) => workpoint.name);
    return (responsibility[view] || []).filter((row) => keywords.some((keyword) => `${row.scope || ""}${row.name || ""}`.includes(keyword)));
  }

  if (view === "team") {
    return buildTeamResponsibilityRows(
      activeResponsibilityAssignments().filter((row) => workpointList.some((workpoint) => assignmentMatchesWorkpoint(row, workpoint)))
    );
  }

  return buildCrewResponsibilityRows(
    activeResponsibilityDirections().filter((row) => workpointList.some((workpoint) => directionMatchesWorkpoint(row, workpoint)))
  );
}

function buildTeamResponsibilityRows(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = row.teamId || row.teamName || "未设置队伍";
    if (!groups.has(key)) {
      groups.set(key, {
        name: row.teamName || key,
        scopeSet: new Set(),
        crewSet: new Set(),
      });
    }
    const group = groups.get(key);
    if (row.plannedWorkpointName) group.scopeSet.add(row.plannedWorkpointName);
    if (row.subjectName) group.crewSet.add(row.subjectName);
  });
  return [...groups.values()].map((group) => ({
    name: group.name,
    scope: [...group.scopeSet].join("、") || "-",
    crews: [...group.crewSet].join("、") || "-",
  }));
}

function directionAssignments(row) {
  return activeResponsibilityAssignments().filter((assignment) => {
    if (row.directionId && `${assignment.plannedWorkpointId}|${assignment.subjectId}` === row.directionId) return true;
    return assignment.plannedWorkpointId === row.plannedWorkpointId && assignment.subjectId === row.subjectId;
  });
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

function abutmentNumberMap(rows = activeResponsibilityAssignments()) {
  const map = new Map();
  rows.forEach((row) => {
    const text = `${row.name || ""}${row.rawPath || ""}`;
    const matches = [...text.matchAll(/(\d+)\s*(?:#|号)\s*台/g)];
    matches.forEach((match) => {
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

function summarizeAssignmentScope(rows) {
  const abutments = abutmentNumberMap();
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
  const content = [...new Set(rows.map(contentTypeForAssignment).filter(Boolean))];
  return content.join("、");
}

function buildCrewResponsibilityRows(rows) {
  return rows.map((row, index) => {
    const assignments = directionAssignments(row);
    const sourceIndex = activeResponsibilityDirections().findIndex((item) => item.directionId === row.directionId);
    return {
      name: row.subjectName || row.name || row.subjectId || "-",
      scope: summarizeAssignmentScope(assignments) || row.scope || row.plannedWorkpointName || "-",
      content: summarizeAssignmentContent(assignments) || row.content || "-",
      direction: row.direction || "从小到大",
      team: row.teamName || row.team || "-",
      directionId: row.directionId,
      plannedWorkpointId: row.plannedWorkpointId,
      _sourceIndex: sourceIndex >= 0 ? sourceIndex : index,
    };
  });
}

function buildProjectResponsibilityFromSource() {
  const assignments = activeResponsibilityAssignments();
  const directions = activeResponsibilityDirections();
  if (!assignments.length && !directions.length) return responsibilityAreaSource?.responsibility || fallbackResponsibility;
  return {
    team: buildTeamResponsibilityRows(assignments),
    crew: buildCrewResponsibilityRows(directions),
  };
}

function buildWorkpointResponsibilityFromSource() {
  const result = {
    bridge: { team: [], crew: [] },
    tunnel: { team: [], crew: [] },
    road: { team: [], crew: [] },
  };
  ["bridge", "tunnel", "road"].forEach((kind) => {
    const scopedWorkpoints = workpoints.filter((workpoint) => workpointKind(workpoint) === kind);
    result[kind] = {
      team: responsibilityRowsForWorkpoints("team", scopedWorkpoints),
      crew: responsibilityRowsForWorkpoints("crew", scopedWorkpoints),
    };
  });
  return result;
}

function rebuildResponsibilityState() {
  responsibility = buildProjectResponsibilityFromSource();
  workpointResponsibility = buildWorkpointResponsibilityFromSource();
}

rebuildResponsibilityState();

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function flattenTree(nodes = tree, level = 0, visible = true, rows = []) {
  nodes.forEach((node) => {
    rows.push({ ...node, level, visible });
    if (node.children) flattenTree(node.children, level + 1, visible && node.expanded !== false, rows);
  });
  return rows;
}

function findTreeNode(id, nodes = tree) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findTreeNode(id, node.children);
      if (found) return found;
    }
  }
  return null;
}

function setTreeStatus(id, status, nodes = tree) {
  for (const node of nodes) {
    if (node.id === id) {
      node.status = status;
      return true;
    }
    if (node.children && setTreeStatus(id, status, node.children)) return true;
  }
  return false;
}

function currentNode() {
  return findTreeNode(state.selectedNodeId) || tree[0];
}

function currentWorkpoint() {
  return workpoints.find((item) => item.id === state.selectedNodeId) || null;
}

function isWorkpointView() {
  return currentNode().type === "workpoint";
}

function workpointKind(workpoint = currentWorkpoint()) {
  if (!workpoint) return "bridge";
  if (workpoint.kind) return workpoint.kind;
  if (workpoint.discipline.includes("隧道")) return "tunnel";
  if (workpoint.discipline.includes("路基")) return "road";
  return "bridge";
}

function projectScopeKind() {
  const node = currentNode();
  if (node.id.includes("bridge") || node.name.includes("桥梁")) return "bridge";
  if (node.id.includes("tunnel") || node.name.includes("隧道")) return "tunnel";
  if (node.id.includes("road") || node.name.includes("路基")) return "road";
  return "all";
}

function isWorkpointInProjectScope(workpoint) {
  const kind = projectScopeKind();
  if (kind === "all") return true;
  if (kind === "bridge") return workpoint.discipline.includes("桥梁");
  if (kind === "tunnel") return workpoint.discipline.includes("隧道");
  if (kind === "road") return workpoint.discipline.includes("路基");
  return true;
}

function optionList(options, current) {
  return options
    .map((item) => {
      const value = typeof item === "string" ? item : item.value;
      const label = typeof item === "string" ? item : item.label;
      return `<option value="${escapeAttr(value)}" ${value === current ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function statusClass(status) {
  if (status.includes("异常")) return "error";
  if (status.includes("暂存")) return "saved";
  if (status.includes("已配置") || status.includes("可发布") || status.includes("已发布")) return "done";
  return "pending";
}

function nodeTypeLabel(type) {
  const labels = { project: "项目", discipline: "专业", unit: "单位工程", workpoint: "工点" };
  return labels[type] || type;
}

function treeIcon(row) {
  if (row.type === "project") return icons.projectLine;
  if (row.type === "workpoint") return icons.workpointPin;
  if (row.name.includes("桥梁")) return icons.typeBridge;
  if (row.name.includes("隧道")) return icons.typeTunnel;
  if (row.name.includes("路基")) return icons.typeRoad;
  return icons.typeChart;
}

function isNonNegativeInteger(value) {
  return /^\d+$/.test(String(value ?? "").trim());
}

function isValidManualDate(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return true;
  let match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!match) match = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function currentScopeText() {
  const node = currentNode();
  if (isWorkpointView()) return `工点级视图：${node.name}，配置内部结构对象任务逻辑。`;
  return `${nodeTypeLabel(node.type)}范围：${node.name}，展示项目级排程逻辑配置。`;
}

function sortedProjectWorkpoints() {
  const rows = workpoints.filter(isWorkpointInProjectScope);
  if (state.sortMode === "discipline") {
    rows.sort((a, b) => a.discipline.localeCompare(b.discipline, "zh-Hans-CN") || a.mile - b.mile);
  }
  if (state.sortMode === "mile") {
    rows.sort((a, b) => a.mile - b.mile || a.discipline.localeCompare(b.discipline, "zh-Hans-CN"));
  }
  return rows;
}

function projectWorkpointGroups() {
  const groups = [];
  const byDiscipline = new Map();
  sortedProjectWorkpoints().forEach((workpoint) => {
    if (!byDiscipline.has(workpoint.discipline)) {
      const group = { discipline: workpoint.discipline, rows: [] };
      byDiscipline.set(workpoint.discipline, group);
      groups.push(group);
    }
    byDiscipline.get(workpoint.discipline).rows.push(workpoint);
  });
  return groups;
}

function sameDisciplineWorkpointIndexes(index) {
  const discipline = workpoints[index]?.discipline;
  if (!discipline) return [];
  return workpoints
    .map((workpoint, workpointIndex) => ({ workpoint, workpointIndex }))
    .filter(({ workpoint }) => workpoint.discipline === discipline && isWorkpointInProjectScope(workpoint))
    .map(({ workpointIndex }) => workpointIndex);
}

function projectWorkpointMoveState(index) {
  const indexes = sameDisciplineWorkpointIndexes(index);
  const position = indexes.indexOf(index);
  return {
    canMoveUp: position > 0,
    canMoveDown: position >= 0 && position < indexes.length - 1,
  };
}

function syncWorkpointPrevLinks(discipline) {
  const indexes = workpoints
    .map((workpoint, index) => ({ workpoint, index }))
    .filter(({ workpoint }) => workpoint.discipline === discipline)
    .map(({ index }) => index);

  indexes.forEach((workpointIndex, position) => {
    const previous = position === 0 ? "" : workpoints[indexes[position - 1]]?.name || "";
    workpoints[workpointIndex].prev = previous;
    if (!isNonNegativeInteger(workpoints[workpointIndex].gap)) workpoints[workpointIndex].gap = "0";
  });
}

function moveProjectWorkpoint(index, direction) {
  const indexes = sameDisciplineWorkpointIndexes(index);
  const position = indexes.indexOf(index);
  const targetPosition = position + direction;
  if (position < 0 || targetPosition < 0 || targetPosition >= indexes.length) return false;
  const targetIndex = indexes[targetPosition];
  [workpoints[index], workpoints[targetIndex]] = [workpoints[targetIndex], workpoints[index]];
  syncWorkpointPrevLinks(workpoints[targetIndex]?.discipline);
  markDirty();
  render();
  return true;
}

function scopedBeamLines() {
  const kind = projectScopeKind();
  return kind === "all" || kind === "bridge" ? beamLines : [];
}

function scopedProjectResponsibilityRows(view) {
  return responsibilityRowsForWorkpoints(view, sortedProjectWorkpoints())
    .map((row, index) => ({ ...row, _sourceIndex: row._sourceIndex ?? index }));
}

function collectConstructionUnits(nodes = []) {
  const units = [];
  const seen = new Set();
  function visit(node) {
    (node.constructionUnits || []).forEach((unit) => {
      const key = unit.id || unit.name;
      if (!seen.has(key)) {
        seen.add(key);
        units.push(unit);
      }
    });
    (node.children || []).forEach(visit);
  }
  nodes.forEach(visit);
  return units;
}

function unitsForWorkpoint(workpoint) {
  if (!workpoint) return [];
  return collectConstructionUnits(getStructureTree(workpoint));
}

function unitsForCurrentProjectScope() {
  return sortedProjectWorkpoints().flatMap((workpoint) => unitsForWorkpoint(workpoint));
}

function responsibilityContentName(unit) {
  return unit?.item || unit?.component || displayConstructionUnitTaskName(unit);
}

function responsibilityContentForUnits(units) {
  const names = [...new Set(units.map(responsibilityContentName).filter(Boolean))];
  return names.length ? names.join("、") : "-";
}

function getStructureTree(workpoint = currentWorkpoint()) {
  const workpointStructure = workpoint ? structureTemplatesByWorkpoint[workpoint.id] : null;
  if (Array.isArray(workpointStructure) && workpointStructure.length) return workpointStructure;
  return structureTemplates[workpointKind(workpoint)] || structureTemplates.bridge || [];
}

function flattenStructures(nodes = getStructureTree(), level = 0, visible = true, rows = []) {
  nodes.forEach((node) => {
    rows.push({ ...node, level, visible });
    if (node.children) flattenStructures(node.children, level + 1, visible && node.expanded !== false, rows);
  });
  return rows;
}

function defaultStructureId() {
  const firstLeaf = flattenStructures().find((item) => item.visible && !item.children);
  return firstLeaf?.id || getStructureTree()[0]?.id || "";
}

function currentStructureId() {
  const wp = currentWorkpoint();
  if (!wp) return "";
  if (!state.selectedStructureId[wp.id]) state.selectedStructureId[wp.id] = defaultStructureId();
  return state.selectedStructureId[wp.id];
}

function structureTaskKind(structureId = currentStructureId()) {
  const structure = flattenStructures().find((item) => item.id === structureId);
  const text = `${structureId}${structure?.name || ""}${structure?.type || ""}`;
  if (text.includes("桩基") || structureId.includes("pile")) return "pile";
  if (text.includes("承台") || text.includes("盖梁") || structureId.includes("cap")) return "cap";
  if (text.includes("墩身") || text.includes("台身") || text.includes("洞门墙") || structureId.includes("body") || structureId.includes("wall")) return "body";
  if (text.includes("箱梁") || text.includes("现浇连续梁") || text.includes("号梁") || structureId.includes("box") || structureId.includes("girder")) return "girder";
  if (text.includes("桥面") || structureId.includes("deck")) return "deck";
  if (workpointKind() === "tunnel") return "tunnel";
  if (workpointKind() === "road") return "road";
  return "cap";
}

function theoreticalProductivityRows() {
  return (Array.isArray(responsibilityAreaSource?.productivity) ? responsibilityAreaSource.productivity : [])
    .filter((row) => row && row.enabled !== "否");
}

function splitMatchTokens(value) {
  return String(value || "")
    .split(/[|、,，/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function productivityMatchText(group) {
  const structure = group.structure || flattenStructures().find((item) => item.id === currentStructureId()) || {};
  const wp = group.workpoint || currentWorkpoint() || {};
  return [
    group.name,
    group.unit,
    group.item,
    group.component,
    group.subPart,
    group.sampleUnit?.name,
    group.sampleUnit?.item,
    group.sampleUnit?.component,
    group.sampleUnit?.subPart,
    structure.id,
    structure.name,
    structure.type,
    wp.name,
    wp.discipline,
  ].filter(Boolean).join("|");
}

function productivityForTaskGroup(group) {
  const rows = theoreticalProductivityRows();
  const text = productivityMatchText(group);
  const scoreRow = (row) => {
    let score = 0;
    const structureType = row.structureType || "";
    const procedure = row.procedure || "";
    const craft = row.craft || "";
    const keywords = splitMatchTokens(row.keywords);
    if (group.name && group.name === structureType) score += 80;
    if (group.name && group.name === procedure) score += 70;
    if (structureType && text.includes(structureType)) score += 35;
    if (procedure && text.includes(procedure)) score += 30;
    keywords.forEach((token) => {
      if (text.includes(token)) score += 18;
    });
    if (row.quantityUnit && row.quantityUnit === group.unit) score += 8;
    if (text.includes("桩基") && craft === "旋挖钻") score += 200;
    if (text.includes("墩身") && craft === "整体式浇筑") score += 200;
    return score;
  };
  return rows
    .map((row) => ({ row, score: scoreRow(row) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.row || null;
}

function metricTextFromProductivity(row) {
  if (!row) return "";
  const value = row.productivity || "";
  const unit = row.productivityUnit || "";
  return [value, unit].filter(Boolean).join(" ");
}

function getCurrentTasks() {
  const units = currentConstructionUnits();
  if (units.length) {
    const structureId = currentStructureId();
    const structure = flattenStructures().find((item) => item.id === structureId) || null;
    const signature = units.map((unit) => unit.id || unit.name).join("|");
    const cached = state.structureTasksById[structureId];
    if (cached?.fromExcel) return cached.tasks;
    if (!cached || cached.signature !== signature) {
      state.structureTasksById[structureId] = {
        signature,
        tasks: groupConstructionUnitsToTasks(units, { structure, workpoint: currentWorkpoint() }),
      };
    }
    return state.structureTasksById[structureId].tasks;
  }
  const kind = structureTaskKind();
  return structureTasks[kind] || structureTasks.cap;
}

function escapeRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function displayConstructionUnitTaskName(unit) {
  const original = String(unit?.name || "").trim();
  let name = original.replace(/^(左幅|右幅|左洞|右洞)/, "");

  if (unit?.spanStartNo && unit?.spanEndNo) {
    const start = escapeRegExp(unit.spanStartNo);
    const end = escapeRegExp(unit.spanEndNo);
    name = name.replace(new RegExp(`^${start}-${end}号(?:墩)?(?:梁)?[-－—–]?`), "");
    if (/^\d+$/.test(name)) return `${name}号梁片`;
    return name || unit.item || unit.component || original;
  }

  if (unit?.pierNo) {
    const pierNo = escapeRegExp(unit.pierNo);
    name = name.replace(new RegExp(`^${pierNo}(?:#|号墩|号台|号)?`), "");
    name = name.replace(/^[-－—–]/, "");
  }

  return name || unit?.item || unit?.component || original;
}

function taskGroupName(unit) {
  const item = unit?.item || unit?.component || "";
  const component = unit?.component || "";

  if (item.includes("桩基") || component.includes("桩基")) return "桩基";
  if (item.includes("简支箱梁") || component.includes("简支箱梁")) return "梁片";
  if (item.includes("现浇连续梁")) {
    if (component.includes("T构块")) {
      if (unit.subNo === "0") return `${unit.pierNo}号墩-0#块`;
      if (String(unit.subNo || "").includes("'")) return `${unit.pierNo}#墩-标准块1'#~5'#块`;
      return `${unit.pierNo}#墩-标准块1#~5#块`;
    }
    if (component.includes("合拢段")) return stripTaskSidePrefix(unit.name);
    if (component.includes("直线段")) return stripTaskSidePrefix(unit.name);
    return "现浇连续梁";
  }

  return item || component || displayConstructionUnitTaskName(unit);
}

function stripTaskSidePrefix(name) {
  return String(name || "").replace(/^(左幅|右幅|左洞|右洞)/, "");
}

function taskGroupKey(unit) {
  return `${taskGroupName(unit)}|${taskGroupUnit(unit)}`;
}

function taskGroupUnit(unit) {
  if ((unit?.item || "").includes("现浇连续梁") && (unit?.component || "").includes("T构块")) return "块";
  return unit?.unit || "项";
}

function groupConstructionUnitsToTasks(units, context = {}) {
  const groups = new Map();
  units.forEach((unit) => {
    const key = taskGroupKey(unit);
    if (!groups.has(key)) {
      groups.set(key, {
        name: taskGroupName(unit),
        unit: taskGroupUnit(unit),
        count: 0,
        item: unit?.item || "",
        component: unit?.component || "",
        subPart: unit?.subPart || "",
        sampleUnit: unit,
        structure: context.structure || null,
        workpoint: context.workpoint || null,
      });
    }
    groups.get(key).count += 1;
  });

  return [...groups.values()].map((group, index, rows) => constructionUnitGroupToTask(group, index, rows));
}

function constructionUnitGroupToTask(group, index, groups) {
  const previousName = index === 0 ? "" : groups[index - 1]?.name || "";
  const productivity = productivityForTaskGroup(group);
  const metric = metricTextFromProductivity(productivity);
  return {
    name: group.name || `施工单元${index + 1}`,
    prev: previousName,
    relation: "FS",
    gap: "0",
    qty: String(group.count || 1),
    unit: group.unit || "项",
    craft: productivity?.craft || "",
    metric,
    crew: "",
    duration: recalcDuration({
      qty: String(group.count || 1),
      metric,
      duration: "1天",
    }),
  };
}

function getScheduleEngineInput() {
  return {
    workpoints,
    beamLines,
    responsibility,
    workpointResponsibility,
    structureTemplates,
    structureTasks,
    systemParams: {
      tunnelPassageLagDays: 7,
      roadPassageLagDays: 3,
    },
  };
}

function runScheduleEngine(mode) {
  if (!window.ProjectScheduleEngine) {
    return {
      ok: false,
      mode,
      issues: [
        createIssue({
          level: "error",
          module: "network",
          row: 0,
          levelName: "系统",
          nodeName: "计划生成",
          moduleName: "算法引擎",
          message: "排程算法引擎未加载，请检查 project-schedule-engine.js 是否正确引入。",
          nodeId: "project-root",
        }),
      ],
      stats: null,
      scheduleRows: [],
      workpointResults: [],
    };
  }
  return window.ProjectScheduleEngine.run(getScheduleEngineInput(), { mode });
}

function render() {
  document.getElementById("app").innerHTML = `
    <div class="page">
      ${renderTopbar()}
      <div class="layout">
        ${renderTreePanel()}
        <main class="content-panel">
          ${renderContentHead()}
          ${isWorkpointView() ? renderWorkpointLevelView() : renderProjectLevelView()}
        </main>
      </div>
      ${state.checkDrawerOpen ? renderCheckDrawer() : ""}
      ${state.modal ? renderModal() : ""}
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
    </div>
  `;
}

function renderTopbar() {
  const sourceMeta = projectStructureSource?.source
    ? `已载入 ${projectStructureSource.source.workpointCount || workpoints.length} 个工点 / ${projectStructureSource.source.constructionUnitCount || 0} 个施工单元`
    : "统一配置项目级与工点级施工组织逻辑";
  return `
    <header class="topbar">
      <div class="title-block">
        <h1>计划排程逻辑设置</h1>
        <span class="title-meta">${escapeHtml(sourceMeta)}</span>
      </div>
      ${renderPageNav("schedule")}
      <div class="top-actions">
        <button class="btn" data-action="check">${icons.check}异常与冲突检查</button>
        <button class="btn" data-action="save">${icons.save}暂存</button>
        <button class="btn primary" data-action="publish">${icons.send}发布计划</button>
      </div>
    </header>
  `;
}

function renderPageNav(active) {
  return `
    <nav class="page-nav" aria-label="页面导航">
      <a class="${active === "responsibility" ? "active" : ""}" href="responsibility-area-settings.html" data-page-nav="responsibility-area-settings.html">责任区域设置</a>
      <a class="${active === "schedule" ? "active" : ""}" href="project-schedule-logic-settings.html" data-page-nav="project-schedule-logic-settings.html">计划排程逻辑</a>
    </nav>
  `;
}

function renderTreePanel() {
  return `
    <aside class="tree-panel">
      <div class="tree-scroll">
        ${flattenTree()
          .filter((row) => row.visible)
          .map(renderTreeRow)
          .join("")}
      </div>
    </aside>
  `;
}

function renderTreeRow(row) {
  const hasChildren = Array.isArray(row.children) && row.children.length > 0;
  const showStatus = row.type === "project" || row.type === "workpoint";
  return `
    <div class="tree-row level-${Math.min(row.level, 3)} ${row.id === state.selectedNodeId ? "active" : ""}" data-node-id="${row.id}">
      <button class="tree-toggle ${hasChildren ? "" : "placeholder"}" data-tree-toggle="${row.id}" title="${row.expanded ? "收起" : "展开"}">
        ${hasChildren ? (row.expanded ? "⌄" : "›") : ""}
      </button>
      ${treeIcon(row)}
      <span class="tree-name">${escapeHtml(row.name)}</span>
      ${showStatus ? `<span class="status ${statusClass(row.status)}">${escapeHtml(row.status)}</span>` : '<span class="tree-status-placeholder"></span>'}
    </div>
  `;
}

function renderContentHead() {
  const node = currentNode();
  const viewTitle = isWorkpointView() ? "工点级施工组织逻辑" : "项目级施工组织逻辑";
  const viewMeta = isWorkpointView() ? `${node.name} / 结构对象 / 任务拆解 / 班组责任` : "资源池/责任范围/线路组织";
  return `
    <section class="content-head">
      <div class="content-title">
        <h2>${viewTitle}</h2>
        <span>${escapeHtml(viewMeta)}</span>
      </div>
      <div class="status-strip">
        <span class="status ${statusClass(state.pageStatus)}">${escapeHtml(state.pageStatus)}</span>
        <span class="status saved">${state.dirty ? "存在未暂存修改" : currentScopeText()}</span>
      </div>
    </section>
  `;
}

function renderProjectLevelView() {
  return `
    ${renderProjectWorkpointModule()}
    ${renderBeamModule()}
    ${renderProjectResponsibilityModule()}
    ${renderScheduleResultModule()}
  `;
}

function renderProjectWorkpointModule() {
  const groups = projectWorkpointGroups();
  let displayIndex = 0;
  return `
    <section class="module" id="module-project-workpoint">
      <div class="module-head">
        <div class="module-title">
          <h3>工点推进顺序</h3>
          <p>设置各工点在施工组织层面的推进先后，不直接等同于严格前后置逻辑；系统后续会结合班组责任区域、施工方向、资源配置等规则，自动展开任务级依赖关系。</p>
        </div>
      </div>
      <div class="module-body">
        <div class="table-wrap">
          <table class="workpoint-order-table">
            <thead>
              <tr>
                <th class="check-cell"><input class="checkbox" type="checkbox" disabled /></th>
                <th class="serial-cell">序号</th>
                <th>工点名称</th>
                <th style="width: 260px;">开工时间设定</th>
                <th style="width: 260px;">顺序调整</th>
              </tr>
            </thead>
            <tbody>
              ${groups
                .map((group) => {
                  displayIndex += 1;
                  const groupRow = `
                    <tr class="workpoint-group-row">
                      <td><input class="checkbox" type="checkbox" disabled /></td>
                      <td>${displayIndex}</td>
                      <td class="left">${escapeHtml(group.discipline)}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  `;
                  const workpointRows = group.rows.map((row) => {
                    displayIndex += 1;
                    const originalIndex = workpoints.findIndex((item) => item.id === row.id);
                    const moveState = projectWorkpointMoveState(originalIndex);
                    return `
                      <tr data-project-workpoint-row="${originalIndex}">
                        <td><input class="checkbox" type="checkbox" /></td>
                        <td>${displayIndex}</td>
                        <td class="left">${escapeHtml(row.name)}</td>
                        <td><input class="date-field ${row.start ? "" : "empty"}" data-project-workpoint-field="start" data-index="${originalIndex}" value="${escapeAttr(row.start)}" placeholder="按顺序推导" /></td>
                        <td>
                          <div class="row-actions">
                            <button class="text-action" data-action="project-workpoint-up" data-index="${originalIndex}" ${moveState.canMoveUp ? "" : "disabled"}>上移</button>
                            <button class="text-action" data-action="project-workpoint-down" data-index="${originalIndex}" ${moveState.canMoveDown ? "" : "disabled"}>下移</button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join("");
                  return `${groupRow}${workpointRows}`;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderBeamModule() {
  const rows = scopedBeamLines();
  const isBridgeScope = rows.length > 0 || projectScopeKind() === "bridge" || projectScopeKind() === "all";
  return `
    <section class="module" id="module-beam">
      <div class="module-head">
        <div class="module-title">
          <h3>架梁施工顺序</h3>
          <p>配置桥梁架设线路顺序、架桥资源、转场时间和开始时间锚点。</p>
        </div>
        <div class="module-actions">
          <button class="btn primary" data-action="add-beam" ${isBridgeScope ? "" : "disabled"}>${icons.plus}添加方向</button>
          <button class="btn danger" data-action="delete-beam" ${isBridgeScope ? "" : "disabled"}>${icons.trash}删除方向</button>
        </div>
      </div>
      <div class="module-body">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="check-cell"><input class="checkbox" type="checkbox" data-action="toggle-all-beams" /></th>
                <th class="serial-cell">序号</th>
                <th style="width: 160px;">线路名称</th>
                <th style="width: 220px;">架梁起点墩号</th>
                <th style="width: 220px;">架梁终点墩号</th>
                <th style="width: 170px;">架桥资源</th>
                <th style="width: 140px;">转场时间</th>
                <th style="width: 180px;">前置架设区段</th>
                <th style="width: 210px;">开始架梁时间设定</th>
              </tr>
            </thead>
            <tbody>${rows.length ? rows.map(renderBeamRow).join("") : '<tr><td colspan="9" class="empty-text">当前范围无桥梁架梁施工顺序数据</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderBeamRow(row, index) {
  const prevOptions = [{ value: "", label: "" }, ...beamLines.filter((item) => item.id !== row.id).map((item) => ({ value: item.name, label: item.name }))];
  return `
    <tr data-beam-row="${index}">
      <td><input class="checkbox" type="checkbox" data-beam-select="${row.id}" ${state.selectedBeamIds.has(row.id) ? "checked" : ""} /></td>
      <td>${index + 1}</td>
      <td><input class="field" data-beam-field="name" data-index="${index}" value="${escapeAttr(row.name)}" /></td>
      <td><select class="select" data-beam-field="startPier" data-index="${index}">${optionList(pierOptions, row.startPier)}</select></td>
      <td><select class="select" data-beam-field="endPier" data-index="${index}">${optionList(pierOptions, row.endPier)}</select></td>
      <td><select class="select" data-beam-field="resource" data-index="${index}">${optionList(resources, row.resource)}</select></td>
      <td><span class="gap-group"><input class="field small" data-beam-field="transfer" data-index="${index}" value="${escapeAttr(row.transfer)}" inputmode="numeric" /><span>天</span></span></td>
      <td><select class="select" data-beam-field="prev" data-index="${index}">${optionList(prevOptions, row.prev)}</select></td>
      <td><input class="date-field ${row.startTime ? "" : "empty"}" data-beam-field="startTime" data-index="${index}" value="${escapeAttr(row.startTime)}" placeholder="按逻辑推算" /></td>
    </tr>
  `;
}

function renderProjectResponsibilityModule() {
  const isTeam = state.projectResponsibilityView === "team";
  const rows = scopedProjectResponsibilityRows(state.projectResponsibilityView);
  return renderResponsibilityModule({
    id: "module-responsibility",
    title: "队伍/班组责任区域",
    desc: "展示责任区域设置结果，明确队伍施工范围、包含班组，以及班组施工方向。",
    isTeam,
    rows,
    viewAttr: "project-responsibility-view",
  });
}

function renderScheduleResultModule() {
  const result = state.scheduleResult;
  if (!result) return "";

  const stats = result.stats || {};
  const errors = result.issues?.filter((item) => item.level === "error").length || 0;
  const warnings = result.issues?.filter((item) => item.level === "warning").length || 0;
  const rows = result.scheduleRows || [];
  const previewRows = rows.slice(0, 12);
  const statusText = errors ? "存在阻断项，暂不允许发布" : result.mode === "publish" ? "正式计划已生成" : "试算计划已生成";

  return `
    <section class="module" id="module-schedule-result">
      <div class="module-head">
        <div class="module-title">
          <h3>计划生成结果</h3>
          <p>${escapeHtml(statusText)}。当前算法已生成任务节点、控制节点、逻辑关系并执行前推排程。</p>
        </div>
        <div class="schedule-stats">
          <span>任务 ${escapeHtml(stats.taskCount ?? 0)}</span>
          <span>控制节点 ${escapeHtml(stats.controlNodeCount ?? 0)}</span>
          <span>关系 ${escapeHtml(stats.relationCount ?? 0)}</span>
          <span>异常 ${errors}</span>
          <span>警告 ${warnings}</span>
        </div>
      </div>
      <div class="module-body">
        ${
          rows.length
            ? `<div class="schedule-range">
                <span>项目开始：${escapeHtml(stats.projectStart || "-")}</span>
                <span>项目完成：${escapeHtml(stats.projectFinish || "-")}</span>
                <span>预览前 ${previewRows.length} 条任务，完整结果保存在页面状态中，后续可直接对接落库接口。</span>
              </div>
              <div class="table-wrap">
                <table class="schedule-table">
                  <thead>
                    <tr>
                      <th style="width: 170px;">活动编码</th>
                      <th style="width: 210px;">工点</th>
                      <th style="width: 150px;">结构对象</th>
                      <th style="width: 160px;">任务</th>
                      <th style="width: 150px;">班组</th>
                      <th style="width: 90px;">工期</th>
                      <th style="width: 130px;">计划开始</th>
                      <th style="width: 130px;">计划完成</th>
                      <th>前置来源</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${previewRows
                      .map(
                        (row) => `
                          <tr>
                            <td>${escapeHtml(row.activityCode)}</td>
                            <td class="left">${escapeHtml(row.workpointName)}</td>
                            <td>${escapeHtml(row.structureName)}</td>
                            <td class="left">${escapeHtml(row.taskName)}</td>
                            <td>${escapeHtml(row.crew)}</td>
                            <td>${escapeHtml(row.durationDays)}天</td>
                            <td>${escapeHtml(row.planStart)}</td>
                            <td>${escapeHtml(row.planFinish)}</td>
                            <td class="left">${escapeHtml(row.predecessorSources || "-")}</td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>`
            : `<div class="empty-text">当前存在阻断项或任务网络成环，未生成可预览的计划结果。请先打开“异常与冲突检查”处理问题。</div>`
        }
      </div>
    </section>
  `;
}

function renderResponsibilityModule({ id, title, desc, isTeam, rows, viewAttr }) {
  return `
    <section class="module" id="${id}">
      <div class="module-head">
        <div class="module-title">
          <h3>${title}</h3>
          <p>${desc}</p>
        </div>
        <div class="module-actions">
          <button class="btn primary" data-action="responsibility-setting">${icons.gear}责任区域设置</button>
        </div>
      </div>
      <div class="module-body">
        <div class="responsibility-head">
          <div class="tabs">
            <button class="tab ${isTeam ? "active" : ""}" data-${viewAttr}="team">队伍视图</button>
            <button class="tab ${!isTeam ? "active" : ""}" data-${viewAttr}="crew">班组视图</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              ${
                isTeam
                  ? `<tr>
                      <th class="check-cell"><input class="checkbox" type="checkbox" disabled /></th>
                      <th class="serial-cell">序号</th>
                      <th style="width: 180px;">队伍名称</th>
                      <th>施工范围</th>
                      <th style="width: 300px;">包含班组</th>
                    </tr>`
                  : `<tr>
                      <th class="check-cell"><input class="checkbox" type="checkbox" disabled /></th>
                      <th class="serial-cell">序号</th>
                      <th style="width: 180px;">队伍班组名称</th>
                      <th>施工范围</th>
                      <th style="width: 260px;">主要工程内容</th>
                      <th style="width: 210px;">施工方向</th>
                      <th style="width: 270px;">所属队伍</th>
                    </tr>`
              }
            </thead>
            <tbody>
              ${
                rows.length
                  ? rows.map(
                      (row, index) => `
                    <tr data-responsibility-row="${index}">
                      <td><input class="checkbox" type="checkbox" /></td>
                      <td>${index + 1}</td>
                      <td>${escapeHtml(row.name)}</td>
                      <td class="left">${escapeHtml(row.scope || "-")}</td>
                      ${
                        isTeam
                          ? `<td class="left">${escapeHtml(row.crews || "-")}</td>`
                          : `<td class="left">${escapeHtml(row.content || "-")}</td>
                             <td class="left"><select class="select" data-responsibility-direction="${row._sourceIndex ?? index}" data-responsibility-direction-id="${escapeAttr(row.directionId || "")}" data-scope="${viewAttr}">${optionList(["从小到大", "从大到小"], row.direction || "从小到大")}</select></td>
                             <td class="left">${escapeHtml(row.team || "-")}</td>`
                      }
                    </tr>
                  `
                    )
                    .join("")
                  : `<tr><td colspan="${isTeam ? 5 : 7}" class="empty-text">当前范围暂无责任区域数据</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderWorkpointLevelView() {
  const wp = currentWorkpoint();
  if (!wp) return "";
  return `
    <section class="workpoint-level">
      ${renderStructureModule(wp)}
      <div class="workpoint-main">
        ${renderTaskModule(wp)}
        ${renderWorkpointResponsibilityModule(wp)}
      </div>
    </section>
  `;
}

function renderStructureModule(wp) {
  return `
    <aside class="module structure-module" id="module-structure">
      <div class="module-head compact">
        <div class="module-title">
          <h3>结构对象</h3>
          <p>${escapeHtml(wp.name)} 内部结构对象树。</p>
        </div>
      </div>
      <div class="module-body">
        <div class="structure-list">
          ${flattenStructures()
            .filter((row) => row.visible)
            .map(renderStructureRow)
            .join("")}
        </div>
      </div>
    </aside>
  `;
}

function renderStructureRow(row) {
  const hasChildren = Array.isArray(row.children) && row.children.length > 0;
  const selected = currentStructureId() === row.id;
  return `
    <div class="structure-row level-${Math.min(row.level, 3)} ${selected ? "active" : ""}" data-structure-id="${row.id}">
      <button class="tree-toggle ${hasChildren ? "" : "placeholder"}" data-structure-toggle="${row.id}" title="${row.expanded ? "收起" : "展开"}">${hasChildren ? (row.expanded ? "⌄" : "›") : ""}</button>
      <span class="structure-name">${escapeHtml(row.name)}</span>
      <small>${escapeHtml(row.type)}${row.unitCount ? ` · ${row.unitCount}` : ""}</small>
    </div>
  `;
}

function selectedStructureNode() {
  return flattenStructures().find((item) => item.id === currentStructureId());
}

function currentConstructionUnits() {
  const selectedStructure = selectedStructureNode();
  return Array.isArray(selectedStructure?.constructionUnits) ? selectedStructure.constructionUnits : [];
}

function renderConstructionUnitModule(wp) {
  const selectedStructure = selectedStructureNode();
  const units = currentConstructionUnits();
  return `
    <section class="module" id="module-construction-units">
      <div class="module-head">
        <div class="module-title">
          <h3>施工单元</h3>
          <p>${escapeHtml(wp.name)} / ${escapeHtml(selectedStructure?.name || "-")}，共 ${units.length} 个施工单元。</p>
        </div>
      </div>
      <div class="module-body">
        <div class="table-wrap">
          <table class="task-table">
            <thead>
              <tr>
                <th class="serial-cell">序号</th>
                <th style="width: 170px;">施工单元</th>
                <th style="width: 130px;">子分部</th>
                <th style="width: 130px;">分项</th>
                <th style="width: 90px;">幅别</th>
                <th style="width: 90px;">墩号</th>
                <th style="width: 120px;">梁号/跨号</th>
                <th style="width: 90px;">单位</th>
              </tr>
            </thead>
            <tbody>
              ${
                units.length
                  ? units.map((unit, index) => renderConstructionUnitRow(unit, index)).join("")
                  : '<tr><td colspan="8" class="empty-text">当前结构对象暂无施工单元</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderConstructionUnitRow(unit, index) {
  const spanText = unit.spanStartNo && unit.spanEndNo ? `${unit.spanStartNo}-${unit.spanEndNo}` : unit.subNo || "-";
  return `
    <tr>
      <td>${index + 1}</td>
      <td class="left">${escapeHtml(unit.name || "-")}</td>
      <td class="left">${escapeHtml(unit.subPart || "-")}</td>
      <td class="left">${escapeHtml(unit.item || unit.component || "-")}</td>
      <td>${escapeHtml(unit.side || "-")}</td>
      <td>${escapeHtml(unit.pierNo || "-")}</td>
      <td>${escapeHtml(spanText)}</td>
      <td>${escapeHtml(unit.unit || "-")}</td>
    </tr>
  `;
}

function renderTaskModule(wp) {
  const tasks = getCurrentTasks();
  const selectedStructure = selectedStructureNode();
  return `
    <section class="module" id="module-task">
      <div class="module-head">
        <div class="module-title">
          <h3>结构任务项拆解</h3>
          <p>当前对象：${escapeHtml(selectedStructure?.name || "-")}。默认按该部位下的施工单元生成任务，可继续配置前置关系、施工工艺、进度指标和作业班组。</p>
        </div>
        <div class="module-actions">
          <button class="btn" data-action="copy-structure">${icons.copy}复制到其他部位</button>
        </div>
      </div>
      <div class="module-body">
        <div class="table-wrap">
          <table class="task-table">
            <thead>
              <tr>
                <th class="check-cell"><input class="checkbox" type="checkbox" disabled /></th>
                <th class="serial-cell">序号</th>
                <th style="width: 170px;">任务名称</th>
                <th style="width: 170px;">前置任务</th>
                <th style="width: 100px;">关系类型</th>
                <th style="width: 120px;">间隔</th>
                <th style="width: 130px;">形象进度量</th>
                <th style="width: 110px;">统计单位</th>
                <th style="width: 170px;">施工工艺</th>
                <th style="width: 150px;">进度指标</th>
                <th style="width: 170px;">作业班组</th>
                <th style="width: 140px;">工期计算结果</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map((task, index) => renderTaskRow(task, index, tasks)).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderTaskRow(task, index, tasks) {
  const prevOptions = [{ value: "", label: index === 0 ? "首任务，无前置" : "请选择前置任务" }, ...tasks.filter((_, taskIndex) => taskIndex !== index).map((item) => ({ value: item.name, label: item.name }))];
  const productivityCrafts = theoreticalProductivityRows().map((row) => row.craft).filter(Boolean);
  const craftOptions = [{ value: "", label: "待配置" }, ...new Set([...productivityCrafts, "旋挖钻", "整体式浇筑", "吊装", "水下灌注", "机械开挖", "钢筋绑扎", "现浇混凝土", "翻模施工", "架桥机架设", "摊铺", "管棚", "台阶法", "衬砌台车", "机械清表", "分层填筑", "浆砌片石", task.craft].filter(Boolean))];
  const responsibilitySubjects = (responsibilityAreaSource?.subjects || []).map((item) => item.displayName || item.subjectName || item.name).filter(Boolean);
  const crewOptions = [{ value: "", label: "待配置" }, ...new Set([...responsibilitySubjects, "桩基工班A", "结构工班A", "桥面系工班", "隧道开挖班组", "二衬班组", "土石方班组", "填筑班组", "防护班组", task.crew].filter(Boolean))];
  return `
    <tr data-task-row="${index}">
      <td><input class="checkbox" type="checkbox" /></td>
      <td>${index + 1}</td>
      <td class="left">${escapeHtml(task.name)}</td>
      <td><select class="select" data-task-field="prev" data-index="${index}" ${index === 0 ? "disabled" : ""}>${optionList(prevOptions, task.prev)}</select></td>
      <td><select class="select" data-task-field="relation" data-index="${index}" disabled>${optionList(["FS"], task.relation)}</select></td>
      <td><span class="gap-group"><input class="field small" data-task-field="gap" data-index="${index}" value="${escapeAttr(task.gap)}" inputmode="numeric" /><span>天</span></span></td>
      <td>${escapeHtml(task.qty)}</td>
      <td>${escapeHtml(task.unit)}</td>
      <td><select class="select" data-task-field="craft" data-index="${index}">${optionList(craftOptions, task.craft)}</select></td>
      <td><input class="field" data-task-field="metric" data-index="${index}" value="${escapeAttr(task.metric)}" /></td>
      <td><select class="select" data-task-field="crew" data-index="${index}">${optionList(crewOptions, task.crew)}</select></td>
      <td><input class="field" value="${escapeAttr(task.duration)}" readonly /></td>
    </tr>
  `;
}

function renderWorkpointResponsibilityModule(wp) {
  const isTeam = state.workpointResponsibilityView === "team";
  const rows = responsibilityRowsForWorkpoints(state.workpointResponsibilityView, [wp]);
  return renderResponsibilityModule({
    id: "module-workpoint-responsibility",
    title: "队伍/班组责任区域",
    desc: "仅展示当前工点范围内的责任区域，班组视图中可设置施工方向并参与任务班组匹配。",
    isTeam,
    rows,
    viewAttr: "workpoint-responsibility-view",
  });
}

function renderCheckDrawer() {
  const errors = state.issues.filter((item) => item.level === "error").length;
  const warnings = state.issues.filter((item) => item.level === "warning").length;
  return `
    <aside class="drawer check-drawer" role="dialog" aria-modal="true" aria-labelledby="check-title">
      <div class="drawer-head">
        <div>
          <h3 id="check-title">异常与冲突检查</h3>
          <p>${errors} 个严重错误，${warnings} 个警告。点击异常项可定位到对应节点和配置位置。</p>
        </div>
        <button class="btn icon-only ghost" data-action="close-drawer" title="关闭">${icons.close}</button>
      </div>
      <div class="check-actions">
        <button class="btn" data-action="check">${icons.check}重新检查</button>
        <button class="btn ghost" data-action="save">${icons.save}暂存当前结果</button>
      </div>
      <div class="issue-list" style="margin-top: 14px;">
        ${state.issues.length ? state.issues.map(renderIssue).join("") : '<div class="issue"><span class="issue-title">未发现阻断项</span><small>当前配置可以进入发布确认。</small></div>'}
      </div>
    </aside>
  `;
}

function renderIssue(issue, index) {
  return `
    <button class="issue ${issue.level}" data-locate="${index}">
      <span class="issue-title">
        <span class="status ${issue.level === "error" ? "error" : "pending"}">${issue.level === "error" ? "错误" : "警告"}</span>
        ${escapeHtml(issue.levelName)} / ${escapeHtml(issue.nodeName)} / ${escapeHtml(issue.moduleName)}
      </span>
      <small>${escapeHtml(issue.message)}</small>
    </button>
  `;
}

function renderModal() {
  if (state.modal === "publish") {
    return `
      <div class="modal-mask" data-action="close-modal"></div>
      <section class="modal">
        <div class="modal-head"><h3>确认发布计划</h3></div>
        <div class="modal-body">当前项目级与工点级逻辑已通过必要校验。发布后将作为完整项目计划生成的统一逻辑依据，并用于后续执行检查。</div>
        <div class="modal-foot">
          <button class="btn ghost" data-action="close-modal">取消</button>
          <button class="btn primary" data-action="confirm-publish">${icons.send}确认发布</button>
        </div>
      </section>
    `;
  }

  if (state.modal === "responsibility") {
    return `
      <div class="modal-mask" data-action="close-modal"></div>
      <section class="modal">
        <div class="modal-head"><h3>责任区域设置</h3></div>
        <div class="modal-body">这里是责任区域设置页入口原型。实际系统可跳转到责任区配置页面，并带入当前选中节点范围；返回后自动刷新本页责任区域与施工方向。</div>
        <div class="modal-foot"><button class="btn primary" data-action="close-modal">知道了</button></div>
      </section>
    `;
  }

  if (state.modal === "copy") {
    return `
      <div class="modal-mask" data-action="close-modal"></div>
      <section class="modal">
        <div class="modal-head"><h3>复制到其他部位</h3></div>
        <div class="modal-body">本期仅支持复制到同类型结构对象。原型中已模拟完成复制动作，后续可接入同类型部位选择弹窗。</div>
        <div class="modal-foot"><button class="btn primary" data-action="close-modal">完成</button></div>
      </section>
    `;
  }

  return "";
}

function createIssue({ level, module, row = 0, levelName, nodeName, moduleName, message, nodeId }) {
  return { level, module, row, levelName, nodeName, moduleName, message, nodeId };
}

function validateAll() {
  const result = runScheduleEngine("check");
  state.scheduleResult = result;
  state.issues = result.issues;
  state.checkDrawerOpen = true;
  const hasError = result.issues.some((item) => item.level === "error");
  state.pageStatus = hasError ? "校验异常" : "可发布";
  setTreeStatus("project-root", hasError ? "校验异常" : "已配置");
  render();
  showToast(hasError ? "检查完成：存在严重错误，发布计划已拦截。" : `检查完成：已试算 ${result.stats?.taskCount || 0} 个任务，可发布。`);
}

function appendMockConflictIssues(issues) {
  issues.push(
    createIssue({
      level: "error",
      module: "beam",
      row: 1,
      levelName: "项目级",
      nodeName: "桥梁工程",
      moduleName: "架梁施工顺序",
      message: "1号架桥机在 2025年6月1日~2025年6月8日被架梁方向1、架梁方向2同时占用，需调整前置区段或开始时间。",
      nodeId: "bridge",
    }),
    createIssue({
      level: "error",
      module: "responsibility",
      row: 1,
      levelName: "项目级",
      nodeName: "垫丰武高速公路工程TJ00标",
      moduleName: "队伍/班组责任区域",
      message: "桥梁1队与桥梁2队在白石河大桥左幅5#墩~7#墩范围存在责任区域重叠，发布前需要重新划分边界。",
      nodeId: "project-root",
    }),
    createIssue({
      level: "warning",
      module: "task",
      row: 1,
      levelName: "工点级",
      nodeName: "青岩沟1号大桥左幅",
      moduleName: "结构任务项拆解",
      message: "桩基工班A 同时匹配到 0#台桩基与1#墩桩基任务，当前工作面数量可能超过班组能力。",
      nodeId: "qingyan-left",
    }),
    createIssue({
      level: "warning",
      module: "project-workpoint",
      row: 4,
      levelName: "项目级",
      nodeName: "垫丰武高速公路工程TJ00标",
      moduleName: "工点推进顺序",
      message: "田湾大桥左幅缺少人工开工时间锚点，若上游工点延误，后续链路将整体顺延。",
      nodeId: "project-root",
    })
  );
}

function validateProjectWorkpointChain(issues) {
  workpoints.forEach((item, index) => {
    if (!isValidManualDate(item.start)) {
      issues.push(createIssue({ level: "error", module: "project-workpoint", row: index, levelName: "项目级", nodeName: "垫丰武高速公路工程TJ00标", moduleName: "工点推进顺序", message: `${item.name} 的开工时间格式不合法，请使用 YYYY-MM-DD 或 2025年4月1日。`, nodeId: "project-root" }));
    }
  });
}

function validateBeamLines(issues) {
  const names = new Set(beamLines.map((item) => item.name));
  beamLines.forEach((item, index) => {
    if (!isNonNegativeInteger(item.transfer)) {
      issues.push(createIssue({ level: "error", module: "beam", row: index, levelName: "项目级", nodeName: "桥梁工程", moduleName: "架梁施工顺序", message: `${item.name} 的转场时间只允许输入非负整数。`, nodeId: "bridge" }));
    }
    if (item.prev && !names.has(item.prev)) {
      issues.push(createIssue({ level: "error", module: "beam", row: index, levelName: "项目级", nodeName: "桥梁工程", moduleName: "架梁施工顺序", message: `${item.name} 的前置架设区段不存在。`, nodeId: "bridge" }));
    }
  });

  resources.forEach((resource) => {
    const rows = beamLines.filter((item) => item.resource === resource);
    const starts = rows.filter((item) => !item.prev);
    if (rows.length > 1 && starts.length > 1) {
      issues.push(createIssue({ level: "error", module: "beam", row: beamLines.findIndex((item) => item.id === starts[1].id), levelName: "项目级", nodeName: "桥梁工程", moduleName: "架梁施工顺序", message: `${resource} 存在多条无前置关系的架梁方向，资源占用先后不明确。`, nodeId: "bridge" }));
    }
  });
}

function validateProjectResponsibility(issues) {
  responsibility.crew.forEach((item, index) => {
    if (!item.direction) {
      issues.push(createIssue({ level: "error", module: "responsibility", row: index, levelName: "项目级", nodeName: "垫丰武高速公路工程TJ00标", moduleName: "队伍/班组责任区域", message: `${item.name} 的施工方向不可为空。`, nodeId: "project-root" }));
    }
  });
}

function validateWorkpointConfigs(issues) {
  workpoints.forEach((wp) => {
    const kind = workpointKind(wp);
    const taskSet = kind === "bridge" ? structureTasks.pile : kind === "tunnel" ? structureTasks.tunnel : structureTasks.road;
    taskSet.forEach((task, index) => {
      if (!isNonNegativeInteger(task.gap)) {
        issues.push(createIssue({ level: "error", module: "task", row: index, levelName: "工点级", nodeName: wp.name, moduleName: "结构任务项拆解", message: `${task.name} 的间隔只允许输入非负整数。`, nodeId: wp.id }));
      }
      if (!task.craft || !task.metric || !task.crew) {
        issues.push(createIssue({ level: "warning", module: "task", row: index, levelName: "工点级", nodeName: wp.name, moduleName: "结构任务项拆解", message: `${task.name} 的施工工艺、进度指标或作业班组需要补充确认。`, nodeId: wp.id }));
      }
    });
  });
}

function markDirty() {
  state.dirty = true;
  state.scheduleResult = null;
  if (state.pageStatus === "已发布" || state.pageStatus === "可发布") state.pageStatus = "已暂存";
}

function localResponsibilitySaveUrl() {
  const isLocalConfigServer =
    ["127.0.0.1", "localhost"].includes(window.location.hostname) && window.location.port === "8787";
  if (isLocalConfigServer) return "/api/responsibility/save";
  return "http://127.0.0.1:8787/api/responsibility/save";
}

function localResponsibilityDataUrl() {
  return localResponsibilitySaveUrl().replace(/\/save$/, "/data");
}

function storeResponsibilityAreaSource() {
  if (!responsibilityAreaSource) return;
  localStorage.setItem(RESPONSIBILITY_STORAGE_KEY, JSON.stringify({
    version: 1,
    savedAt: responsibilityAreaSource.source?.browserSavedAt || new Date().toISOString(),
    payload: responsibilityAreaSource,
  }));
}

function applyWorkpointOrderFromSource() {
  const rows = Array.isArray(responsibilityAreaSource?.workpointOrder) ? responsibilityAreaSource.workpointOrder : [];
  if (!rows.length) return;
  const originalIndex = new Map(workpoints.map((workpoint, index) => [workpoint.id, index]));
  const byId = new Map(rows.map((row) => [row.workpointId, row]));
  const byName = new Map(rows.map((row) => [row.name, row]));
  workpoints.forEach((workpoint) => {
    const row = byId.get(workpoint.id) || byName.get(workpoint.name);
    if (!row) return;
    workpoint.prev = row.prev || "";
    workpoint.gap = row.gap || "0";
    workpoint.start = row.start || "";
  });
  workpoints.sort((a, b) => {
    if (a.discipline !== b.discipline) return (originalIndex.get(a.id) || 0) - (originalIndex.get(b.id) || 0);
    const aRow = byId.get(a.id) || byName.get(a.name);
    const bRow = byId.get(b.id) || byName.get(b.name);
    const aOrder = Number(aRow?.order || originalIndex.get(a.id) || 0);
    const bOrder = Number(bRow?.order || originalIndex.get(b.id) || 0);
    return aOrder - bOrder;
  });
}

function allLeafStructuresByWorkpoint() {
  return workpoints.flatMap((workpoint) => flattenStructures(getStructureTree(workpoint))
    .filter((structure) => !structure.children)
    .map((structure) => ({ workpoint, structure })));
}

function structureNameById(structureId) {
  return allLeafStructuresByWorkpoint().find((item) => item.structure.id === structureId)?.structure.name || "";
}

function applyScheduleTasksFromSource() {
  const rows = Array.isArray(responsibilityAreaSource?.scheduleTasks) ? responsibilityAreaSource.scheduleTasks : [];
  if (!rows.length) return;
  const groups = new Map();
  rows.forEach((row) => {
    if (!row.structureId || !row.name) return;
    if (!groups.has(row.structureId)) groups.set(row.structureId, []);
    groups.get(row.structureId).push(row);
  });
  groups.forEach((items, structureId) => {
    const tasks = items
      .sort((a, b) => Number(a.taskOrder || 0) - Number(b.taskOrder || 0))
      .map((row) => ({
        name: row.name,
        prev: row.prev,
        relation: row.relation || "FS",
        gap: row.gap || "0",
        qty: row.qty || "1",
        unit: row.unit || "项",
        craft: row.craft || "",
        metric: row.metric || "",
        crew: row.crew || "",
        duration: row.duration || recalcDuration({ qty: row.qty || "1", metric: row.metric || "", duration: "1天" }),
      }));
    state.structureTasksById[structureId] = {
      fromExcel: true,
      signature: `excel:${items.length}`,
      tasks,
    };
  });
}

function applyResponsibilityAreaSource(freshSource, { preserveBeamLines = true } = {}) {
  if (!freshSource?.assignments) return false;
  const currentBeamLines = beamLines;
  responsibilityAreaBaseSource = freshSource;
  responsibilityAreaSource = freshSource;
  if (!preserveBeamLines && Array.isArray(freshSource.beamLines) && freshSource.beamLines.length) {
    beamLines = freshSource.beamLines;
  } else {
    responsibilityAreaSource.beamLines = currentBeamLines;
  }
  rebuildResponsibilityState();
  applyWorkpointOrderFromSource();
  applyScheduleTasksFromSource();
  return true;
}

async function refreshResponsibilityAreaFromLocalExcel() {
  try {
    const response = await fetch(localResponsibilityDataUrl(), { cache: "no-store" });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) return false;
    const { ok, ...freshSource } = result;
    const currentKey = [
      responsibilityAreaSource?.source?.generatedAt || "",
      responsibilityAreaSource?.directions?.length || 0,
      responsibilityAreaSource?.assignments?.length || 0,
    ].join("|");
    const freshKey = [
      freshSource.source?.generatedAt || "",
      freshSource.directions?.length || 0,
      freshSource.assignments?.length || 0,
    ].join("|");
    if (currentKey === freshKey) return false;
    applyResponsibilityAreaSource(freshSource);
    render();
    return true;
  } catch {
    return false;
  }
}

function updateResponsibilityDirection(directionId, sourceIndex, value) {
  const directions = asArray(responsibilityAreaSource?.directions);
  let target = directionId ? directions.find((row) => row.directionId === directionId) : null;
  if (!target && Number.isInteger(sourceIndex)) target = directions[sourceIndex] || null;
  if (target) target.direction = value;
  const projectRow = responsibility.crew.find((row) => row.directionId === directionId) || responsibility.crew[sourceIndex];
  if (projectRow) projectRow.direction = value;
  Object.values(workpointResponsibility || {}).forEach((group) => {
    asArray(group.crew).forEach((row) => {
      if (row.directionId === directionId) row.direction = value;
    });
  });
  if (responsibilityAreaSource?.source) responsibilityAreaSource.source.browserSavedAt = new Date().toISOString();
  storeResponsibilityAreaSource();
}

function serializeWorkpointOrder() {
  return workpoints.map((workpoint, index) => ({
    workpointId: workpoint.id,
    discipline: workpoint.discipline,
    name: workpoint.name,
    prev: workpoint.prev || "",
    gap: workpoint.gap || "0",
    start: workpoint.start || "",
    order: String(index + 1),
    syncStatus: "页面保存",
    note: "",
  }));
}

function serializeScheduleTasks() {
  const rows = [];
  allLeafStructuresByWorkpoint().forEach(({ workpoint, structure }) => {
    const cached = state.structureTasksById[structure.id]?.tasks;
    const generated = Array.isArray(structure.constructionUnits) && structure.constructionUnits.length
      ? groupConstructionUnitsToTasks(structure.constructionUnits, { workpoint, structure })
      : [];
    const tasks = cached || generated;
    tasks.forEach((task, index) => {
      rows.push({
        configId: `${workpoint.id}::${structure.id}::${index + 1}`,
        workpointId: workpoint.id,
        workpointName: workpoint.name,
        structureId: structure.id,
        structureName: structure.name,
        taskOrder: String(index + 1),
        name: task.name,
        prev: task.prev,
        relation: task.relation || "FS",
        gap: task.gap || "0",
        qty: task.qty || "1",
        unit: task.unit || "项",
        craft: task.craft || "",
        metric: task.metric || "",
        crew: task.crew || "",
        duration: task.duration || recalcDuration(task),
        syncStatus: "页面保存",
        note: "",
      });
    });
  });
  return rows;
}

function responsibilityPayloadForExcel() {
  return {
    ...responsibilityAreaSource,
    source: {
      ...(responsibilityAreaSource?.source || {}),
      browserSavedAt: new Date().toISOString(),
    },
    assignments: asArray(responsibilityAreaSource?.assignments),
    directions: asArray(responsibilityAreaSource?.directions),
    resources: asArray(responsibilityAreaSource?.resources),
    teams: asArray(responsibilityAreaSource?.teams),
    subjects: asArray(responsibilityAreaSource?.subjects),
    beamLines,
    productivity: Array.isArray(responsibilityAreaSource?.productivity) ? responsibilityAreaSource.productivity : [],
    workpointOrder: serializeWorkpointOrder(),
    scheduleTasks: serializeScheduleTasks(),
  };
}

async function saveResponsibilityDirectionsToExcel() {
  if (!responsibilityAreaSource?.assignments?.length) return { ok: false, skipped: true };
  const payload = responsibilityPayloadForExcel();
  const response = await fetch(localResponsibilitySaveUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.message || `本地服务返回 ${response.status}`);
  }
  responsibilityAreaSource.workpointOrder = payload.workpointOrder;
  responsibilityAreaSource.scheduleTasks = payload.scheduleTasks;
  responsibilityAreaSource.productivity = payload.productivity;
  if (result.generatedAt) {
    responsibilityAreaSource.source = {
      ...(responsibilityAreaSource.source || {}),
      generatedAt: result.generatedAt,
      workbook: result.workbook || responsibilityAreaSource.source?.workbook,
      browserSavedAt: new Date().toISOString(),
    };
    storeResponsibilityAreaSource();
  }
  return result;
}

async function savePage() {
  const result = runScheduleEngine("save");
  state.issues = result.issues;
  state.dirty = false;
  const hasError = result.issues.some((item) => item.level === "error");
  state.pageStatus = hasError ? "暂存异常" : "已暂存";
  state.checkDrawerOpen = hasError;
  setTreeStatus(state.selectedNodeId, "已配置");
  setTreeStatus("project-root", hasError ? "校验异常" : "已暂存");
  render();
  showToast(hasError ? "配置已暂存，但基础合法性校验存在阻断项。" : "当前页面全部已修改配置已暂存。");
  try {
    const saveResult = await saveResponsibilityDirectionsToExcel();
    if (saveResult?.ok) {
      showToast("当前配置已暂存，班组施工方向已同步保存到责任区域 Excel。");
    }
  } catch (error) {
    const message = error?.message?.includes("Failed to fetch")
      ? "无法连接本地配置服务，请先双击“启动本地配置服务.bat”。"
      : error?.message || "未知错误";
    showToast(`当前配置已暂存，但班组施工方向未写入 Excel：${message}`);
  }
}

function publishPage() {
  if (state.dirty) {
    state.dirty = false;
  }
  const result = runScheduleEngine("publish");
  state.scheduleResult = result;
  state.issues = result.issues;
  const hasError = result.issues.some((item) => item.level === "error");
  state.checkDrawerOpen = hasError;
  state.pageStatus = hasError ? "校验异常" : "可发布";
  setTreeStatus("project-root", hasError ? "校验异常" : "已配置");
  if (hasError) {
    render();
    showToast("发布前校验未通过：请先处理严重错误。");
    return;
  }
  state.modal = "publish";
  render();
  showToast(`发布前校验通过：已生成 ${result.stats?.taskCount || 0} 个任务的正式计划草案。`);
}

function confirmPublish() {
  state.modal = null;
  state.dirty = false;
  state.pageStatus = "已发布";
  state.checkDrawerOpen = false;
  setTreeStatus("project-root", "已配置");
  render();
  showToast(`发布成功：已生成 ${state.scheduleResult?.stats?.taskCount || 0} 个任务、${state.scheduleResult?.stats?.relationCount || 0} 条逻辑关系。`);
}

function addBeamLine() {
  const nextNumber = beamLines.length + 1;
  beamLines.push({ id: `beam-${Date.now()}`, name: `架梁方向${nextNumber}`, startPier: pierOptions[0], endPier: pierOptions[1], resource: resources[0], transfer: "0", prev: beamLines.at(-1)?.name || "", startTime: "" });
  markDirty();
  render();
  showToast("已新增一条架梁方向。");
}

function deleteSelectedBeamLines() {
  if (!state.selectedBeamIds.size) {
    showToast("请先勾选需要删除的架梁方向。");
    return;
  }
  for (let i = beamLines.length - 1; i >= 0; i -= 1) {
    if (state.selectedBeamIds.has(beamLines[i].id)) beamLines.splice(i, 1);
  }
  state.selectedBeamIds.clear();
  beamLines.forEach((line) => {
    if (!beamLines.some((item) => item.name === line.prev)) line.prev = "";
  });
  markDirty();
  render();
  showToast("已删除选中的架梁方向，并清理失效前置区段。");
}

function syncResponsibilityAfterResourceChange() {
  const target = responsibility.crew.find((item) => item.name === "桥面系工班");
  if (target) {
    target.name = "待重新确认-简支箱梁班组";
    target.team = "待责任区域设置确认";
    target.content = "简支箱梁架设配合、桥面系衔接";
  }
  showToast("架桥资源已变更，相关跨号的队伍/班组信息已重置为待确认。");
}

function toggleNode(id, nodes = tree) {
  const node = findTreeNode(id, nodes);
  if (node?.children) node.expanded = !node.expanded;
}

function toggleStructure(id, nodes = getStructureTree()) {
  for (const node of nodes) {
    if (node.id === id) {
      node.expanded = !node.expanded;
      return true;
    }
    if (node.children && toggleStructure(id, node.children)) return true;
  }
  return false;
}

function locateIssue(index) {
  const issue = state.issues[index];
  if (!issue) return;
  if (issue.nodeId) state.selectedNodeId = issue.nodeId;
  render();
  requestAnimationFrame(() => {
    const moduleMap = {
      "project-workpoint": "module-project-workpoint",
      beam: "module-beam",
      responsibility: "module-responsibility",
      task: "module-task",
    };
    const module = document.getElementById(moduleMap[issue.module]);
    if (module) module.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelectorAll(".row-focus").forEach((row) => row.classList.remove("row-focus"));
    const rowSelector =
      issue.module === "project-workpoint"
        ? `[data-project-workpoint-row="${issue.row}"]`
        : issue.module === "beam"
          ? `[data-beam-row="${issue.row}"]`
          : issue.module === "task"
            ? `[data-task-row="${issue.row}"]`
            : `[data-responsibility-row="${issue.row}"]`;
    const row = document.querySelector(rowSelector);
    if (row) row.classList.add("row-focus");
  });
}

function recalcDuration(task) {
  const qty = Number(String(task.qty).replace(/[^\d.]/g, ""));
  const metric = Number(String(task.metric).match(/[\d.]+/)?.[0] || "");
  if (!qty || !metric) return task.duration;
  const metricText = String(task.metric || "");
  const days = /天\s*\//.test(metricText)
    ? qty * metric
    : qty / metric;
  return `${Math.max(1, Math.ceil(days))}天`;
}

function showToast(message) {
  state.toast = message;
  render();
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    state.toast = "";
    render();
  }, 2400);
}

function structureScrollTop() {
  return {
    structure: document.querySelector(".structure-list")?.scrollTop || 0,
    content: document.querySelector(".content-panel")?.scrollTop || 0,
  };
}

function restoreStructureScroll(scrollState) {
  const apply = () => {
    const list = document.querySelector(".structure-list");
    const panel = document.querySelector(".content-panel");
    if (list) list.scrollTop = typeof scrollState === "number" ? scrollState : scrollState?.structure || 0;
    if (panel && typeof scrollState !== "number") panel.scrollTop = scrollState?.content || 0;
  };
  apply();
  requestAnimationFrame(apply);
  setTimeout(apply, 0);
}

function attachEvents() {
  document.getElementById("app").addEventListener("click", (event) => {
    const pageNav = event.target.closest("[data-page-nav]");
    if (pageNav) {
      event.preventDefault();
      window.location.href = `${pageNav.dataset.pageNav}?refresh=${Date.now()}`;
      return;
    }

    const treeToggle = event.target.closest("[data-tree-toggle]");
    if (treeToggle) {
      event.stopPropagation();
      toggleNode(treeToggle.dataset.treeToggle);
      render();
      return;
    }

    const structureToggle = event.target.closest("[data-structure-toggle]");
    if (structureToggle) {
      event.stopPropagation();
      const scrollTop = structureScrollTop();
      toggleStructure(structureToggle.dataset.structureToggle);
      render();
      restoreStructureScroll(scrollTop);
      return;
    }

    const treeNode = event.target.closest("[data-node-id]");
    if (treeNode) {
      state.selectedNodeId = treeNode.dataset.nodeId;
      render();
      return;
    }

    const structureNode = event.target.closest("[data-structure-id]");
    if (structureNode && !event.target.closest("[data-structure-toggle]")) {
      const scrollTop = structureScrollTop();
      const wp = currentWorkpoint();
      if (wp) state.selectedStructureId[wp.id] = structureNode.dataset.structureId;
      render();
      restoreStructureScroll(scrollTop);
      return;
    }

    const projectView = event.target.closest("[data-project-responsibility-view]");
    if (projectView) {
      state.projectResponsibilityView = projectView.dataset.projectResponsibilityView;
      render();
      return;
    }

    const workpointView = event.target.closest("[data-workpoint-responsibility-view]");
    if (workpointView) {
      state.workpointResponsibilityView = workpointView.dataset.workpointResponsibilityView;
      render();
      return;
    }

    const beamSelect = event.target.closest("[data-beam-select]");
    if (beamSelect) {
      if (beamSelect.checked) state.selectedBeamIds.add(beamSelect.dataset.beamSelect);
      else state.selectedBeamIds.delete(beamSelect.dataset.beamSelect);
      return;
    }

    const locate = event.target.closest("[data-locate]");
    if (locate) {
      locateIssue(Number(locate.dataset.locate));
      return;
    }

    const action = event.target.closest("[data-action]");
    if (!action) return;
    const name = action.dataset.action;
    if (name === "sort-discipline") {
      state.sortMode = "discipline";
      render();
    }
    if (name === "sort-mile") {
      state.sortMode = "mile";
      render();
    }
    if (name === "project-workpoint-up") {
      moveProjectWorkpoint(Number(action.dataset.index), -1);
      return;
    }
    if (name === "project-workpoint-down") {
      moveProjectWorkpoint(Number(action.dataset.index), 1);
      return;
    }
    if (name === "add-beam") addBeamLine();
    if (name === "delete-beam") deleteSelectedBeamLines();
    if (name === "toggle-all-beams") {
      if (action.checked) beamLines.forEach((line) => state.selectedBeamIds.add(line.id));
      else state.selectedBeamIds.clear();
      render();
    }
    if (name === "check") validateAll();
    if (name === "save") savePage();
    if (name === "publish") publishPage();
    if (name === "close-drawer") {
      state.checkDrawerOpen = false;
      render();
    }
    if (name === "responsibility-setting") {
      window.location.href = "responsibility-area-settings.html";
    }
    if (name === "copy-structure") {
      state.modal = "copy";
      render();
    }
    if (name === "close-modal") {
      state.modal = null;
      render();
    }
    if (name === "confirm-publish") confirmPublish();
  });

  document.getElementById("app").addEventListener("input", handleFormEvent);
  document.getElementById("app").addEventListener("change", handleFormEvent);
}

function handleFormEvent(event) {
  const projectField = event.target.closest("[data-project-workpoint-field]");
  if (projectField) {
    workpoints[Number(projectField.dataset.index)][projectField.dataset.projectWorkpointField] = projectField.value;
    markDirty();
    return;
  }

  const beamField = event.target.closest("[data-beam-field]");
  if (beamField) {
    const index = Number(beamField.dataset.index);
    const field = beamField.dataset.beamField;
    const oldResource = beamLines[index]?.resource;
    beamLines[index][field] = beamField.value;
    markDirty();
    if (field === "resource" && oldResource !== beamField.value) {
      syncResponsibilityAfterResourceChange();
      render();
    }
    return;
  }

  const taskField = event.target.closest("[data-task-field]");
  if (taskField) {
    const task = getCurrentTasks()[Number(taskField.dataset.index)];
    task[taskField.dataset.taskField] = taskField.value;
    if (taskField.dataset.taskField === "metric") task.duration = recalcDuration(task);
    markDirty();
    if (taskField.dataset.taskField === "metric") render();
    return;
  }

  const directionField = event.target.closest("[data-responsibility-direction]");
  if (directionField) {
    const index = Number(directionField.dataset.responsibilityDirection);
    updateResponsibilityDirection(directionField.dataset.responsibilityDirectionId, index, directionField.value);
    markDirty();
  }
}

applyWorkpointOrderFromSource();
applyScheduleTasksFromSource();
render();
attachEvents();
refreshResponsibilityAreaFromLocalExcel();
