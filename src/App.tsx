import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import LangingPage from "./pages/landing";
import Translate from "./pages/translate";
import Settings from "./pages/setttings";
import NotFound from "./pages/404";
import { useGlobalStore } from "./store";

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

export default function (props: { children?: React.ReactNode }) {
    const { commonStore } = useGlobalStore();
    useEffect(() => {
        commonStore.loadConfig();
    }, [])
    return <RouterProvider router={appRouter} />
}

// export default appRouter;
