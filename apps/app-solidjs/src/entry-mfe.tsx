import { render } from "solid-js/web";
import App from "./App";
import "./index.css";
import { AppRegistry, createSolidMfeEntry } from "@repo/core/solid";
import { APP_IDS } from "@repo/config";

const {
  mount,
  unmount,
  default: microApp,
} = createSolidMfeEntry({
  appId: APP_IDS.SOLIDJS,
  registry: AppRegistry,
  // SolidJS JSX stays in this file (compiled by vite-plugin-solid)
  renderApp: (container, props) => render(() => <App {...props} />, container),
});

export { mount, unmount };
export default microApp;
