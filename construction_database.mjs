import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_PROJECT_STRUCTURE_PATH = path.join(moduleDir, "项目结构数据", "output", "project_structure_data.json");
const DEFAULT_RESPONSIBILITY_JSON_PATH = path.join(moduleDir, "项目结构数据", "output", "responsibility_area_data.json");
const DEFAULT_RESPONSIBILITY_JS_PATH = path.join(moduleDir, "项目结构数据", "output", "responsibility_area_data.js");

let pool = null;
let schemaReady = false;

function loadEnvFile() {
  const envPath = path.join(moduleDir, ".env");
  if (!fsSync.existsSync(envPath)) return;
  const text = fsSync.readFileSync(envPath, "utf8");
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return;
    const [, key, rawValue] = match;
    if (process.env[key]) return;
    let value = rawValue.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  });
}

function connectionString() {
  loadEnvFile();
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("缺少 DATABASE_URL，请在 .env 中配置 Supabase session pool 连接串。");
  }
  return value;
}

export function getPool() {
  if (pool) return pool;
  const databaseUrl = connectionString();
  const needsSsl = !/localhost|127\.0\.0\.1/i.test(databaseUrl);
  pool = new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.PG_POOL_MAX || 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    application_name: "construction-schedule-local-config",
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });
  return pool;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asText(value) {
  return String(value ?? "").trim();
}

function asNumber(value, fallback = null) {
  const text = asText(value);
  if (!text) return fallback;
  const number = Number(text);
  return Number.isFinite(number) ? number : fallback;
}

function yesNoToBool(value, fallback = true) {
  if (typeof value === "boolean") return value;
  const text = asText(value);
  if (!text) return fallback;
  return text !== "否" && text.toLowerCase() !== "false";
}

function boolToYesNo(value) {
  return value === false ? "否" : "是";
}

function numericText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

export async function readProjectStructure(projectStructurePath = DEFAULT_PROJECT_STRUCTURE_PATH) {
  return readJson(projectStructurePath, {});
}

function projectIdFrom(projectData, fallbackPayload = {}) {
  return asText(
    projectData?.source?.projectId
    || fallbackPayload?.source?.projectId
    || fallbackPayload?.source?.project_id
    || "default-project",
  );
}

function projectNameFrom(projectData, fallbackPayload = {}) {
  return asText(
    projectData?.source?.projectName
    || fallbackPayload?.source?.projectName
    || fallbackPayload?.source?.project_name
    || "未命名项目",
  );
}

