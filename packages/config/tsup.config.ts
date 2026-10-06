import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    vite: "src/vite.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  external: [
    "vite",
    "@module-federation/vite",
    "tailwindcss",
    "tailwindcss-animate",
  ],
  // Preserve the directory structure
  outExtension() {
    return {
      js: ".js",
    };
  },
});
