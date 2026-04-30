import fs from "node:fs";
import path from "node:path";
import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";
import { config } from "../config.js";

export async function staticPlugin(app: FastifyInstance) {
  if (fs.existsSync(config.staticRoot)) {
    await app.register(fastifyStatic, {
      root: config.staticRoot,
      prefix: "/",
      decorateReply: true,
    });
    app.setNotFoundHandler(async (request, reply) => {
      if (request.method === "GET" && !request.url.startsWith("/api/")) {
        return reply.sendFile("index.html");
      }
      reply.code(404);
      return { ok: false, message: "Not found" };
    });
    return;
  }

  await app.register(fastifyStatic, {
    root: config.legacyStaticRoot,
    prefix: "/",
    decorateReply: true,
  });

  app.get("/", async (_request, reply) => reply.redirect("/responsibility-area-settings.html"));
  app.get("/app", async (_request, reply) => {
    const indexPath = path.join(config.staticRoot, "index.html");
    if (fs.existsSync(indexPath)) return reply.sendFile("index.html");
    return reply.redirect("/responsibility-area-settings.html");
  });
}
