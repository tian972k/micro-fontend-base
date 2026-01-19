import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@repo/ui/globals.css";

// Standalone mode: mount when running independently (not as MFE)
const isStandalone = import.meta.env.VITE_STANDALONE === "true";
const rootElement = document.getElementById("root");

if (isStandalone || rootElement) {
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App name="app-a" />
      </React.StrictMode>,
    );
  }
}