export async function ensureDatabaseSchema() {
  if (schemaReady) return;
  const db = getPool();
  await db.query(`
    create table if not exists public.construction_projects (
      project_id text primary key,
      project_name text not null,
      source_meta jsonb not null default '{}'::jsonb,
      project_structure jsonb not null default '{}'::jsonb,
      summary jsonb not null default '[]'::jsonb,
      generated_at timestamptz,
      imported_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists public.construction_workpoints (
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      workpoint_id text not null,
      source_id text,
      discipline text,
      kind text,
      name text not null,
      base_name text,
      side text,
      prev_workpoint text,
      gap_days numeric not null default 0,
      manual_start text,
      mile numeric,
      unit_count integer,
      payload jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now(),
      primary key (project_id, workpoint_id)
    );

    create table if not exists public.construction_structure_templates (
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      workpoint_id text not null,
      template jsonb not null default '[]'::jsonb,
      updated_at timestamptz not null default now(),
      primary key (project_id, workpoint_id)
    );

    create table if not exists public.construction_resources (
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      subject_id text not null,
      team_id text not null,
      team_name text not null,
      crew_id text,
      crew_name text,
      subject_type text not null default '队伍',
      display_name text not null,
      enabled boolean not null default true,
      note text,
      updated_at timestamptz not null default now(),
      primary key (project_id, subject_id),
      constraint construction_resources_subject_type_chk check (subject_type in ('队伍', '队伍-班组'))
    );

    create table if not exists public.construction_assignments (
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      node_id text not null,
      parent_id text,
      workpoint_id text,
      workpoint_name text,
      planned_workpoint_id text,
      planned_workpoint_name text,
      name text not null,
      node_type text,
      level_no integer,
      code text,
      is_leaf boolean not null default false,
      construction_unit_id text,
      team_id text,
      team_name text,
      subject_id text,
      subject_name text,
      sync_status text,
      validation text,
      raw_path text,
      source_order integer,
      updated_at timestamptz not null default now(),
      primary key (project_id, node_id)
    );

    create table if not exists public.construction_workgroup_directions (
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      direction_id text not null,
      planned_workpoint_id text,
      planned_workpoint_name text,
      subject_id text,
      subject_name text,
      team_id text,
      team_name text,
      scope text,
      content text,
      direction text not null default '从小到大',
      sync_status text,
      note text,
      updated_at timestamptz not null default now(),
      primary key (project_id, direction_id),
      constraint construction_workgroup_directions_direction_chk check (direction in ('从小到大', '从大到小'))
    );

    create table if not exists public.construction_beam_directions (
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      beam_direction_id text not null,
      name text not null,
      start_pier text,
      end_pier text,
      resource text,
      transfer_days numeric not null default 0,
      prev_direction text,
      planned_start text,
      enabled boolean not null default true,
      sync_status text,
      validation text,
      note text,
      updated_at timestamptz not null default now(),
      primary key (project_id, beam_direction_id)
    );

    create table if not exists public.construction_productivity (
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      productivity_id text not null,
      discipline text,
      structure_type text not null,
      procedure_name text,
      craft text,
      productivity numeric,
      productivity_unit text,
      quantity_unit text,
      keywords text,
      enabled boolean not null default true,
      note text,
      updated_at timestamptz not null default now(),
      primary key (project_id, productivity_id)
    );

    create table if not exists public.construction_workpoint_orders (
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      workpoint_id text not null,
      discipline text,
      name text,
      prev_workpoint text,
      gap_days numeric not null default 0,
      manual_start text,
      order_no integer,
      sync_status text,
      note text,
      updated_at timestamptz not null default now(),
      primary key (project_id, workpoint_id)
    );

    create table if not exists public.construction_schedule_tasks (
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      config_id text not null,
      workpoint_id text,
      workpoint_name text,
      structure_id text not null,
      structure_name text,
      task_order integer not null default 1,
      name text not null,
      prev_task text,
      relation text not null default 'FS',
      gap_days numeric not null default 0,
      quantity text,
      unit text,
      craft text,
      productivity_metric text,
      crew text,
      duration text,
      sync_status text,
      note text,
      updated_at timestamptz not null default now(),
      primary key (project_id, config_id),
      constraint construction_schedule_tasks_relation_chk check (relation in ('FS'))
    );

    create table if not exists public.construction_config_snapshots (
      id bigserial primary key,
      project_id text not null references public.construction_projects(project_id) on delete cascade,
      action text not null default 'save',
      payload jsonb not null,
      created_at timestamptz not null default now()
    );

    alter table public.construction_projects enable row level security;
    alter table public.construction_workpoints enable row level security;
    alter table public.construction_structure_templates enable row level security;
    alter table public.construction_resources enable row level security;
    alter table public.construction_assignments enable row level security;
    alter table public.construction_workgroup_directions enable row level security;
    alter table public.construction_beam_directions enable row level security;
    alter table public.construction_productivity enable row level security;
    alter table public.construction_workpoint_orders enable row level security;
    alter table public.construction_schedule_tasks enable row level security;
    alter table public.construction_config_snapshots enable row level security;

    create index if not exists idx_construction_assignments_workpoint on public.construction_assignments(project_id, planned_workpoint_id);
    create index if not exists idx_construction_assignments_subject on public.construction_assignments(project_id, subject_id);
    create index if not exists idx_construction_directions_workpoint on public.construction_workgroup_directions(project_id, planned_workpoint_id);
    create index if not exists idx_construction_tasks_structure on public.construction_schedule_tasks(project_id, structure_id, task_order);
    create index if not exists idx_construction_tasks_workpoint on public.construction_schedule_tasks(project_id, workpoint_id, task_order);
    create index if not exists idx_construction_config_snapshots_project on public.construction_config_snapshots(project_id, created_at desc);
  `);
  schemaReady = true;
}

async function withTransaction(callback) {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function insertRows(client, tableName, columns, rows, mapper, chunkSize = 100) {
  if (!rows.length) return;
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    const values = [];
    const placeholders = chunk.map((row, rowIndex) => {
      const mapped = mapper(row, offset + rowIndex);
      mapped.forEach((value) => values.push(value));
      const start = rowIndex * columns.length;
      return `(${columns.map((_, colIndex) => `$${start + colIndex + 1}`).join(", ")})`;
    });
    await client.query(
      `insert into public.${tableName} (${columns.join(", ")}) values ${placeholders.join(", ")}`,
      values,
    );
  }
}

