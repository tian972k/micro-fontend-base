import type { Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: "requiredFirst",
    },
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#0F172A",
        },
        {
          name: "light",
          value: "#F8FAFC",
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile (iPhone 14)",
          styles: { width: "390px", height: "844px" },
        },
        tablet: {
          name: "Tablet (iPad Pro)",
          styles: { width: "1024px", height: "1366px" },
        },
        desktop: {
          name: "Desktop (1440p)",
          styles: { width: "1440px", height: "900px" },
        },
      },
      defaultViewport: "responsive",
    },
    layout: "centered",
  },
};

export default preview;
