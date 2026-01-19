import type { Config } from "tailwindcss";
import { sharedConfig } from "@repo/config/tailwind.config";

export default {
  ...sharedConfig,
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
} satisfies Config;
