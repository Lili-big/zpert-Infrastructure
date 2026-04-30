import { buildServer } from "./server.js";
import { config } from "./config.js";
import { closePool } from "./db/client.js";

const app = await buildServer();

try {
  await app.listen({ host: config.host, port: config.port });
  app.log.info(`API listening on http://${config.host}:${config.port}`);
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}

const shutdown = async () => {
  await app.close();
  await closePool();
};

process.on("SIGINT", () => {
  shutdown().finally(() => process.exit(0));
});
process.on("SIGTERM", () => {
  shutdown().finally(() => process.exit(0));
});
