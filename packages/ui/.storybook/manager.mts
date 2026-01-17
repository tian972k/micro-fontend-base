import { addons } from "storybook/manager-api";
import theme from "./theme.mts";

addons.setConfig({
  theme: theme,
  sidebar: {
    showRoots: false,
    collapsedRoots: [],
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: true },
    copy: { hidden: true },
    fullscreen: { hidden: false },
  },
});
