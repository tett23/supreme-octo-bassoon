import React, { useEffect, useState } from "react";
// import { atom, useAtom } from "jotai";
import useSWRImmutable from "swr/immutable";
import { SWRConfig } from "swr";
import { fetchDB } from "./sharedWorkerPromisify.ts";
import { Link, Route, Switch } from "wouter";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <div>Hello world!</div>,
//   },
// ]);
// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<Root />}>
//       <Route path="dashboard" element={<Root />} />
//       <Route path="about" element={<Root />} />
//     </Route>,
//   ),
// );
// const router = createBrowserRouter([]);

function Root() {
  const sql = "SELECT * FROM Page";
  const { data, error } = useSWRImmutable(
    sql,
    () =>
      fetchDB<Array<{ slug: string; content: string }>>(
        "SELECT * FROM Page",
      ),
  );
  if (error instanceof Error) {
    throw error;
  }
  if (data == null) {
    return <div>Loading...</div>;
  }

  return <div>{data.map(({ slug }) => <div key={slug}>{slug}</div>)}</div>;
}

function ErrorPage() {
  return <div></div>;
}

export function App() {
  return (
    <>
      <Route path="/">
        <Root></Root>
      </Route>
    </>
  );
}
