import { type Hono } from "hono";
import { getMimeType } from "hono/utils/mime";
import { join } from "https://deno.land/std@0.224.0/path/join.ts";
// import { serveStatic } from "@hono/node-server/serve-static";
import fs from "node:fs/promises";

export function routes(app: Hono) {
  app.get("/", async (c) => {
    return c.body(
      await fs.readFile(join(Deno.cwd(), "client/dist/index.html")),
    );
  });
  app.get("/database", async (c) => {
    return c.body(
      await fs.readFile(join(Deno.cwd(), "prisma/dev.db")),
    );
  });
  app.get("/schema", async (c) => {
    return c.body(
      await fs.readFile(join(Deno.cwd(), "prisma/schema.prisma")),
    );
  });
  app.get("/*", async (c) => {
    console.log(c.req.path);
    const body = await fs.readFile(join(Deno.cwd(), "client/dist/", c.req.path))
      .catch(Error);
    if (body instanceof Error) {
      return c.body("Not found", 404);
    }

    return c.body(body, 200, {
      "Content-Type": getMimeType(c.req.path) ?? "text/plain",
    });
  });
}