async function upsertProject(client, projectId, projectName, projectData) {
  await client.query(
    `insert into public.construction_projects
      (project_id, project_name, source_meta, project_structure, summary, generated_at)
    values ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6)
    on conflict (project_id) do update set
      project_name = excluded.project_name,
      source_meta = excluded.source_meta,
      project_structure = excluded.project_structure,
      summary = excluded.summary,
      generated_at = excluded.generated_at`,
    [
      projectId,
      projectName,
      JSON.stringify(projectData?.source || {}),
      JSON.stringify(projectData || {}),
      JSON.stringify(projectData?.summary || []),
      projectData?.source?.generatedAt || null,
    ],
  );
}

async function replaceProjectDerivedTables(client, projectId, projectData) {
  await client.query("delete from public.construction_structure_templates where project_id = $1", [projectId]);
  await client.query("delete from public.construction_workpoints where project_id = $1", [projectId]);

  const workpoints = asArray(projectData?.workpoints);
  await insertRows(
    client,
    "construction_workpoints",
    [
      "project_id",
      "workpoint_id",
      "source_id",
      "discipline",
      "kind",
      "name",
      "base_name",
      "side",
      "prev_workpoint",
      "gap_days",
      "manual_start",
      "mile",
      "unit_count",
      "payload",
    ],
    workpoints,
    (row) => [
      projectId,
      asText(row.id),
      asText(row.sourceId),
      asText(row.discipline),
      asText(row.kind),
      asText(row.name),
      asText(row.baseName),
      asText(row.side),
      asText(row.prev),
      asNumber(row.gap, 0),
      asText(row.start),
      asNumber(row.mile),
      asNumber(row.unitCount),
      JSON.stringify(row || {}),
    ],
  );

  const templateRows = Object.entries(projectData?.structureTemplatesByWorkpoint || {})
    .map(([workpointId, template]) => ({ workpointId, template }));
  await insertRows(
    client,
    "construction_structure_templates",
    ["project_id", "workpoint_id", "template"],
    templateRows,
    (row) => [projectId, row.workpointId, JSON.stringify(row.template || [])],
  );
}

