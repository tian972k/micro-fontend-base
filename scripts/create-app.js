const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const APPS_DIR = path.join(__dirname, "../apps");

// Framework Templates based on existing apps
const TEMPLATES = {
  react: { source: "app-a", color: "\x1b[36m" }, // Cyan
  vue: { source: "app-c", color: "\x1b[32m" }, // Green
  svelte: { source: "app-d", color: "\x1b[33m" }, // Yellow
};

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("🚀 Micro-Frontend Generator");
  console.log("===========================");

  // 1. Get App Name
  const appName = await question(
    "📦 App Name (kebab-case, e.g. 'trade-desk'): ",
  );
  if (!appName) {
    console.error("❌ App name is required.");
    process.exit(1);
  }

  // 2. Get Framework
  console.log("\nAvailable Frameworks:");
  console.log("1. React (Default)");
  console.log("2. Vue");
  console.log("3. Svelte");
  const frameworkInput = await question("🛠️  Choose Framework (1-3): ");

  let framework = "react";
  if (frameworkInput.trim() === "2") framework = "vue";
  if (frameworkInput.trim() === "3") framework = "svelte";

  // 3. Get Port
  const port = await question("🔌 Port (e.g. 5005): ");
  if (!port) {
    console.error("❌ Port is required.");
    process.exit(1);
  }

  const targetDir = path.join(APPS_DIR, appName);
  if (fs.existsSync(targetDir)) {
    console.error(`❌ Directory apps/${appName} already exists.`);
    process.exit(1);
  }

  const templateName = TEMPLATES[framework].source;
  const templateDir = path.join(APPS_DIR, templateName);

  console.log(
    `\n📋 Creating ${appName} using ${framework} template (from ${templateName})...`,
  );

  // 4. Copy Template
  execSync(`cp -r ${templateDir} ${targetDir}`);

  // 5. Update package.json
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.name = appName;

  // Explicitly add 'mfe' config for the build system to be safe
  // (Though standard MFEs work without it, this documents intent)
  pkg.mfe = {
    imageName: appName,
    dockerfile: "Dockerfile.mfe",
  };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // 6. Update vite.config.ts (Port & Name)
  const viteConfigPath = path.join(targetDir, "vite.config.ts");
  if (fs.existsSync(viteConfigPath)) {
    let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
    // Replace Port
    viteConfig = viteConfig.replace(/port:\s*\d+/, `port: ${port}`);
    // Replace Federation Name (usually app_a, app_b etc)
    // We replace the template's federation name with the new app name (snake_case)
    const snakeAppName = appName.replace(/-/g, "_");
    const templateSnakeName = templateName.replace(/-/g, "_");
    viteConfig = viteConfig.replace(
      new RegExp(`name:\\s*['"]${templateSnakeName}['"]`),
      `name: "${snakeAppName}"`,
    );

    fs.writeFileSync(viteConfigPath, viteConfig);
  }

  // 7. Update Framework Specific Files
  if (framework === "react") {
    const appTsxPath = path.join(targetDir, "src/App.tsx");
    if (fs.existsSync(appTsxPath)) {
      let content = fs.readFileSync(appTsxPath, "utf-8");
      content = content.replace(/Micro App [A-Z]/g, `Micro App ${appName}`);
      fs.writeFileSync(appTsxPath, content);
    }
  }
  // (Vue/Svelte specific updates could go here if their templates have hardcoded strings)

  // 8. Update entry-mfe (Window assignments if used)
  // Check for both .ts and .tsx
  const possibleEntryPaths = [
    path.join(targetDir, "src/entry-mfe.tsx"),
    path.join(targetDir, "src/entry-mfe.ts"),
  ];

  for (const ep of possibleEntryPaths) {
    if (fs.existsSync(ep)) {
      let content = fs.readFileSync(ep, "utf-8");
      // React uses window.renderAppA, Vue/Svelte might differ
      content = content.replace(new RegExp(templateName, "g"), appName);
      fs.writeFileSync(ep, content);
      break;
    }
  }

  const envVarName = `MFE_${appName.toUpperCase().replace(/-/g, "_")}_URL`;

  console.log("\n✅ App created successfully!");
  console.log("\n👉 Next steps to connect this micro-app:");

  console.log("\n1️⃣  Update Environment Variables");
  console.log(`   Open apps/shell/.env and add:`);
  console.log(`   ${envVarName}="http://localhost:${port}"`);

  console.log("\n2️⃣  Register App Config");
  console.log(`   Open apps/shell/app/server/config.server.ts and add:`);
  console.log(
    `   "${appName}": process.env.${envVarName} || "http://localhost:${port}",`,
  );

  console.log("\n3️⃣  Create Shell Route");
  console.log(
    `   See 'apps/shell/app/routes/' for examples. Copy one and update the 'name' prop.`,
  );

  console.log("\n4️⃣  Run!");
  console.log("   pnpm install && pnpm dev");

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
