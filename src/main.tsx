import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { inject } from "@vercel/analytics";
import NotificationWrapper from "./notify";
import { StoreWrapper } from "./store";

inject();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <StoreWrapper>
            <NotificationWrapper>
                <App />
            </NotificationWrapper>
        </StoreWrapper>
    </React.StrictMode>
);