async function replaceConfigTables(client, projectId, payload) {
  const tables = [
    "construction_schedule_tasks",
    "construction_workpoint_orders",
    "construction_productivity",
    "construction_beam_directions",
    "construction_workgroup_directions",
    "construction_assignments",
    "construction_resources",
  ];
  for (const table of tables) {
    await client.query(`delete from public.${table} where project_id = $1`, [projectId]);
  }

  await insertRows(
    client,
    "construction_resources",
    ["project_id", "subject_id", "team_id", "team_name", "crew_id", "crew_name", "subject_type", "display_name", "enabled", "note"],
    asArray(payload.resources),
    (row) => [
      projectId,
      asText(row.subjectId),
      asText(row.teamId),
      asText(row.teamName),
      asText(row.crewId),
      asText(row.crewName),
      asText(row.type) || "队伍",
      asText(row.displayName) || asText(row.teamName),
      yesNoToBool(row.enabled),
      asText(row.note),
    ],
  );

  await insertRows(
    client,
    "construction_assignments",
    [
      "project_id",
      "node_id",
      "parent_id",
      "workpoint_id",
      "workpoint_name",
      "planned_workpoint_id",
      "planned_workpoint_name",
      "name",
      "node_type",
      "level_no",
      "code",
      "is_leaf",
      "construction_unit_id",
      "team_id",
      "team_name",
      "subject_id",
      "subject_name",
      "sync_status",
      "validation",
      "raw_path",
      "source_order",
    ],
    asArray(payload.assignments),
    (row, index) => [
      projectId,
      asText(row.nodeId),
      asText(row.parentId),
      asText(row.workpointId),
      asText(row.workpointName),
      asText(row.plannedWorkpointId),
      asText(row.plannedWorkpointName),
      asText(row.name),
      asText(row.type),
      asNumber(row.level),
      asText(row.code),
      asText(row.isLeaf) === "是" || row.isLeaf === true,
      asText(row.constructionUnitId),
      asText(row.teamId),
      asText(row.teamName),
      asText(row.subjectId),
      asText(row.subjectName),
      asText(row.syncStatus),
      asText(row.validation),
      asText(row.rawPath),
      asNumber(row.sourceOrder, index + 1),
    ],
  );

  await insertRows(
    client,
    "construction_workgroup_directions",
    [
      "project_id",
      "direction_id",
      "planned_workpoint_id",
      "planned_workpoint_name",
      "subject_id",
      "subject_name",
      "team_id",
      "team_name",
      "scope",
      "content",
      "direction",
      "sync_status",
      "note",
    ],
    asArray(payload.directions),
    (row) => [
      projectId,
      asText(row.directionId),
      asText(row.plannedWorkpointId),
      asText(row.plannedWorkpointName),
      asText(row.subjectId),
      asText(row.subjectName),
      asText(row.teamId),
      asText(row.teamName),
      asText(row.scope),
      asText(row.content),
      ["从小到大", "从大到小"].includes(asText(row.direction)) ? asText(row.direction) : "从小到大",
      asText(row.syncStatus),
      asText(row.note),
    ],
  );

  await insertRows(
    client,
    "construction_beam_directions",
    ["project_id", "beam_direction_id", "name", "start_pier", "end_pier", "resource", "transfer_days", "prev_direction", "planned_start", "enabled", "sync_status", "validation", "note"],
    asArray(payload.beamLines),
    (row) => [
      projectId,
      asText(row.id),
      asText(row.name),
      asText(row.startPier),
      asText(row.endPier),
      asText(row.resource),
      asNumber(row.transfer, 0),
      asText(row.prev),
      asText(row.startTime),
      yesNoToBool(row.enabled),
      asText(row.syncStatus),
      asText(row.validation),
      asText(row.note),
    ],
  );

  await insertRows(
    client,
    "construction_productivity",
    ["project_id", "productivity_id", "discipline", "structure_type", "procedure_name", "craft", "productivity", "productivity_unit", "quantity_unit", "keywords", "enabled", "note"],
    asArray(payload.productivity),
    (row) => [
      projectId,
      asText(row.productivityId),
      asText(row.discipline),
      asText(row.structureType),
      asText(row.procedure),
      asText(row.craft),
      asNumber(row.productivity),
      asText(row.productivityUnit),
      asText(row.quantityUnit),
      asText(row.keywords),
      yesNoToBool(row.enabled),
      asText(row.note),
    ],
  );

  await insertRows(
    client,
    "construction_workpoint_orders",
    ["project_id", "workpoint_id", "discipline", "name", "prev_workpoint", "gap_days", "manual_start", "order_no", "sync_status", "note"],
    asArray(payload.workpointOrder),
    (row, index) => [
      projectId,
      asText(row.workpointId),
      asText(row.discipline),
      asText(row.name),
      asText(row.prev),
      asNumber(row.gap, 0),
      asText(row.start),
      asNumber(row.order, index + 1),
      asText(row.syncStatus),
      asText(row.note),
    ],
  );

  await insertRows(
    client,
    "construction_schedule_tasks",
    [
      "project_id",
      "config_id",
      "workpoint_id",
      "workpoint_name",
      "structure_id",
      "structure_name",
      "task_order",
      "name",
      "prev_task",
      "relation",
      "gap_days",
      "quantity",
      "unit",
      "craft",
      "productivity_metric",
      "crew",
      "duration",
      "sync_status",
      "note",
    ],
    asArray(payload.scheduleTasks),
    (row, index) => [
      projectId,
      asText(row.configId) || `${asText(row.structureId)}::${index + 1}`,
      asText(row.workpointId),
      asText(row.workpointName),
      asText(row.structureId),
      asText(row.structureName),
      asNumber(row.taskOrder, index + 1),
      asText(row.name),
      asText(row.prev),
      asText(row.relation) || "FS",
      asNumber(row.gap, 0),
      asText(row.qty),
      asText(row.unit),
      asText(row.craft),
      asText(row.metric),
      asText(row.crew),
      asText(row.duration),
      asText(row.syncStatus),
      asText(row.note),
    ],
  );

  await client.query(
    "insert into public.construction_config_snapshots (project_id, action, payload) values ($1, $2, $3::jsonb)",
    [projectId, "save", JSON.stringify(payload)],
  );
}

export async function saveResponsibilityPayloadToDatabase(payload, options = {}) {
  await ensureDatabaseSchema();
  const projectData = options.projectData || await readProjectStructure(options.projectStructurePath);
  const projectId = projectIdFrom(projectData, payload);
  const projectName = projectNameFrom(projectData, payload);
  const savedAt = new Date().toISOString();

  await withTransaction(async (client) => {
    await upsertProject(client, projectId, projectName, projectData);
    await replaceProjectDerivedTables(client, projectId, projectData);
    await replaceConfigTables(client, projectId, {
      ...payload,
      source: {
        ...(payload.source || {}),
        projectId,
        projectName,
        databaseSavedAt: savedAt,
      },
    });
  });

  return { projectId, projectName, generatedAt: savedAt };
}

