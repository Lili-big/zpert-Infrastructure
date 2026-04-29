const STORAGE_KEY = "projectSchedule.responsibilityArea.v1";
let baseSource = window.RESPONSIBILITY_AREA_DATA || {
  assignments: [],
  teams: [],
  subjects: [],
  source: {},
};

function loadSavedPayload() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved?.payload?.source?.generatedAt === baseSource?.source?.generatedAt) return saved.payload;
  } catch {
    return null;
  }
  return null;
}

function mergeSourceWithSaved(base, saved) {
  if (!saved?.assignments?.length) return base;
  const savedRows = new Map(saved.assignments.map((row) => [row.nodeId, row]));
  return {
    ...base,
    ...saved,
    source: {
      ...(base.source || {}),
      ...(saved.source || {}),
    },
    assignments: (base.assignments || []).map((row) => {
      const savedRow = savedRows.get(row.nodeId);
      if (!savedRow) return row;
      return {
        ...row,
        teamId: savedRow.teamId || "",
        teamName: savedRow.teamName || "",
        subjectId: savedRow.subjectId || "",
        subjectName: savedRow.subjectName || "",
        validation: savedRow.validation || "",
      };
    }),
  };
}

let source = mergeSourceWithSaved(baseSource, loadSavedPayload());

const state = {
  selectedWorkpointId: "",
  expandLevel: 4,
  collapsedNodeIds: new Set(),
  batchDrafts: {},
  rows: source.assignments.map((row) => ({ ...row })),
  toast: "",
};

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

