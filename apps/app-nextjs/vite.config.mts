import react from "@vitejs/plugin-react";
import { createMfeConfig, reactShared, APP_IDS } from "@repo/config/vite";

// Next.js MFE uses special config:
// - Output to public/ (not dist/)  
// - publicDir: false to avoid conflicts
// - No main entry (Next.js handles that separately)

export default createMfeConfig({
  appId: APP_IDS.NEXTJS,
  frameworkPlugin: react(),
  federationShared: reactShared,
  entryFile: "./src/entry-mfe.tsx",
  mainFile: "./src/entry-mfe.tsx", // No separate main for Next.js
  skipDevEntryRedirect: true, // Next.js doesn't need this
  skipHtmlInput: true, // Next.js doesn't have index.html
  outDir: "public", // Output to public for Next.js to serve
  publicDir: false, // Disable publicDir to avoid conflict
  emptyOutDir: false, // Don't delete other public assets
  additionalInputs: {
    "entry-mfe": "./src/entry-mfe.tsx", // Only build MFE entry
  },
  define: {
    "process.env": {}, // Polyfill process.env for Next.js compat
  },
    return process.env.VERCEL === "1" ? "/" : "/";
  },
});
