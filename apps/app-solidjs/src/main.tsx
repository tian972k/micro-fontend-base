import { render } from "solid-js/web";
import App from "./App";
import "./index.css";

// Standalone mode: mount when running independently (not as MFE)
const isStandalone = import.meta.env.VITE_STANDALONE === "true";
const root = document.getElementById("root");

if (isStandalone || root) {
  if (root) {
    render(() => <App name="app-solidjs" />, root);
  }
}
