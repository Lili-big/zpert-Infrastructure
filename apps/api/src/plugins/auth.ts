import type { FastifyInstance, FastifyRequest } from "fastify";
import { config } from "../config.js";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const PUBLIC_WRITE_PATHS = new Set(["/api/responsibility/save"]);

function requiresWriteAuth(request: FastifyRequest) {
  if (!WRITE_METHODS.has(request.method)) return false;
  if (PUBLIC_WRITE_PATHS.has(request.url.split("?")[0])) return false;
  return config.requireApiKey || Boolean(config.apiKey);
}

export async function authPlugin(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    if (!requiresWriteAuth(request)) return;
    const received = request.headers["x-api-key"];
    if (!config.apiKey) {
      reply.code(503);
      throw new Error("API_KEY 未配置，写接口被保护。");
    }
    if (received !== config.apiKey) {
      reply.code(401);
      throw new Error("X-API-Key 无效。");
    }
  });
}
