import type { FastifyInstance } from "fastify";
import { healthCheck } from "../services/project-service.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/api/health", async () => healthCheck());
  app.get("/api/status", async () => ({ ok: true, database: "supabase-postgres", api: "fastify" }));
}
