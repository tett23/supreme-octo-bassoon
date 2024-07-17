import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import DatabaseWorker from "./workers/database.ts?sharedworker";

// deno-lint-ignore no-undef
const databaseWorker: SharedWorker = DatabaseWorker();
databaseWorker.port.start();
console.log(databaseWorker);
databaseWorker.port.postMessage({ type: "get" });
databaseWorker.port.onmessage = (e) => {
  console.log(e.data);
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
