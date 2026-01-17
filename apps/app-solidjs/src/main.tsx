import { render } from "solid-js/web";
import App from "./App";
import "@repo/ui/globals.css";

const root = document.getElementById("root");

if (root) {
  render(() => <App name="app-solidjs" />, root);
}
