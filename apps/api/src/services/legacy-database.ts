import { pathToFileURL } from "node:url";
import { config } from "../config.js";
import type { ResponsibilityPayload } from "@construction/shared";

interface LegacyDatabaseModule {
  ensureDatabaseSchema(): Promise<void>;
  getPool(): { query(sql: string, params?: unknown[]): Promise<{ rows: unknown[] }> };
  readProjectStructure(projectStructurePath?: string): Promise<unknown>;
  readResponsibilityPayloadFromDatabase(projectId?: string | null): Promise<ResponsibilityPayload | null>;
  saveResponsibilityPayloadToDatabase(payload: ResponsibilityPayload, options?: Record<string, unknown>): Promise<{
    projectId: string;
    projectName: string;
    generatedAt: string;
  }>;
  seedDatabaseFromResponsibilityJson(options?: Record<string, unknown>): Promise<unknown>;
  writeResponsibilityPageFiles(payload: ResponsibilityPayload, options?: Record<string, unknown>): Promise<ResponsibilityPayload>;
}

let legacyModule: Promise<LegacyDatabaseModule> | null = null;

export function legacyDatabase() {
  if (!legacyModule) {
    legacyModule = import(pathToFileURL(config.legacyDatabaseFile).href) as Promise<LegacyDatabaseModule>;
  }
  return legacyModule;
}
