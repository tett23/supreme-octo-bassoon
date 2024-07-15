import { Hono } from "hono";
import { routes } from "./server/routes/mod.ts";
import { routes as staticRoutes } from "./server/routes/static.ts";

const app = new Hono();

staticRoutes(app);
routes(app);

Deno.serve(app.fetch);
