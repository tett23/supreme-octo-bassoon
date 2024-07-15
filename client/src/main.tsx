import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import DatabaseWorker from "./workers/database.ts?sharedworker";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

// deno-lint-ignore no-undef
const databaseWorker: SharedWorker = DatabaseWorker();
databaseWorker.port.start();
console.log(databaseWorker);
databaseWorker.port.postMessage({ type: "connect" });
databaseWorker.port.postMessage({ type: "get" });
databaseWorker.port.onmessage = (e) => {
  console.log(e.data);
};

(async () => {
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
})();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
