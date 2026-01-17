/**
 * 🚀 SMART DOCKER BUILD SCRIPT
 * ===========================
 *
 * This script leverages Turborepo to detect which micro-frontends have changed
 * and builds Docker images ONLY for those specific apps.
 *
 * HOW TO USE
 * ----------
 * 1. Dry Run (Default): Checks what changed but doesn't build.
 *    $ node scripts/smart-docker-build.js
 *
 * 2. Execute Build: actually runs `docker build`.
 *    $ EXECUTE=true node scripts/smart-docker-build.js
 *
 * 3. Force Build All: Ignores change detection.
 *    $ FORCE_ALL=true EXECUTE=true node scripts/smart-docker-build.js
 *
 * CONFIGURATION (via package.json)
 * --------------------------------
 * Add an "mfe" block to your app's package.json to override defaults:
 *
 * "mfe": {
 *   "dockerfile": "Dockerfile.custom",  // Default: Dockerfile.mfe
 *   "outputDir": "public",              // Default: dist
 *   "imageName": "my-custom-image"      // Default: folder name
 * }
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
};

// 1. Dynamic Discovery & Configuration Reading
function getAllApps() {
  const appsDir = path.join(__dirname, "..", "apps");
  if (!fs.existsSync(appsDir)) return [];

  const folders = fs.readdirSync(appsDir).filter((file) => {
    return fs.statSync(path.join(appsDir, file)).isDirectory();
  });

  return folders.map((appName) => {
    const pkgPath = path.join(appsDir, appName, "package.json");
    let config = {
      dockerfile: "Dockerfile.mfe",
      context: ".",
      args: [`APP_NAME=${appName}`, `BUILD_OUTPUT_DIR=dist`],
    };

    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        // Check for "mfe" config block in package.json
        if (pkg.mfe) {
          const { dockerfile, context, outputDir, imageName } = pkg.mfe;

          config.dockerfile = dockerfile || config.dockerfile;
          config.context = context || config.context;

          // Reconstruct args based on config
          const outDir = outputDir || "dist";
          config.args = [`APP_NAME=${appName}`, `BUILD_OUTPUT_DIR=${outDir}`];

          if (imageName) config.imageName = imageName;
        }
      } catch {
        console.warn(
          `${colors.yellow}Warning: Could not parse package.json for ${appName}${colors.reset}`,
        );
      }
    }

    return { name: appName, ...config };
  });
}

function runCommand(command, options = {}) {
  try {
    return execSync(command, { encoding: "utf8", ...options }).trim();
  } catch (error) {
    if (!options.silent) {
      console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
      console.error(error.stderr);
    }
    throw error;
  }
}

function getChangedPackages(allApps) {
  const forceAll = process.env.FORCE_ALL === "true";
  const appMap = new Map(allApps.map((app) => [app.name, app]));

  if (forceAll) {
    console.log(
      `${colors.yellow}FORCE_ALL is set. Building ALL apps.${colors.reset}`,
    );
    return allApps;
  }

  const commitRange = process.env.COMMIT_RANGE || "HEAD^...HEAD";
  console.log(
    `${colors.blue}Input Commit Range: ${commitRange}${colors.reset}`,
  );

  try {
    const filter = `...[${commitRange}]`;
    console.log(
      `${colors.blue}Analyzing changes with Turbo filter: ${filter}${colors.reset}`,
    );

    const output = runCommand(
      `npx turbo run build --filter="${filter}" --dry-run=json`,
      { silent: true },
    );
    const result = JSON.parse(output);

    if (!result.packages) return [];

    // Map changed package names back to our app config objects
    return result.packages
      .filter((pkgName) => appMap.has(pkgName))
      .map((pkgName) => appMap.get(pkgName));
  } catch {
    console.warn(
      `${colors.yellow}Failed to detect changes via turbo (or no range provided), falling back to building ALL.${colors.reset}`,
    );
    return allApps;
  }
}

function buildDockerImage(appConfig) {
  console.log(
    `${colors.green}🐳 Building Docker image for: ${appConfig.name}${colors.reset}`,
  );

  const tag = process.env.DOCKER_TAG || "latest";
  const org = process.env.DOCKER_ORG || "my-org";

  // Use custom image name from config if provided, otherwise use folder name
  const finalImageName = appConfig.imageName || appConfig.name;
  const fullImageRef = `${org}/${finalImageName}:${tag}`;

  const buildArgs = (appConfig.args || [])
    .map((arg) => `--build-arg ${arg}`)
    .join(" ");
  const cmd = `docker build -t ${fullImageRef} -f ${appConfig.dockerfile} ${buildArgs} ${appConfig.context}`;

  console.log(`   ${colors.blue}Running: ${cmd}${colors.reset}`);

  if (process.env.EXECUTE === "true") {
    runCommand(cmd, { stdio: "inherit" });
  } else {
    console.log(
      `   ${colors.yellow}[Dry Run] Would execute build command.${colors.reset}`,
    );
  }
}

function main() {
  console.log(
    `${colors.green}🚀 Starting Smart Docker Build...${colors.reset}`,
  );

  const allApps = getAllApps();
  console.log(
    `Found app configurations: ${allApps.map((a) => a.name).join(", ")}`,
  );

  const appsToBuild = getChangedPackages(allApps);

  if (appsToBuild.length === 0) {
    console.log(
      `${colors.yellow}No applications changed. Skipping Docker builds.${colors.reset}`,
    );
    return;
  }

  console.log(
    `${colors.green}Build list: ${appsToBuild.map((a) => a.name).join(", ")}${colors.reset}`,
  );

  appsToBuild.forEach((app) => buildDockerImage(app));
}

main();
