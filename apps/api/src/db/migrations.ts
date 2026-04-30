import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { getPool } from "./client.js";

export async function runMigrations() {
  const files = (await fs.readdir(config.migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));
  const db = getPool();
  for (const file of files) {
    const sql = await fs.readFile(path.join(config.migrationsDir, file), "utf8");
    await db.query(sql);
  }
  return { ok: true, files };
}
