import { runMigrations } from "./db/migrations.js";
import { closePool } from "./db/client.js";

runMigrations()
  .then((result) => {
    process.stdout.write(`Migrations applied: ${result.files.join(", ")}\n`);
  })
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
