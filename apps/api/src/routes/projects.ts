import type { FastifyInstance } from "fastify";
import type { ResponsibilityPayload } from "@construction/shared";
import { bootstrapProject, ensureConfig, migrateDatabase, saveProjectConfig, syncProjectStructure } from "../services/project-service.js";
import { buildConfigWorkbookXml } from "../services/excel-adapter.js";

export async function projectRoutes(app: FastifyInstance) {
  app.get<{ Params: { projectId: string } }>("/api/projects/:projectId/bootstrap", async (request) => {
    return bootstrapProject(request.params.projectId);
  });

  app.get<{ Params: { projectId: string } }>("/api/projects/:projectId/config", async (request) => {
    const projectId = request.params.projectId === "default" ? null : request.params.projectId;
    return { ok: true, config: await ensureConfig(projectId) };
  });

  app.put<{ Params: { projectId: string }; Body: ResponsibilityPayload }>(
    "/api/projects/:projectId/config",
    async (request) => saveProjectConfig(request.params.projectId, request.body),
  );

  app.post<{ Params: { projectId: string } }>("/api/projects/:projectId/sync-structure", async () => syncProjectStructure());

  app.post<{ Params: { projectId: string } }>("/api/projects/:projectId/excel/import", async (_request, reply) => {
    reply.code(501);
    return {
      ok: false,
      message: "Excel 导入适配器已预留接口；当前主数据源为 Supabase PostgreSQL，请继续使用 sync-structure。",
    };
  });

  app.get<{ Params: { projectId: string } }>("/api/projects/:projectId/excel/export", async (request, reply) => {
    const projectId = request.params.projectId === "default" ? "default" : request.params.projectId;
    const config = await ensureConfig(projectId === "default" ? null : projectId);
    const workbookXml = buildConfigWorkbookXml(config, projectId);
    const safeProjectId = projectId.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = encodeURIComponent(`${safeProjectId}-construction-config.xls`);

    reply
      .header("Content-Type", "application/vnd.ms-excel; charset=utf-8")
      .header("Content-Disposition", `attachment; filename="${safeProjectId}-construction-config.xls"; filename*=UTF-8''${filename}`)
      .send(workbookXml);
  });

  app.post("/api/admin/migrate", async () => migrateDatabase());
}
