const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const APPS_DIR = path.join(__dirname, "../apps");
const TEMPLATE_DIR = path.join(APPS_DIR, "app-a");

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log("🚀 Micro-Frontend Generator");
    console.log("===========================");

    const appName = await question("📦 App Name (kebab-case, e.g. 'trade-desk'): ");
    if (!appName) {
        console.error("❌ App name is required.");
        process.exit(1);
    }

    const port = await question("🔌 Port (e.g. 5003): ");
    if (!port) {
        console.error("❌ Port is required.");
        process.exit(1);
    }

    const targetDir = path.join(APPS_DIR, appName);

    if (fs.existsSync(targetDir)) {
        console.error(`❌ Directory apps/${appName} already exists.`);
        process.exit(1);
    }

    console.log(`\n📋 Creating ${appName} at apps/${appName}...`);

    // 1. Copy Template
    // Using cp -r for simplicity (mac/linux). node fs.cpSync is available in newer node versions
    execSync(`cp -r ${TEMPLATE_DIR} ${targetDir}`);

    // 2. Update package.json
    const pkgPath = path.join(targetDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.name = appName;
    // Update port in scripts if it exists explicitly or add it
    // App A template uses just "vite", so we might need to specify port in vite config or CLI
    // Let's add it to the separate vite config mostly, but for simplicity let's rely on vite.config.ts update below
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // 3. Update vite.config.ts with new Port
    const viteConfigPath = path.join(targetDir, "vite.config.ts");
    let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
    // Replace port: 5001 with new port
    viteConfig = viteConfig.replace(/port:\s*\d+/, `port: ${port}`);
    fs.writeFileSync(viteConfigPath, viteConfig);

    // 4. Update App.tsx title
    const appTsxPath = path.join(targetDir, "src/App.tsx");
    let appTsx = fs.readFileSync(appTsxPath, "utf-8");
    appTsx = appTsx.replace(/Micro App A/g, `Micro App ${appName}`);
    fs.writeFileSync(appTsxPath, appTsx);

    // 5. Update entry-mfe.tsx window.MFE key
    const entryPath = path.join(targetDir, "src/entry-mfe.tsx");
    let entryContent = fs.readFileSync(entryPath, "utf-8");
    entryContent = entryContent.replace(/\["app-a"\]/, `["${appName}"]`);
    fs.writeFileSync(entryPath, entryContent);

    const envVarName = `MFE_${appName.toUpperCase().replace(/-/g, "_")}_URL`;
    const routeComponentName = appName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') + "Route";

    console.log("\n✅ App created successfully!");
    console.log("\n👉 Next steps to connect this micro-app:");

    console.log("\n1️⃣  Update Environment Variables");
    console.log(`   Open apps/shell/.env and add:`);
    console.log(`   ${envVarName}="http://localhost:${port}"`);

    console.log("\n2️⃣  Register App Config");
    console.log(`   Open apps/shell/app/server/config.server.ts and add to the 'apps' object:`);
    console.log(`   "${appName}": process.env.${envVarName} || "http://localhost:${port}",`);

    console.log("\n3️⃣  Create Shell Route");
    console.log(`   Create file apps/shell/app/routes/${appName}.tsx with this content:`);
    console.log(`
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import MainLayout from "@/components/Layout";
import { MicroFrontendHost } from "@/components/MicroFrontendHost";
import { getAppConfig } from "@/server/config.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const config = getAppConfig();
  return json({ appHost: config.apps["${appName}"] });
}

export default function ${routeComponentName}() {
  const { appHost } = useLoaderData<typeof loader>();
  return (
    <MainLayout>
      <div className="mb-6"><h1 className="text-3xl font-bold">App: ${appName}</h1></div>
      <div className="border rounded-xl p-4 shadow-sm bg-card">
        <MicroFrontendHost name="${appName}" host={appHost} />
      </div>
    </MainLayout>
  );
}
`);

    console.log("4️⃣  Run!");
    console.log("   pnpm install && pnpm dev");

    rl.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
