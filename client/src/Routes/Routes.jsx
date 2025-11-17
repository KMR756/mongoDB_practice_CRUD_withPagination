import { createBrowserRouter } from "react-router";
import Root from "../layouts/Root";

export const routes = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            {
                index: true,
                element: <div>home</div>
            }
        ]
    }
])