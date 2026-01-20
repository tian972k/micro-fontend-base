import { createApp } from "vue";
import App from "./App.vue";
import "@repo/ui/globals.css";

// NOTE: Counter sync is handled by counterStore singleton in @repo/core
// which already has EventBus listener built-in. No need for syncStore here.
// Dashboard.vue uses counterStore directly for proper state sync.

// Standalone mode: mount when running independently (not as MFE)
// Auto-mount if there's an #app element (dev/preview mode)
const appElement = document.getElementById("app");

if (appElement) {
  createApp(App).mount("#app");
}
