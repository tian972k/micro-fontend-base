#!/usr/bin/env node
/**
 * One entry point for every scaffold in the repo.
 *
 *   pnpm g ui <name> [--fw react,vue,svelte,solid|all] [--no-story]
 *       Design-system component in packages/ui (+ story, export registered).
 *
 *   pnpm g component <app> <name>
 *       Component inside an app, in that app's framework.
 *
 *   pnpm g feature <app> <name>
 *       Feature folder inside an app (component + index barrel).
 *
 *   pnpm g page <route> [--public]
 *       Shell route, e.g. `pnpm g page dashboard/reports`.
 *
 *   pnpm g mfe <name> <react|vue|svelte|solidjs>
 *       New micro-frontend (same as `pnpm mfe:add`).
 *
 *   pnpm g project --name <name> [--keep react,vue] ...
 *       Turn this checkout into a new project (same as `pnpm orbit:init`).
 *
 * Common flags: --dry-run (print what would be written), --force (overwrite).
 * `<app>` is an app id (app-react), its short name (react) or `shell`.
 */

import { spawnSync } from "child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      out._.push(arg);
      continue;
    }
    const [key, inline] = arg.slice(2).split("=");
    if (inline !== undefined) out[key] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith("--")) out[key] = argv[++i];
    else out[key] = true;
  }
  return out;
}

export const toKebabCase = (str) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

export const toPascalCase = (str) =>
  toKebabCase(str)
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

export const toTitle = (str) =>
  toKebabCase(str)
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function run(script, args) {
  const result = spawnSync(process.execPath, [join(ROOT, script), ...args], {
    stdio: "inherit",
    cwd: ROOT,
  });
  process.exit(result.status ?? 1);
}

/** Framework of an app, read from what it actually depends on. */
function detectFramework(appDir) {
  const manifest = JSON.parse(
    readFileSync(join(appDir, "package.json"), "utf-8"),
  );
  const deps = { ...manifest.dependencies, ...manifest.devDependencies };
  if (deps.vue) return "vue";
  if (deps.svelte) return "svelte";
  if (deps["solid-js"]) return "solid";
  if (deps.react) return "react";
  return null;
}

function resolveApp(name) {
  const appsDir = join(ROOT, "apps");
  const apps = readdirSync(appsDir).filter((entry) =>
    existsSync(join(appsDir, entry, "package.json")),
  );
  const id = apps.find((app) => app === name || app === `app-${name}`);
  if (!id) fail(`Unknown app "${name}". Available: ${apps.join(", ")}`);

  const dir = join(appsDir, id);
  const framework = detectFramework(dir);
  if (!framework) fail(`Could not detect the framework of ${id}.`);
  // The shell (Remix) keeps its code in app/, MFEs in src/.
  const srcDir = existsSync(join(dir, "app"))
    ? join(dir, "app")
    : join(dir, "src");
  return { id, dir, srcDir, framework };
}

function writeFiles(files, { dryRun, force }) {
  const existing = files.filter(({ path }) => existsSync(path));
  if (existing.length > 0 && !force) {
    fail(
      `Already exists: ${existing.map(({ path }) => relative(ROOT, path)).join(", ")} (use --force to overwrite)`,
    );
  }
  for (const { path, content } of files) {
    if (!dryRun) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    }
    console.log(
      `  ${dryRun ? "would create" : "created"} ${relative(ROOT, path)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const componentTemplates = {
  react: ({ pascal, kebab }) => ({
    file: `${kebab}.tsx`,
    exportLine: `export * from "./${kebab}";`,
    content: `import type { HTMLAttributes } from "react";

export interface ${pascal}Props extends HTMLAttributes<HTMLDivElement> {}

export function ${pascal}({ children, ...props }: ${pascal}Props) {
  return (
    <div data-component="${kebab}" {...props}>
      {children}
    </div>
  );
}
`,
  }),
  solid: ({ pascal, kebab }) => ({
    file: `${kebab}.tsx`,
    exportLine: `export * from "./${kebab}";`,
    content: `import { splitProps, type JSX } from "solid-js";

export interface ${pascal}Props extends JSX.HTMLAttributes<HTMLDivElement> {}

export function ${pascal}(props: ${pascal}Props) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <div data-component="${kebab}" {...rest}>
      {local.children}
    </div>
  );
}
`,
  }),
  vue: ({ pascal, kebab }) => ({
    file: `${pascal}.vue`,
    exportLine: `export { default as ${pascal} } from "./${pascal}.vue";`,
    content: `<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<template>
  <div data-component="${kebab}">
    <slot>{{ title }}</slot>
  </div>
</template>
`,
  }),
  svelte: ({ pascal, kebab }) => ({
    file: `${pascal}.svelte`,
    exportLine: `export { default as ${pascal} } from "./${pascal}.svelte";`,
    content: `<script lang="ts">
  export let title = "";
</script>

<div data-component="${kebab}">
  <slot>{title}</slot>
</div>
`,
  }),
};

const featureTemplates = {
  react: ({ pascal, kebab, title }) => ({
    file: `${kebab}-feature.tsx`,
    exportLine: `export * from "./${kebab}-feature";`,
    content: `import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/react";

