import sqlite3InitModule, { type Database } from "@sqlite.org/sqlite-wasm";

async function* databaseGenerator(): AsyncGenerator<Database, void, unknown> {
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

  while (true) {
    yield db;
  }
}

const databaseInstance = databaseGenerator();
async function database(): Promise<Database> {
  return (await databaseInstance.next()).value as Database;
}

self.addEventListener("connect", async (event) => {
  const port = (() => {
    if (("ports" in event && Array.isArray(event.ports))) {
      return event.ports[0];
    } else {
      throw new Error("No ports found");
    }
  })();
  const db = await database();

  port.onmessage = (
    { data: { id, type, payload } }: {
      data: { id: number; type: "select"; payload: Record<string, string> };
    },
  ) => {
    switch (type) {
      case "select": {
        port.postMessage({
          id,
          // payload: JSON.stringify(db.exec({
          //   sql: "select * from Page;",
          //   rowMode: "object",
          //   returnValue: "resultRows",
          // })),
          payload: db.exec({
            sql: "select * from Page;",
            rowMode: "object",
            returnValue: "resultRows",
          }),
        });
        break;
      }
    }
  };
});
