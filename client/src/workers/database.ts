import sqlite3InitModule, { type Database } from "@sqlite.org/sqlite-wasm";

async function* databaseGenerator(): AsyncGenerator<
  import("file:///Users/tett23/Library/Caches/deno/npm/registry.npmjs.org/@sqlite.org/sqlite-wasm/3.46.0-build2/index").Database,
  void,
  unknown
> {
  const sqlite3 = await sqlite3InitModule();
  const arrayBuffer = await (await fetch("/database")).arrayBuffer();
  const db = new sqlite3.oo1.DB();
  const deserializeFlags = sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE |
    sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE;
  const p = sqlite3.wasm.allocFromTypedArray(arrayBuffer);
  const rc = sqlite3.capi.sqlite3_deserialize(
    db.pointer as number,
    "main",
    p,
    arrayBuffer.byteLength,
    arrayBuffer.byteLength,
    deserializeFlags,
  );
  db.checkRc(rc);

  console.log(db);
  db.exec({
    sql: `
      INSERT INTO Page (
        id,
        slug,
        title,
        content,
        updatedAt
      )
      VALUES (
        $id,
        $slug,
        $title,
        $content,
        $updatedAt
      )
  `,
    bind: {
      "$id": "home",
      "$slug": "home",
      "$title": "Home",
      "$content": "Welcome to the home page.",
      "$updatedAt": new Date().toISOString(),
    },
  });
  console.log(db.exec({ sql: "select * from Page;", rowMode: "array" }));

  while (true) {
    yield db;
  }
}

const databaseInstance = databaseGenerator();
async function database(): Promise<Database> {
  return (await databaseInstance.next()).value;
}

self.addEventListener("connect", async (event) => {
  console.log("Database worker connected");
  const port = (() => {
    if (("ports" in event && Array.isArray(event.ports))) {
      return event.ports[0];
    } else {
      throw new Error("No ports found");
    }
  })();
  const db = await database();

  port.onmessage = async (e) => {
    const { type, payload } = e.data;

    switch (type) {
      case "get":
        port.postMessage({
          type,
          payload: db.exec({ sql: "select * from Page;", rowMode: "array" }),
        });
        break;
      case "set":
        port.postMessage({ type });
        break;
      case "remove":
        port.postMessage({ type });
        break;
      case "clear":
        port.postMessage({ type });
        break;
    }
  };
});

export default {};
