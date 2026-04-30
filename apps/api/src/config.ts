import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceProjectRoot = path.resolve(__dirname, "../../..");
const cwdProjectRoot = process.cwd();
const projectRoot = fs.existsSync(path.join(sourceProjectRoot, "package.json")) ? sourceProjectRoot : cwdProjectRoot;

function loadEnvFile() {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return;
    const [, key, rawValue] = match;
    if (process.env[key]) return;
    let value = rawValue.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  });
}

loadEnvFile();

export const config = {
  projectRoot,
  host: process.env.API_HOST || "127.0.0.1",
  port: Number(process.env.API_PORT || process.env.PORT || 8787),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  apiKey: process.env.API_KEY || "",
  requireApiKey: String(process.env.API_REQUIRE_KEY || "").toLowerCase() === "true" || process.env.NODE_ENV === "production",
  legacyDatabaseFile: path.join(projectRoot, "construction_database.mjs"),
  projectStructurePath: path.join(projectRoot, "项目结构数据", "output", "project_structure_data.json"),
  staticRoot: path.join(projectRoot, "apps", "web", "dist"),
  legacyStaticRoot: projectRoot,
  migrationsDir: path.join(projectRoot, "apps", "api", "migrations"),
};
