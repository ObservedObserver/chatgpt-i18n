import { useState } from "react";
import { createBrowserRouter } from "react-router-dom";
import LangingPage from "./pages/landing";
import Translate from "./pages/translate";
import Settings from "./pages/setttings";
import NotFound from "./pages/404";

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
        path: "/settings",
        element: <Settings />,
    },
    {
        path: "*",
        element: <NotFound />
    }
]);

export default appRouter;
