import { createServer } from "node:http";
import { URL } from "node:url";
import { createDataStore } from "./lib/data-store.js";

const PORT = Number(process.env.PORT ?? 4000);
const ALLOWED_METHODS = "GET,POST,PATCH,OPTIONS";

const createCorsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": ALLOWED_METHODS,
  "Access-Control-Allow-Headers": "Content-Type",
});

const sendJson = (res, status, payload) => {
  const body = payload == null ? "" : JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    ...createCorsHeaders(),
  });
  res.end(body);
};

const parseJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    const err = new Error("Invalid JSON body");
    err.status = 400;
    throw err;
  }
};

const matchRoute = (pathname, template) => {
  const pathParts = pathname.split("/").filter(Boolean);
  const templateParts = template.split("/").filter(Boolean);
  if (pathParts.length !== templateParts.length) {
    return null;
  }
  const params = {};
  for (let index = 0; index < templateParts.length; index += 1) {
    const templatePart = templateParts[index];
    const pathPart = pathParts[index];
    if (templatePart.startsWith(":")) {
      params[templatePart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }
    if (templatePart !== pathPart) {
      return null;
    }
  }
  return params;
};

async function bootstrap() {
  const store = await createDataStore();

  const server = createServer(async (req, res) => {
    const method = (req.method ?? "GET").toUpperCase();
    const requestUrl = req.url
      ? new URL(req.url, `http://${req.headers.host ?? `localhost:${PORT}`}`)
      : null;

    if (!requestUrl) {
      sendJson(res, 400, { message: "Invalid request" });
      return;
    }

    if (method === "OPTIONS") {
      res.writeHead(204, createCorsHeaders());
      res.end();
      return;
    }

    const { pathname, searchParams } = requestUrl;

    try {
      if (method === "GET" && pathname === "/api/health") {
        sendJson(res, 200, { status: "ok" });
        return;
      }

      if (method === "GET" && pathname === "/api/summary") {
        const summary = await store.getSummary();
        sendJson(res, 200, summary);
        return;
      }

      if (pathname === "/api/primary-users") {
        if (method === "GET") {
          const includeSubUsers = searchParams.get("includeSubUsers") === "true";
          const users = await store.listPrimaryUsers(includeSubUsers);
          sendJson(res, 200, users);
          return;
        }

        if (method === "POST") {
          const payload = await parseJsonBody(req);
          const created = await store.createPrimaryUser(payload ?? {});
          sendJson(res, 201, created);
          return;
        }

        sendJson(res, 405, { message: "Method not allowed" });
        return;
      }

      const primaryMatch = matchRoute(pathname, "/api/primary-users/:id");
      if (primaryMatch) {
        if (method === "GET") {
          const includeSubUsers = searchParams.get("includeSubUsers") === "true";
          const primary = await store.getPrimaryUser(primaryMatch.id, includeSubUsers);
          if (!primary) {
            sendJson(res, 404, { message: "Primary user not found" });
            return;
          }
          sendJson(res, 200, primary);
          return;
        }

        if (method === "PATCH") {
          const payload = await parseJsonBody(req);
          const updated = await store.updatePrimaryUser(primaryMatch.id, payload ?? {});
          if (!updated) {
            sendJson(res, 404, { message: "Primary user not found" });
            return;
          }
          sendJson(res, 200, updated);
          return;
        }

        sendJson(res, 405, { message: "Method not allowed" });
        return;
      }

      const primarySubRoute = matchRoute(pathname, "/api/primary-users/:id/sub-users");
      if (primarySubRoute) {
        if (method === "GET") {
          const subUsers = await store.listSubUsers(primarySubRoute.id);
          sendJson(res, 200, subUsers);
          return;
        }

        if (method === "POST") {
          const payload = await parseJsonBody(req);
          const created = await store.createSubUser(primarySubRoute.id, payload ?? {});
          sendJson(res, 201, created);
          return;
        }

        sendJson(res, 405, { message: "Method not allowed" });
        return;
      }

      const subMatch = matchRoute(pathname, "/api/sub-users/:id");
      if (subMatch) {
        if (method === "GET") {
          const subUser = await store.getSubUser(subMatch.id);
          if (!subUser) {
            sendJson(res, 404, { message: "Sub user not found" });
            return;
          }
          sendJson(res, 200, subUser);
          return;
        }

        if (method === "PATCH") {
          const payload = await parseJsonBody(req);
          const updated = await store.updateSubUser(subMatch.id, payload ?? {});
          if (!updated) {
            sendJson(res, 404, { message: "Sub user not found" });
            return;
          }
          sendJson(res, 200, updated);
          return;
        }

        sendJson(res, 405, { message: "Method not allowed" });
        return;
      }

      sendJson(res, 404, { message: "Not found" });
    } catch (error) {
      const status = error?.status ?? 500;
      const message = error?.message ?? "Unexpected error";
      if (status >= 500) {
        console.error("Unexpected error while handling request", error);
      }
      sendJson(res, status, { message });
    }
  });

  server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend server", error);
  process.exitCode = 1;
});
