import { type Hono } from "hono";

export function routes(app: Hono) {
  app.get("/", (c) => {
    return c.text("Hello Hono!");
  });
}
