import Fastify from "fastify";
import cors from "@fastify/cors";
import { authPlugin } from "./plugins/auth.js";
import { staticPlugin } from "./plugins/static.js";
import { compatRoutes } from "./routes/compat.js";
import { healthRoutes } from "./routes/health.js";
import { projectRoutes } from "./routes/projects.js";

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
    bodyLimit: 30 * 1024 * 1024,
  });

  await app.register(cors, { origin: true });
  await app.register(authPlugin);
  await app.register(healthRoutes);
  await app.register(compatRoutes);
  await app.register(projectRoutes);
  await app.register(staticPlugin);

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = reply.statusCode >= 400 ? reply.statusCode : 500;
    const message = error instanceof Error ? error.message : String(error);

    reply.code(statusCode).send({
      ok: false,
      message,
    });
  });

  return app;
}
