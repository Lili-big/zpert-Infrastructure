import { ResponsibilityPayloadSchema, type ResponsibilityPayload } from "@construction/shared";
import { runStructureSync } from "@construction/data-sync";
import fs from "node:fs/promises";
import { config } from "../config.js";
import { getPool } from "../db/client.js";
import { runMigrations } from "../db/migrations.js";
import { legacyDatabase } from "./legacy-database.js";

export async function healthCheck() {
  const db = getPool();
  const result = await db.query("select 1 as ok");
  return {
    ok: true,
    database: result.rows[0],
    mode: config.nodeEnv,
  };
}

export async function ensureConfig(projectId?: string | null) {
  const legacy = await legacyDatabase();
  let payload = await legacy.readResponsibilityPayloadFromDatabase(projectId || null);
  if (!payload) {
    await legacy.seedDatabaseFromResponsibilityJson();
    payload = await legacy.readResponsibilityPayloadFromDatabase(projectId || null);
  }
  if (!payload) throw new Error("数据库中没有可用的项目配置。");
  return ResponsibilityPayloadSchema.parse(payload);
}

async function readProjectStructureData(projectId?: string | null) {
  const legacy = await legacyDatabase();
  try {
    await fs.access(config.projectStructurePath);
    return legacy.readProjectStructure(config.projectStructurePath);
  } catch {
    const result = await getPool().query(
      "select project_structure from public.construction_projects where ($1::text is null or project_id = $1) order by updated_at desc limit 1",
      [projectId || null],
    );
    const projectStructure = result.rows[0]?.project_structure;
    if (!projectStructure) throw new Error("数据库中没有可用的项目结构快照。");
    return projectStructure;
  }
}

export async function bootstrapProject(projectId: string) {
  const configPayload = await ensureConfig(projectId === "default" ? null : projectId);
  const projectStructure = await readProjectStructureData(configPayload.source?.projectId || (projectId === "default" ? null : projectId));
  return {
    ok: true,
    projectId: configPayload.source?.projectId || projectId,
    projectStructure,
    config: configPayload,
  };
}

export async function saveProjectConfig(projectId: string, payload: ResponsibilityPayload) {
  const parsed = ResponsibilityPayloadSchema.parse(payload);
  const legacy = await legacyDatabase();
  const projectStructure = await readProjectStructureData(parsed.source?.projectId || (projectId === "default" ? null : projectId));
  const saved = await legacy.saveResponsibilityPayloadToDatabase(parsed, { projectData: projectStructure });
  const fresh = await legacy.readResponsibilityPayloadFromDatabase(saved.projectId);
  if (fresh && !process.env.NETLIFY) await legacy.writeResponsibilityPageFiles(fresh);
  return {
    ok: true,
    ...saved,
    counts: {
      resources: fresh?.resources?.length || 0,
      assignments: fresh?.assignments?.length || 0,
      directions: fresh?.directions?.length || 0,
      scheduleTasks: fresh?.scheduleTasks?.length || 0,
    },
  };
}

export async function syncProjectStructure() {
  const result = await runStructureSync({ projectRoot: config.projectRoot });
  return {
    ok: true,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

export async function migrateDatabase() {
  return runMigrations();
}
