import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./App";
import { TooltipProvider } from "./components/ui/tooltip";
import { UserProvider } from "./contexts/LocalUserContext";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "*",
    element: (
      <TooltipProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </TooltipProvider>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
