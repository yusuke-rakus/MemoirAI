import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { App } from "./App";
import { QueryCacheSessionBoundary } from "./components/shared/query/QueryCacheSessionBoundary";
import { TooltipProvider } from "./components/ui/tooltip";
import { UserProvider } from "./contexts/LocalUserContext";
import { queryClient } from "./lib/query/queryClient";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "*",
    element: (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <UserProvider>
            <QueryCacheSessionBoundary>
              <App />
            </QueryCacheSessionBoundary>
          </UserProvider>
        </TooltipProvider>
      </QueryClientProvider>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
