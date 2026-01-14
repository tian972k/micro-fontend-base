import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Main MFE Entry
export default defineConfig({
    plugins: [
        react(),
        {
            name: "serve-mfe-entry-in-dev",
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === "/assets/entry-mfe.js") {
                        req.url = "/src/entry-mfe.tsx";
                    }
                    next();
                });
            },
        },
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        modulePreload: false,
        target: "esnext",
        minify: false,
        cssCodeSplit: false, // Injects CSS into JS for simple MFE loading
        rollupOptions: {
            input: {
                "entry-mfe": "./src/entry-mfe.tsx", // The micro-app entry
                "main": "./src/main.tsx" // Local dev entry
            },
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
    server: {
        port: 8001,
        cors: true,
        origin: "http://localhost:8001",
    },
    base: "http://localhost:8001", // Ensures assets are loaded from MFE server, not Shell
});
