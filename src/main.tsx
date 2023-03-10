import React from "react";
import ReactDOM from "react-dom/client";
import appRouter from "./App";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { inject } from "@vercel/analytics";
import NotificationWrapper from "./notify";

inject();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <NotificationWrapper>
            <RouterProvider router={appRouter} />
        </NotificationWrapper>
    </React.StrictMode>
);
