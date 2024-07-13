import { type Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "node:fs/promises";

export function routes(app: Hono) {
  app.get("/static/*", serveStatic({ root: "../../../client" }));
  app.get("/database", async (c) => {
    return c.body(await fs.readFile("../../../dev.sqlite"));
  });
}
