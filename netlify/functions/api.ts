import { buildServer } from "../../apps/api/src/server.js";

let appPromise: ReturnType<typeof buildServer> | null = null;

async function getApp() {
  appPromise ||= buildServer();
  return appPromise;
}

function toHeaders(headers: Record<string, string | string[] | number | undefined>) {
  const result = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    if (value === undefined) return;
    result.set(key, Array.isArray(value) ? value.join(", ") : String(value));
  });
  return result;
}

export default async (request: Request) => {
  const app = await getApp();
  const url = new URL(request.url);
  const payload = request.method === "GET" || request.method === "HEAD" ? undefined : Buffer.from(await request.arrayBuffer());
  const response = await app.inject({
    method: request.method,
    url: `${url.pathname}${url.search}`,
    headers: Object.fromEntries(request.headers.entries()),
    payload,
  });

  return new Response(response.body, {
    status: response.statusCode,
    headers: toHeaders(response.headers),
  });
};

export const config = {
  path: "/api/*",
};
