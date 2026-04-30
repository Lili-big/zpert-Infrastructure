import type { FastifyInstance } from "fastify";
import { ensureConfig, saveProjectConfig } from "../services/project-service.js";
import type { ResponsibilityPayload } from "@construction/shared";

export async function compatRoutes(app: FastifyInstance) {
  app.get("/api/responsibility/data", async () => {
    const payload = await ensureConfig(null);
    return { ok: true, ...payload };
  });

  app.post<{ Body: ResponsibilityPayload }>("/api/responsibility/save", async (request) => {
    return saveProjectConfig("default", request.body);
  });
}
