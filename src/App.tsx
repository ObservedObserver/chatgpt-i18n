import { useState } from "react";
import { createBrowserRouter } from "react-router-dom";
import LangingPage from "./pages/landing";
import Translate from "./pages/translate";
import Setting from "./pages/settting";

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <LangingPage />,
    },
    {
        path: "/translate",
        element: <Translate />,
    },
    {
        path: "/setting",
        element: <Setting />,
    },
]);

export default appRouter;
