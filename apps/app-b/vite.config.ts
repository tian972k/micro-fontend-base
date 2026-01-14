import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// This Vite config is SPECIFICALLY for building the MFE bundle
// It ignores Next.js routing and bundles a specific entry point
export default defineConfig({
    plugins: [react()],
    define: {
        "process.env": {}, // Polyfill process.env for Next.js compat
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        modulePreload: false,
        target: "esnext",
        minify: false,
        cssCodeSplit: false,
        outDir: "public", // Output to public for Next.js to serve
        emptyOutDir: false, // Don't delete other public assets
        rollupOptions: {
            input: {
                "entry-mfe": "./src/entry-mfe.tsx",
            },
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
    base: "http://localhost:8002",
});
