import { Hono } from "hono";
import { Command } from "commander";
import { routes } from "./server/routes/mod.ts";
import { routes as staticRoutes } from "./server/routes/static.ts";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { glob } from "glob";
import { PrismaClient } from "@prisma/client";
import { argv, exit } from "node:process";

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

      const prisma = new PrismaClient();
      await Promise.all(files.map(([slug, content]) => {
        return prisma.page.upsert({
          where: { slug },
          update: { content },
          create: { slug, content },
        });
      }));
      exit(0);
    },
  );

const program = new Command();
program.addCommand(dev);
program.addCommand(build);
program.parse();
