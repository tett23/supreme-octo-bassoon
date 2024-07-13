import { Hono } from "hono";
import { routes } from "./routes/mod.ts";

const app = new Hono();

routes(app);

Deno.serve(app.fetch);
