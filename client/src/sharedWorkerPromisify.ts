import DatabaseWorker from "./workers/database.ts?sharedworker";

function* dbWorkerGenerator(): Generator<SharedWorker> {
  const databaseWorker: SharedWorker = DatabaseWorker();
  databaseWorker.port.start();

  while (true) {
    yield databaseWorker;
  }
}
const dbWorkerInstance = dbWorkerGenerator();
const db = dbWorkerInstance.next().value;

function* incrementGenerator(): Generator<number> {
  let i = 0;
  while (true) {
    yield i++;
  }
}
const incrementInstance = incrementGenerator();
const PromisePool = new Map<number, { resolve: (value: unknown) => void }>();

export const fetchDB = <T>(sql: string): Promise<T> => {
  const { promise, resolve } = Promise.withResolvers<T>();
  const id = incrementInstance.next().value;
  PromisePool.set(id, { resolve });
  db.port.postMessage({
    type: "select",
    payload: sql,
    id,
  });
  db.port.onmessage = (message: MessageEvent) => {
    const { id: replyId, payload } = message.data;
    console.log(replyId, payload);
    PromisePool.get(replyId)?.resolve(payload);
    PromisePool.delete(replyId);
  };
  db.port.onmessageerror = (e: never) => {
    throw new Error(e);
  };

  return promise;
};
