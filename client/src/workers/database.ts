import sqlite3InitModule, {
  sqlite3Worker1Promiser,
} from "@sqlite.org/sqlite-wasm";

async function* databaseGenerator() {
  const sqlite3 = sqlite3InitModule();
  const db = sqlite3.oo1.DB("/database");
  while (true) {
    yield db;
  }
}

const databaseInstance = databaseGenerator();
async function db() {
  return (await databaseInstance.next()).value;
}

self.addEventListener("connect", (event) => {
  console.log("Database worker connected");
  const port = (() => {
    if (("ports" in event && Array.isArray(event.ports))) {
      return event.ports[0];
    } else {
      throw new Error("No ports found");
    }
  })();

  port.onmessage = async (e) => {
    const { type, payload } = e.data;

    switch (type) {
      case "get":
        port.postMessage({ type, db: await db() });
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
