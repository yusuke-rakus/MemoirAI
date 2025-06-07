import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { TooltipProvider } from "./components/ui/tooltip";
import { UserProvider } from "./contexts/LocalUserContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </TooltipProvider>
    </BrowserRouter>
  </React.StrictMode>
);
