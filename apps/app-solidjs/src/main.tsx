import { render } from "solid-js/web";
import App from "./App";
import "./index.css";

// Standalone mode: mount when running independently (not as MFE)
// Auto-mount if there's a #root element (dev/preview mode)
const root = document.getElementById("root");

if (root) {
  render(() => <App />, root);
}
