import React, { useEffect, useState } from "react";
// import { atom, useAtom } from "jotai";
import useSWRImmutable from "swr/immutable";
import { SWRConfig } from "swr";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { fetchDB } from "./sharedWorkerPromisify.ts";

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<Root />}></Route>,
//   ),
// );
// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<Root />}>
//       <Route path="dashboard" element={<Root />} />
//       <Route path="about" element={<Root />} />
//     </Route>,
//   ),
// );
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Root />,
//     children: [
//       {
//         path: "dashboard",
//         element: <Root />,
//       },
//       {
//         path: "about",
//         element: <Root />,
//       },
//     ],
//   },
// ]);

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

function App() {
  // const [count, setCount] = useState(0);
  // useEffect(() => {}, []);

  return (
    <div>
      {/* <SWRConfig> */}
      <Root />
      {/* </SWRConfig> */}
      {/* <RouterProvider router={router} /> */}
      {
        /* <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */
      }
    </div>
  );
}

export default App;
