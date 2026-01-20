import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@repo/ui/globals.css";

// Standalone mode: mount when running independently (not as MFE)
// Auto-mount if there's a #root element (dev/preview mode)
const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App name="app-a" />
    </React.StrictMode>,
  );
}
