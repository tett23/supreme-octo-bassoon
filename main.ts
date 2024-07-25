import { Hono } from "hono";
import { Command } from "commander";
import { routes } from "./server/routes/mod.ts";
import { routes as staticRoutes } from "./server/routes/static.ts";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { glob } from "glob";
import { env, exit } from "node:process";
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { cuid } from "https://deno.land/x/cuid/index.js";

const dev = new Command("dev").action(() => {
  const app = new Hono();

  staticRoutes(app);
  routes(app);

  Deno.serve(app.fetch);
});

const build = new Command("build").option("-p, --path", "build path", "./")
  .option(
    "-o, --output",
    "output path",
    "dist",
  ).action(
    async ({ path }) => {
      const items = await glob(join(path, "**", "*.{md,}"));
      const files = await Promise.all(
        items.map(async (item) => [item, await readFile(item, "utf-8")]),
      );

      console.log(
        join(
          "prisma",
          Deno.env.get("dev.db") ?? "",
          env.DATABASE_URL ?? "",
        ),
      );
      const db = new DB(join("prisma", env.DATABASE_URL ?? "dev.db"));

      // const { PrismaClient } = await import("@prisma/client");
      // const prisma = new PrismaClient();
      await Promise.all(files.map(([slug, content]) => {
        return db.query(
          `
          insert into Page (
            id,
            slug,
            content
          ) values (
            ?,
            ?,
            ?
          ) on conflict(slug) do update set content = excluded.content;
        `,
          [cuid(), slug, content],
        );
      }));
      exit(0);
    },
  );

const program = new Command();
program.addCommand(dev);
program.addCommand(build);
program.parse();
