import { create } from "storybook/theming";

export default create({
  base: "dark",

  // Brand colors
  colorPrimary: "#3B82F6", // Blue-500
  colorSecondary: "#8B5CF6", // Purple-500

  // UI colors
  appBg: "#0F172A", // Slate-900
  appContentBg: "#1E293B", // Slate-800
  appPreviewBg: "#1E293B",
  appBorderColor: "#334155", // Slate-700
  appBorderRadius: 8,

  // Typography
  fontBase:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode: '"Fira Code", "Consolas", monospace',

  // Text colors
  textColor: "#F1F5F9", // Slate-100
  textInverseColor: "#0F172A",

  // Toolbar colors
  barTextColor: "#94A3B8", // Slate-400
  barSelectedColor: "#3B82F6",
  barBg: "#1E293B",

  // Form colors
  inputBg: "#0F172A",
  inputBorder: "#334155",
  inputTextColor: "#F1F5F9",
  inputBorderRadius: 6,

  // Branding
  brandTitle: "UI Components",
  brandUrl: "https://github.com/your-repo",
  brandTarget: "_self",
});
