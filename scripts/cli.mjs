#!/usr/bin/env node

/**
 * 🛠️ UNIFIED PROJECT CLI
 * =====================
 * This script serves as the central hub for all project automation tools.
 */

import readline from "readline";
import { execSync } from "child_process";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
};

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.clear();
  console.log(
    `${colors.cyan}===========================================${colors.reset}`,
  );
  console.log(
    `${colors.cyan}   🚀 MICRO-FRONTEND BASE PLATFORM CLI    ${colors.reset}`,
  );
  console.log(
    `${colors.cyan}===========================================${colors.reset}\n`,
  );

  console.log(`${colors.yellow}Please choose an action:${colors.reset}`);
  console.log(
    `1. ${colors.green}create-app${colors.reset}       Scaffold a new Micro-App`,
  );
  console.log(
    `2. ${colors.green}generate-ui${colors.reset}      Create a new UI Component`,
  );
  console.log(
    `3. ${colors.green}onboard-check${colors.reset}    Verify development environment`,
  );
  console.log(
    `4. ${colors.green}docker-build${colors.reset}     Smart Docker Build (Dry Run)`,
  );
  console.log(
    `5. ${colors.green}docker-exec${colors.reset}      Smart Docker Build (EXECUTE)`,
  );
  console.log(`0. ${colors.red}exit${colors.reset}             Quit CLI\n`);

  const choice = await question(
    `${colors.blue}Selection (0-5): ${colors.reset}`,
  );

  switch (choice) {
    case "1":
      console.log(
        `\n${colors.cyan}Launching App Generator...${colors.reset}\n`,
      );
      execSync("node scripts/create-app.mjs", { stdio: "inherit" });
      break;
    case "2":
      console.log(`\n${colors.cyan}Launching UI Generator...${colors.reset}\n`);
      execSync("node scripts/generate-ui.mjs", { stdio: "inherit" });
      break;
    case "3":
      console.log(
        `\n${colors.cyan}Running Environment Check...${colors.reset}\n`,
      );
      execSync("bash scripts/onboard.sh", { stdio: "inherit" });
      break;
    case "4":
      console.log(
        `\n${colors.cyan}Starting Smart Docker Build (Dry Run)...${colors.reset}\n`,
      );
      execSync("node scripts/smart-docker-build.js", { stdio: "inherit" });
      break;
    case "5":
      console.log(
        `\n${colors.cyan}Starting Smart Docker Build (EXECUTION)...${colors.reset}\n`,
      );
      execSync("EXECUTE=true node scripts/smart-docker-build.js", {
        stdio: "inherit",
      });
      break;
    case "0":
      console.log(`\n${colors.yellow}See you next time! 👋${colors.reset}\n`);
      break;
    default:
      console.log(`\n${colors.red}❌ Invalid choice.${colors.reset}\n`);
  }

  rl.close();
}

main().catch((err) => {
  console.error("\n❌ CLI Error:", err);
  process.exit(1);
});
