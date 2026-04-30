import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool() {
  if (pool) return pool;
  if (!config.databaseUrl) {
    throw new Error("缺少 DATABASE_URL，无法连接 PostgreSQL。");
  }
  const needsSsl = !/localhost|127\.0\.0\.1/i.test(config.databaseUrl);
  pool = new Pool({
    connectionString: config.databaseUrl,
    max: Number(process.env.PG_POOL_MAX || 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    application_name: "construction-schedule-fastify-api",
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });
  return pool;
}

export async function closePool() {
  if (!pool) return;
  await pool.end();
  pool = null;
}