export function ${pascal}Feature() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>${title}</CardTitle>
        <CardDescription>Describe what this feature does.</CardDescription>
      </CardHeader>
      <CardContent>{/* feature content */}</CardContent>
    </Card>
  );
}
`,
  }),
  solid: ({ pascal, kebab, title }) => ({
    file: `${kebab}-feature.tsx`,
    exportLine: `export * from "./${kebab}-feature";`,
    content: `export function ${pascal}Feature() {
  return (
    <section data-feature="${kebab}" class="rounded-lg border p-6">
      <h2 class="text-lg font-semibold">${title}</h2>
      <p class="text-sm text-muted-foreground">
        Describe what this feature does.
      </p>
    </section>
  );
}
`,
  }),
  vue: ({ pascal, title }) => ({
    file: `${pascal}Feature.vue`,
    exportLine: `export { default as ${pascal}Feature } from "./${pascal}Feature.vue";`,
    content: `<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/vue";
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>${title}</CardTitle>
      <CardDescription>Describe what this feature does.</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- feature content -->
    </CardContent>
  </Card>
</template>
`,
  }),
  svelte: ({ pascal, title }) => ({
    file: `${pascal}Feature.svelte`,
    exportLine: `export { default as ${pascal}Feature } from "./${pascal}Feature.svelte";`,
    content: `<script lang="ts">
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@repo/ui/svelte";
</script>

<Card>
  <CardHeader>
    <CardTitle>${title}</CardTitle>
    <CardDescription>Describe what this feature does.</CardDescription>
  </CardHeader>
  <CardContent>
    <!-- feature content -->
  </CardContent>
</Card>
`,
  }),
};

const pageTemplate = ({ pascal, title, isPublic, insideDashboard }) => {
  // Routes under dashboard/ are already protected by the dashboard layout.
  const needsGuard = !isPublic && !insideDashboard;
  return `${
    needsGuard
      ? `import type { LoaderFunctionArgs } from "@remix-run/node";
`
      : ""
  }import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { mergeMeta } from "@/lib/meta";
${
  needsGuard
    ? `import { requireUser } from "@/server/auth.server";
`
    : ""
}
export const meta = mergeMeta(() => [{ title: "${title}" }]);
${
  needsGuard
    ? `
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request);
  return null;
};
`
    : ""
}
export default function ${pascal}Route() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">${title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe this page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>${title}</CardTitle>
          <CardDescription>Replace this card with real content.</CardDescription>
        </CardHeader>
        <CardContent>{/* page content */}</CardContent>
      </Card>
    </div>
  );
}
`;
};

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function generateInApp(kind, args) {
  const [appName, name] = args._;
  if (!appName || !name) {
    fail(
      `Usage: pnpm g ${kind} <app> <name>   e.g. pnpm g ${kind} react order-table`,
    );
  }
  if (!/^[A-Za-z][A-Za-z0-9-_]*$/.test(name)) {
    fail(
      "Name must start with a letter and contain letters, digits or dashes.",
    );
  }

  const app = resolveApp(appName);
  const names = {
    pascal: toPascalCase(name),
    kebab: toKebabCase(name),
    title: toTitle(name),
  };
  const templates = kind === "feature" ? featureTemplates : componentTemplates;
  const template = templates[app.framework](names);
  const folder = kind === "feature" ? "features" : "components";
  const dir = join(app.srcDir, folder, names.kebab);

  console.log(`\n${kind} ${names.pascal} -> ${app.id} (${app.framework})`);
  writeFiles(
    [
      { path: join(dir, template.file), content: template.content },
      { path: join(dir, "index.ts"), content: `${template.exportLine}\n` },
    ],
    args,
  );
  const exported = kind === "feature" ? `${names.pascal}Feature` : names.pascal;
  console.log(
    `\n  import { ${exported} } from "@/${folder}/${names.kebab}";\n`,
  );
}

function generatePage(args) {
  const route = (args._[0] ?? "").replace(/^\/+|\/+$/g, "");
  if (!route || !/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(route)) {
    fail(
      "Usage: pnpm g page <route> [--public]   e.g. pnpm g page dashboard/reports",
    );
  }
  const shell = resolveApp("shell");
  const last = route.split("/").pop();

  console.log(`\npage /${route}`);
  writeFiles(
    [
      {
        path: join(shell.srcDir, "routes", route, "page.tsx"),
        content: pageTemplate({
          pascal: toPascalCase(route.replace(/\//g, "-")),
          title: toTitle(last),
          isPublic: Boolean(args.public),
          insideDashboard: route.startsWith("dashboard/"),
        }),
      },
    ],
    args,
  );
  console.log(
    `\n  Open http://localhost:8000/${route}. To list it in the sidebar, add it to\n  apps/shell/app/components/layout/sidebar/nav-config.ts.\n`,
  );
}

const USAGE = `
Usage: pnpm g <what> [...]

  ui <name> [--fw react,vue,svelte,solid|all] [--no-story]   design-system component
  component <app> <name>                                      component inside an app
  feature <app> <name>                                        feature folder inside an app
  page <route> [--public]                                     shell route (e.g. dashboard/reports)
  mfe <name> <react|vue|svelte|solidjs>                       new micro-frontend
  project --name <name> [--keep react,vue]                    new project from this template

Flags: --dry-run, --force
`;

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  args.dryRun = Boolean(args["dry-run"]);

  switch (command) {
    case "ui":
      return run("packages/ui/cli/generate-component.js", rest);
    case "component":
    case "feature":
      return generateInApp(command, args);
    case "page":
      return generatePage(args);
    case "mfe":
      return run("scripts/add-mfe.mjs", rest);
    case "project":
      return run("scripts/orbit-init.mjs", rest);
    default:
      console.log(USAGE);
      process.exit(
        command && command !== "help" && command !== "--help" ? 1 : 0,
      );
  }
}

main();