async function defaultProjectId() {
  const projectData = await readProjectStructure();
  const localId = projectIdFrom(projectData);
  if (localId !== "default-project") return localId;
  const result = await getPool().query(
    "select project_id from public.construction_projects order by updated_at desc, imported_at desc limit 1",
  );
  return result.rows[0]?.project_id || localId;
}

export async function readResponsibilityPayloadFromDatabase(projectId = null) {
  await ensureDatabaseSchema();
  const effectiveProjectId = projectId || await defaultProjectId();
  const db = getPool();
  const projectResult = await db.query(
    "select * from public.construction_projects where project_id = $1",
    [effectiveProjectId],
  );
  const project = projectResult.rows[0];
  if (!project) return null;

  const [
    resources,
    assignments,
    directions,
    beamLines,
    productivity,
    workpointOrder,
    scheduleTasks,
  ] = await Promise.all([
    db.query("select * from public.construction_resources where project_id = $1 order by subject_id", [effectiveProjectId]),
    db.query("select * from public.construction_assignments where project_id = $1 order by source_order nulls last, node_id", [effectiveProjectId]),
    db.query("select * from public.construction_workgroup_directions where project_id = $1 order by direction_id", [effectiveProjectId]),
    db.query("select * from public.construction_beam_directions where project_id = $1 order by beam_direction_id", [effectiveProjectId]),
    db.query("select * from public.construction_productivity where project_id = $1 order by productivity_id", [effectiveProjectId]),
    db.query("select * from public.construction_workpoint_orders where project_id = $1 order by order_no nulls last, workpoint_id", [effectiveProjectId]),
    db.query("select * from public.construction_schedule_tasks where project_id = $1 order by workpoint_id, structure_id, task_order", [effectiveProjectId]),
  ]);

  return {
    source: {
      ...(project.source_meta || {}),
      projectId: effectiveProjectId,
      projectName: project.project_name,
      database: "supabase-postgres",
      generatedAt: project.updated_at?.toISOString?.() || new Date().toISOString(),
      databaseLoadedAt: new Date().toISOString(),
    },
    resources: resources.rows.map((row) => ({
      subjectId: row.subject_id,
      teamId: row.team_id,
      teamName: row.team_name,
      crewId: row.crew_id || "",
      crewName: row.crew_name || "",
      type: row.subject_type,
      displayName: row.display_name,
      enabled: boolToYesNo(row.enabled),
      note: row.note || "",
    })),
    assignments: assignments.rows.map((row) => ({
      nodeId: row.node_id,
      parentId: row.parent_id || "",
      workpointId: row.workpoint_id || "",
      workpointName: row.workpoint_name || "",
      plannedWorkpointId: row.planned_workpoint_id || "",
      plannedWorkpointName: row.planned_workpoint_name || "",
      name: row.name || "",
      type: row.node_type || "",
      level: numericText(row.level_no),
      code: row.code || "",
      isLeaf: row.is_leaf ? "是" : "否",
      constructionUnitId: row.construction_unit_id || "",
      teamId: row.team_id || "",
      teamName: row.team_name || "",
      subjectId: row.subject_id || "",
      subjectName: row.subject_name || "",
      syncStatus: row.sync_status || "",
      validation: row.validation || "",
      rawPath: row.raw_path || "",
      sourceOrder: row.source_order || "",
    })),
    directions: directions.rows.map((row) => ({
      directionId: row.direction_id,
      plannedWorkpointId: row.planned_workpoint_id || "",
      plannedWorkpointName: row.planned_workpoint_name || "",
      subjectId: row.subject_id || "",
      subjectName: row.subject_name || "",
      teamId: row.team_id || "",
      teamName: row.team_name || "",
      scope: row.scope || "",
      content: row.content || "",
      direction: row.direction || "从小到大",
      syncStatus: row.sync_status || "",
      note: row.note || "",
    })),
    beamLines: beamLines.rows.map((row) => ({
      id: row.beam_direction_id,
      name: row.name || "",
      startPier: row.start_pier || "",
      endPier: row.end_pier || "",
      resource: row.resource || "",
      transfer: numericText(row.transfer_days, "0"),
      prev: row.prev_direction || "",
      startTime: row.planned_start || "",
      enabled: boolToYesNo(row.enabled),
      syncStatus: row.sync_status || "",
      validation: row.validation || "",
      note: row.note || "",
    })),
    productivity: productivity.rows.map((row) => ({
      productivityId: row.productivity_id,
      discipline: row.discipline || "",
      structureType: row.structure_type || "",
      procedure: row.procedure_name || "",
      craft: row.craft || "",
      productivity: numericText(row.productivity),
      productivityUnit: row.productivity_unit || "",
      quantityUnit: row.quantity_unit || "",
      keywords: row.keywords || "",
      enabled: boolToYesNo(row.enabled),
      note: row.note || "",
    })),
    workpointOrder: workpointOrder.rows.map((row) => ({
      workpointId: row.workpoint_id,
      discipline: row.discipline || "",
      name: row.name || "",
      prev: row.prev_workpoint || "",
      gap: numericText(row.gap_days, "0"),
      start: row.manual_start || "",
      order: numericText(row.order_no),
      syncStatus: row.sync_status || "",
      note: row.note || "",
    })),
    scheduleTasks: scheduleTasks.rows.map((row) => ({
      configId: row.config_id,
      workpointId: row.workpoint_id || "",
      workpointName: row.workpoint_name || "",
      structureId: row.structure_id || "",
      structureName: row.structure_name || "",
      taskOrder: numericText(row.task_order, "1"),
      name: row.name || "",
      prev: row.prev_task || "",
      relation: row.relation || "FS",
      gap: numericText(row.gap_days, "0"),
      qty: row.quantity || "",
      unit: row.unit || "",
      craft: row.craft || "",
      metric: row.productivity_metric || "",
      crew: row.crew || "",
      duration: row.duration || "",
      syncStatus: row.sync_status || "",
      note: row.note || "",
    })),
  };
}

