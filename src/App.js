import React from "react";

import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import NotFoundPageError from "./pages/NotFoundPageError";
import { ROUTES } from "./utils/routes";

const ROOT = [
  {
    path: "/",
    element: (
      <>
        <Outlet />
      </>
    ),
    errorElement: <NotFoundPageError />,
    children: ROUTES,
  },
];

function App() {
  return <RouterProvider router={createBrowserRouter(ROOT)} />;
}

export default App;
