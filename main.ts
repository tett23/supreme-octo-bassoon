import { Hono } from "hono";
import { routes } from "./server/routes/mod.ts";
import { routes as staticRoutes } from "./server/routes/static.ts";

const app = new Hono();

routes(app);
staticRoutes(app);

Deno.serve(app.fetch);