function optionList(options, current) {
  return options
    .map((item) => {
      const value = typeof item === "string" ? item : item.value;
      const label = typeof item === "string" ? item : item.label;
      return `<option value="${escapeAttr(value)}" ${value === current ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function workpoints() {
  const map = new Map();
  state.rows.forEach((row) => {
    if (!row.workpointId || map.has(row.workpointId)) return;
    map.set(row.workpointId, row.workpointName);
  });
  return [...map.entries()].map(([value, label]) => ({ value, label }));
}

function teams() {
  return (source.teams || []).map((row) => ({
    value: row.teamId,
    label: row.teamName,
  }));
}

function kindForWorkpoint(name) {
  if (String(name || "").includes("隧道")) return "tunnel";
  if (String(name || "").includes("路基")) return "road";
  return "bridge";
}

function buildDirectionRows(rows) {
  const oldDirections = new Map((source.directions || []).map((row) => [row.directionId, row]));
  const resourcesBySubject = new Map((source.subjects || []).map((row) => [row.subjectId, row]));
  const groups = new Map();

  rows
    .filter((row) => row.isLeaf === "是" && row.teamId && row.subjectId && row.plannedWorkpointId)
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
          contentSet: new Set(),
        });
      }
      groups.get(key).contentSet.add(row.name);
    });

  return [...groups.values()].map((row) => {
    const old = oldDirections.get(row.directionId) || {};
    return {
      ...row,
      scope: row.plannedWorkpointName,
      content: [...row.contentSet].slice(0, 20).join("、"),
      direction: old.direction || "从小到大",
      syncStatus: old.syncStatus || "页面保存",
      note: old.note || "",
    };
  });
}

function buildResponsibilityPayload(rows) {
  const resourcesBySubject = new Map((source.subjects || []).map((row) => [row.subjectId, row]));
  const teamGroups = new Map();

  rows
    .filter((row) => row.isLeaf === "是" && row.teamId)
    .forEach((row) => {
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

  const directionRows = buildDirectionRows(rows);
  const crewRows = directionRows.map((row) => ({
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
    directions: directionRows,
    responsibility: { team: teamRows, crew: crewRows },
    workpointResponsibility,
  };
}

function buildPagePayload() {
  const built = buildResponsibilityPayload(state.rows);
  return {
    ...source,
    ...built,
    source: {
      ...(source.source || {}),
      browserSavedAt: new Date().toISOString(),
    },
    assignments: state.rows,
  };
}

function storePagePayload(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    savedAt: payload.source.browserSavedAt,
    payload,
  }));
}

function savePageConfig({ quiet = false } = {}) {
  const payload = buildPagePayload();
  storePagePayload(payload);
  if (!quiet) showToast("已保存页面配置，计划排程逻辑页将读取本次保存结果。");
  return payload;
}

function localExcelSaveUrl() {
  const isLocalConfigServer =
    ["127.0.0.1", "localhost"].includes(window.location.hostname) && window.location.port === "8787";
  if (isLocalConfigServer) {
    return "/api/responsibility/save";
  }
  return "http://127.0.0.1:8787/api/responsibility/save";
}

function localExcelDataUrl() {
  return localExcelSaveUrl().replace(/\/save$/, "/data");
}

async function postLocalExcel(payload) {
  const response = await fetch(localExcelSaveUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.message || `本地服务返回 ${response.status}`);
  }
  return result;
}

async function saveToLocalExcel() {
  const payload = savePageConfig({ quiet: true });
  showToast("正在写入本地 Excel...");
  try {
    const result = await postLocalExcel(payload);
    if (result.generatedAt) {
      payload.source.generatedAt = result.generatedAt;
      payload.source.workbook = result.workbook || payload.source.workbook;
      source.source = { ...(source.source || {}), ...payload.source };
      storePagePayload(payload);
    }
    showToast("已保存到本地 Excel：责任区域配置.xlsx");
  } catch (error) {
    const message = error?.message || "未知错误";
    const hint = message.includes("Failed to fetch")
      ? "无法连接本地配置服务，请先双击“启动本地配置服务.bat”。"
      : message;
    showToast(`保存到本地 Excel 失败：${hint}`);
  }
}

async function refreshSourceFromLocalExcel() {
  try {
    const response = await fetch(localExcelDataUrl(), { cache: "no-store" });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok || !Array.isArray(result.assignments)) return;
    const { ok, ...freshSource } = result;
    const currentKey = [
      source.source?.generatedAt || "",
      source.resources?.length || 0,
      source.assignments?.length || 0,
    ].join("|");
    const freshKey = [
      freshSource.source?.generatedAt || "",
      freshSource.resources?.length || 0,
      freshSource.assignments?.length || 0,
    ].join("|");
    if (currentKey === freshKey) return;

    const selectedWorkpointId = state.selectedWorkpointId;
    baseSource = freshSource;
    source = mergeSourceWithSaved(baseSource, loadSavedPayload());
    state.rows = source.assignments.map((row) => ({ ...row }));
    state.batchDrafts = {};
    state.collapsedNodeIds.clear();
    state.selectedWorkpointId = workpoints().some((item) => item.value === selectedWorkpointId)
      ? selectedWorkpointId
      : "";
    render();
  } catch {
    // 打开为普通本地文件且服务未启动时，继续使用静态数据。
  }
}

function subjectsForTeam(teamId) {
  if (!teamId) return [];
  return (source.subjects || [])
    .filter((row) => row.teamId === teamId && row.enabled !== "否")
    .map((row) => ({
      value: row.subjectId,
      label: row.displayName,
    }));
}

function resourceBySubject(subjectId) {
  return (source.subjects || []).find((row) => row.subjectId === subjectId) || null;
}

function teamById(teamId) {
  return (source.teams || []).find((row) => row.teamId === teamId) || null;
}

function rowById(nodeId) {
  return state.rows.find((row) => row.nodeId === nodeId) || null;
}

function hasChildren(row) {
  return state.rows.some((item) => item.parentId === row.nodeId);
}

function isAncestorCollapsed(row) {
  let current = row;
  while (current?.parentId) {
    const parent = rowById(current.parentId);
    if (!parent) return false;
    if (state.collapsedNodeIds.has(parent.nodeId)) return true;
    current = parent;
  }
  return false;
}

function visibleRows() {
  const selectedWorkpointId = state.selectedWorkpointId || workpoints()[0]?.value || "";
  return state.rows.filter((row) => row.workpointId === selectedWorkpointId && Number(row.level || 0) <= state.expandLevel && !isAncestorCollapsed(row));
}

function descendantsOf(row) {
  const prefix = `${row.nodeId}>`;
  return state.rows.filter((item) => item.nodeId.startsWith(prefix) && item.isLeaf === "是");
}

function draftFor(row) {
  if (!state.batchDrafts[row.nodeId]) state.batchDrafts[row.nodeId] = {};
  return state.batchDrafts[row.nodeId];
}

function effectiveTeamId(row) {
  if (row.isLeaf === "是") return row.teamId;
  return state.batchDrafts[row.nodeId]?.teamId || row.teamId || "";
}

function effectiveSubjectId(row) {
  if (row.isLeaf === "是") return row.subjectId;
  return state.batchDrafts[row.nodeId]?.subjectId || row.subjectId || "";
}

function assignmentOptions(row) {
  const teamId = effectiveTeamId(row);
  if (!teamId) return [{ value: "", label: "请先选择施工队伍" }];
  return [{ value: "", label: "请选择作业班组" }, ...subjectsForTeam(teamId)];
}

function indentStyle(row) {
  const level = Math.max(0, Number(row.level || 0) - 1);
  return `padding-left: ${12 + level * 22}px`;
}

function rowIcon(row) {
  if (row.isLeaf === "是") return '<span class="tree-dot leaf"></span>';
  if (!hasChildren(row)) return '<span class="tree-dot leaf"></span>';
  const collapsed = state.collapsedNodeIds.has(row.nodeId);
  return `<button class="node-toggle" data-node-toggle="${escapeAttr(row.nodeId)}" title="${collapsed ? "展开" : "收起"}">${collapsed ? "›" : "⌄"}</button>`;
}

function renderPageNav(active) {
  return `
    <nav class="page-nav" aria-label="页面导航">
      <a class="${active === "responsibility" ? "active" : ""}" href="responsibility-area-settings.html" data-page-nav="responsibility-area-settings.html">责任区域设置</a>
      <a class="${active === "schedule" ? "active" : ""}" href="project-schedule-logic-settings.html" data-page-nav="project-schedule-logic-settings.html">计划排程逻辑</a>
    </nav>
  `;
}

function render() {
  if (!state.selectedWorkpointId) state.selectedWorkpointId = workpoints()[0]?.value || "";
  const rows = visibleRows();
  const invalidCount = state.rows.filter((row) => row.validation).length;
  const assignedLeafCount = state.rows.filter((row) => row.isLeaf === "是" && row.subjectId).length;

  document.getElementById("app").innerHTML = `
    <main class="page responsibility-page">
      <section class="topbar">
        <div class="title-block">
          <h1>责任区域设置</h1>
          <span class="title-meta">初始化设置 / 队伍班组配置前置</span>
        </div>
        ${renderPageNav("responsibility")}
        <div class="top-actions">
          <button class="btn primary" data-action="save-responsibility">${escapeHtml("保存到本地Excel")}</button>
          <a class="btn ghost" href="project-schedule-logic-settings.html">返回计划排程</a>
        </div>
      </section>

      <section class="module responsibility-config">
        <div class="module-head">
          <div class="module-title">
            <h3>施工单元责任区域</h3>
            <p>工点和结构节点来自 TXT 解析结果，名称按原始结构展示；队伍班组基础数据、责任区域结果和施工方向来自同一个 Excel 工作簿。</p>
          </div>
          <div class="schedule-stats">
            <span>节点 ${state.rows.length}</span>
            <span>已配置 ${assignedLeafCount}</span>
            <span>校验 ${invalidCount}</span>
          </div>
        </div>

        <div class="module-body">
          <div class="responsibility-filter">
            <label>
              <span>工点</span>
              <select class="select" data-filter="workpoint">${optionList(workpoints(), state.selectedWorkpointId)}</select>
            </label>
            <label>
              <span>名称</span>
              <select class="select" data-filter="level">${optionList([
                { value: "1", label: "展开至1级" },
                { value: "2", label: "展开至2级" },
                { value: "3", label: "展开至3级" },
                { value: "4", label: "展开至4级" },
              ], String(state.expandLevel))}</select>
            </label>
          </div>

          <div class="table-wrap responsibility-config-table">
            <table>
              <thead>
                <tr>
                  <th style="width: 320px;">名称</th>
                  <th style="width: 120px;">类型</th>
                  <th style="width: 110px;">编码</th>
                  <th style="width: 220px;">施工队伍</th>
                  <th style="width: 260px;">作业班组</th>
                  <th style="width: 110px;">同步状态</th>
                  <th>校验结果</th>
                </tr>
              </thead>
              <tbody>
                ${
                  rows.length
                    ? rows.map(renderRow).join("")
                    : '<tr><td colspan="7" class="empty-text">当前工点暂无结构节点。</td></tr>'
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
    </main>
  `;
}

function renderRow(row) {
  const teamOptions = [{ value: "", label: "请选择施工队伍" }, ...teams()];
  const currentTeamId = effectiveTeamId(row);
  const currentSubjectId = effectiveSubjectId(row);
  const subjectDisabled = currentTeamId ? "" : "disabled";
  const subjectClass = currentTeamId ? "" : "empty";
  return `
    <tr data-node-id="${escapeAttr(row.nodeId)}">
      <td class="left">
        <div class="responsibility-node-name" style="${indentStyle(row)}">
          ${rowIcon(row)}
          <span>${escapeHtml(row.name)}</span>
        </div>
      </td>
      <td>${escapeHtml(row.type)}</td>
      <td>${escapeHtml(row.code)}</td>
      <td>
        <select class="select" data-field="team" data-node-id="${escapeAttr(row.nodeId)}">
          ${optionList(teamOptions, currentTeamId)}
        </select>
      </td>
      <td>
        <select class="select ${subjectClass}" data-field="subject" data-node-id="${escapeAttr(row.nodeId)}" ${subjectDisabled}>
          ${optionList(assignmentOptions(row), currentSubjectId)}
        </select>
      </td>
      <td><span class="status ${row.syncStatus === "新增" ? "pending" : "done"}">${escapeHtml(row.syncStatus || "已同步")}</span></td>
      <td class="left ${row.validation ? "error-text" : "empty-text"}">${escapeHtml(row.validation || "通过")}</td>
    </tr>
  `;
}

function showToast(message) {
  state.toast = message;
  render();
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    state.toast = "";
    render();
  }, 2600);
}

function setRowTeam(row, teamId) {
  const team = teamById(teamId);
  row.teamId = teamId;
  row.teamName = team?.teamName || "";
  if (!teamId) {
    row.subjectId = "";
    row.subjectName = "";
    row.validation = "";
    return false;
  }
  const subject = resourceBySubject(row.subjectId);
  if (subject && subject.teamId === teamId) {
    row.validation = "";
    return false;
  }
  const hadSubject = Boolean(row.subjectId);
  row.subjectId = "";
  row.subjectName = "";
  row.validation = "";
  return hadSubject;
}

function setRowSubject(row, subjectId) {
  const subject = resourceBySubject(subjectId);
  if (!row.teamId) {
    row.subjectId = "";
    row.subjectName = "";
    row.validation = "";
    return false;
  }
  if (subjectId && (!subject || subject.teamId !== row.teamId)) {
    row.validation = "作业主体所属队伍与施工队伍不一致";
    return false;
  }
  row.subjectId = subjectId;
  row.subjectName = subject?.displayName || "";
  row.validation = "";
  return true;
}

function applyTeam(row, teamId) {
  const targets = row.isLeaf === "是" ? [row] : descendantsOf(row);
  let cleared = 0;
  let changed = 0;
  targets.forEach((target) => {
    if (setRowTeam(target, teamId)) cleared += 1;
    changed += 1;
  });
  if (row.isLeaf !== "是") {
    const draft = draftFor(row);
    draft.teamId = teamId;
    const subject = resourceBySubject(draft.subjectId);
    if (!teamId || (subject && subject.teamId !== teamId)) draft.subjectId = "";
  }
  savePageConfig({ quiet: true });
  render();
  if (cleared) showToast("因施工队伍变更，原作业班组已自动清除。");
  else if (row.isLeaf !== "是") showToast(`已成功设置 ${changed} 个施工单元的施工队伍。`);
}

function applySubject(row, subjectId) {
  if (row.isLeaf === "是") {
    setRowSubject(row, subjectId);
    savePageConfig({ quiet: true });
    render();
    return;
  }

  const subject = resourceBySubject(subjectId);
  const teamId = effectiveTeamId(row);
  const draft = draftFor(row);
  if (!subjectId) {
    draft.subjectId = "";
    savePageConfig({ quiet: true });
    render();
    showToast("已清空当前节点批量作业班组选择。");
    return;
  }
  if (!subject || !teamId || subject.teamId !== teamId) {
    draft.subjectId = "";
    savePageConfig({ quiet: true });
    render();
    showToast("作业班组与当前施工队伍不匹配，未执行批量设置。");
    return;
  }
  draft.subjectId = subjectId;

  let success = 0;
  let skippedNoTeam = 0;
  let skippedMismatch = 0;
  descendantsOf(row).forEach((target) => {
    if (!target.teamId) {
      skippedNoTeam += 1;
      return;
    }
    if (target.teamId !== subject.teamId) {
      skippedMismatch += 1;
      return;
    }
    if (setRowSubject(target, subjectId)) success += 1;
  });

  savePageConfig({ quiet: true });
  render();
  showToast(`已成功设置 ${success} 个施工单元，${skippedNoTeam + skippedMismatch} 个施工单元因施工队伍为空或不匹配未设置。`);
}

document.getElementById("app").addEventListener("change", (event) => {
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    if (filter.dataset.filter === "workpoint") state.selectedWorkpointId = filter.value;
    if (filter.dataset.filter === "level") {
      state.expandLevel = Number(filter.value);
      state.collapsedNodeIds.clear();
    }
    render();
    return;
  }

  const field = event.target.closest("[data-field]");
  if (!field) return;
  const row = state.rows.find((item) => item.nodeId === field.dataset.nodeId);
  if (!row) return;
  if (field.dataset.field === "team") applyTeam(row, field.value);
  if (field.dataset.field === "subject") applySubject(row, field.value);
});

document.getElementById("app").addEventListener("click", (event) => {
  const pageNav = event.target.closest("[data-page-nav]");
  if (pageNav) {
    event.preventDefault();
    window.location.href = `${pageNav.dataset.pageNav}?refresh=${Date.now()}`;
    return;
  }

  const nodeToggle = event.target.closest("[data-node-toggle]");
  const action = event.target.closest("[data-action]");
  if (action?.dataset.action === "save-responsibility") {
    saveToLocalExcel();
    return;
  }

  if (!nodeToggle) return;
  const nodeId = nodeToggle.dataset.nodeToggle;
  if (state.collapsedNodeIds.has(nodeId)) state.collapsedNodeIds.delete(nodeId);
  else state.collapsedNodeIds.add(nodeId);
  render();
});

render();
refreshSourceFromLocalExcel();
