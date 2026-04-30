import type { BootstrapResponse, ResponsibilityPayload } from "@construction/shared";

const API_KEY_STORAGE_KEY = "construction-platform.api-key";
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getApiKeyHeader(method?: string) {
  if (!method || !WRITE_METHODS.has(method.toUpperCase())) return {};
  const apiKey = window.localStorage.getItem(API_KEY_STORAGE_KEY);
  return apiKey ? { "X-API-Key": apiKey } : {};
}

function buildHeaders(options: RequestInit) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  Object.entries(getApiKeyHeader(options.method)).forEach(([key, value]) => headers.set(key, value));
  return headers;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || `请求失败：${response.status}`);
  }
  return payload as T;
}

export const api = {
  bootstrap(projectId = "default") {
    return request<BootstrapResponse>(`/api/projects/${projectId}/bootstrap`);
  },
  saveConfig(projectId: string, config: ResponsibilityPayload) {
    return request<{ ok: true; generatedAt: string; counts: Record<string, number> }>(
      `/api/projects/${projectId}/config`,
      {
        method: "PUT",
        body: JSON.stringify(config),
      },
    );
  },
  syncStructure(projectId: string) {
    return request<{ ok: true; stdout: string; stderr: string }>(`/api/projects/${projectId}/sync-structure`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
  health() {
    return request<{ ok: true; database: unknown; mode: string }>("/api/health");
  },
};