function leafAssignments(assignments) {
  return asArray(assignments).filter((row) => row.isLeaf === "是" && row.teamId);
}

function kindForWorkpoint(name) {
  const text = String(name || "");
  if (text.includes("隧道")) return "tunnel";
  if (text.includes("路基")) return "road";
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
  const crewRows = asArray(directions).map((row) => ({
    name: row.subjectName,
    scope: row.scope,
    content: row.content,
    direction: ["从小到大", "从大到小"].includes(row.direction) ? row.direction : "从小到大",
    team: row.teamName,
    directionId: row.directionId,
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

export function buildPagePayload(payload) {
  const resources = asArray(payload.resources).filter((row) => row.enabled !== "否");
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
  return {
    ...payload,
    source: {
      ...(payload.source || {}),
      resourceCount: resources.length,
      assignmentCount: asArray(payload.assignments).length,
      directionCount: asArray(payload.directions).length,
      beamDirectionCount: beamLines.length,
      productivityCount: asArray(payload.productivity).filter((row) => row.enabled !== "否").length,
      workpointOrderCount: asArray(payload.workpointOrder).length,
      scheduleTaskCount: asArray(payload.scheduleTasks).length,
    },
    resources,
    teams: resources.filter((row) => row.type === "队伍"),
    subjects: resources,
    beamLines,
    ...buildResponsibility(payload.assignments, payload.directions, resources),
  };
}

export async function writeResponsibilityPageFiles(payload, options = {}) {
  const jsonPath = options.jsonPath || DEFAULT_RESPONSIBILITY_JSON_PATH;
  const jsPath = options.jsPath || DEFAULT_RESPONSIBILITY_JS_PATH;
  const pagePayload = buildPagePayload(payload);
  const text = JSON.stringify(pagePayload, null, 2);
  await fs.mkdir(path.dirname(jsonPath), { recursive: true });
  await fs.writeFile(jsonPath, `${text}\n`, "utf8");
  await fs.writeFile(jsPath, `window.RESPONSIBILITY_AREA_DATA = ${text};\n`, "utf8");
  return pagePayload;
}

export async function seedDatabaseFromResponsibilityJson(options = {}) {
  const projectData = await readProjectStructure(options.projectStructurePath);
  const payload = await readJson(options.responsibilityJsonPath || DEFAULT_RESPONSIBILITY_JSON_PATH, null);
  if (!payload) throw new Error("未找到 responsibility_area_data.json，无法初始化数据库。");
  const result = await saveResponsibilityPayloadToDatabase(payload, { projectData });
  const fresh = await readResponsibilityPayloadFromDatabase(result.projectId);
  await writeResponsibilityPageFiles(fresh);
  return result;
}

export async function closeDatabasePool() {
  if (!pool) return;
  await pool.end();
  pool = null;
  schemaReady = false;
}
