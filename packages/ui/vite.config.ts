import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "#variants": resolve(__dirname, "./src/shared/variants"),
      "#shared": resolve(__dirname, "./src/shared"),
      "#components": resolve(__dirname, "./src/components"),
    },
  },
});
