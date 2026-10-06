/**
 * Pure text transforms used by orbit-init.mjs to remove a micro-frontend
 * from every file that wires it. Kept separate so they can be unit-tested
 * against the real repository files (packages/config/test/orbit-init.test.ts).
 */

/** "app-react" -> "app_react" (CI output / filter keys). */
export const ciKey = (id) => id.replace(/-/g, "_");

/** "app-react" -> "REACT" (APP_IDS key, secret suffix). */
export const upperName = (id) =>
  id.replace(/^app-/, "").replace(/-/g, "_").toUpperCase();

/** Removes `{ ... id: "<id>" ... }` from MFE_APPS in apps.ts. */
export function removeFromRegistry(source, id) {
  return source.replace(
    new RegExp(`\\n  \\{\\n    id: "${id}",[\\s\\S]*?\\n  \\},`),
    "",
  );
}

/** Removes `{ name: '<id>', ... }` from scripts/mfe.config.mjs. */
export function removeFromScriptsConfig(source, id) {
  return source.replace(
    new RegExp(`\\n  \\{\\n    name: '${id}',[\\s\\S]*?\\n  \\},`),
    "",
  );
}

/**
 * Removes an app from .github/workflows/ci-cd.yml: its build/deploy jobs,
 * change-detection outputs and filters, secret checks, `needs` entries and
 * conditions - then repairs any `||` chain left dangling.
 */
export function removeFromCi(source, id) {
  const key = ciKey(id);
  const upper = upperName(id);
  const lines = source.split("\n");
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Whole job blocks: "  build-app-x:" / "  deploy-app-x:" until the next job.
    if (line === `  build-${id}:` || line === `  deploy-${id}:`) {
      while (i + 1 < lines.length && !/^ {2}\S/.test(lines[i + 1])) i++;
      // drop the blank line that separated it from the next job
      if (out.length && out[out.length - 1].trim() === "") out.pop();
      continue;
    }

    // paths-filter entry: "app_x:" followed by "- 'apps/app-x/**'"
    if (line.trim() === `${key}:` && lines[i + 1]?.includes(`apps/${id}/**`)) {
      i++;
      continue;
    }

    const references = [
      `- build-${id}`,
      `- deploy-${id}`,
      `${key}_changed`,
      `has_project_id_${key}`,
      `${key}_id_set`,
      `outputs.${key} `,
      `outputs.${key}}`,
      `APP_${upper}_ID`,
      `VERCEL_PROJECT_ID_${upper}`,
    ];
    if (references.some((ref) => line.includes(ref))) continue;

    out.push(line);
  }

  // `needs: [a, build-app-x]` style lists.
  let text = out
    .join("\n")
    .replace(new RegExp(`,\\s*(build|deploy)-${id}(?=[\\],])`, "g"), "")
    .replace(new RegExp(`(build|deploy)-${id},\\s*`, "g"), "");

  // A removed condition may leave "... ||" as the last line of an if-block.
  const fixed = text.split("\n");
  for (let i = 0; i < fixed.length; i++) {
    if (!fixed[i].trimEnd().endsWith("||")) continue;
    const indent = fixed[i].match(/^ */)[0].length;
    const next = fixed[i + 1] ?? "";
    const nextIndent = next.match(/^ */)[0].length;
    if (next.trim() === "" || nextIndent < indent || /^\s*\)/.test(next)) {
      fixed[i] = fixed[i].replace(/\s*\|\|\s*$/, "");
    }
  }
  return fixed.join("\n");
}

/** Removes the compose service and the shell's depends_on entry. */
export function removeFromCompose(source, id) {
  const lines = source.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === `  ${id}:`) {
      while (
        i + 1 < lines.length &&
        !/^ {2}\S/.test(lines[i + 1]) &&
        !/^\S/.test(lines[i + 1])
      )
        i++;
      if (out.length && out[out.length - 1].trim() === "") out.pop();
      continue;
    }
    if (lines[i].trim() === `- ${id}`) continue;
    out.push(lines[i]);
  }
  return out.join("\n");
}

export function removeFromTurbo(source, app) {
  const json = JSON.parse(source);
  const drop = new Set([
    `VITE_APP_${app.slug.toUpperCase()}_HOST`,
    `APP_${upperName(app.name)}_PORT`,
  ]);
  json.globalEnv = (json.globalEnv ?? []).filter((v) => !drop.has(v));
  return JSON.stringify(json, null, 2) + "\n";
}

export function removeFromNav(source, id) {
  let text = source.replace(new RegExp(`\\n  "${id}": (\\w+),`), "");
  // Drop icon imports that are no longer referenced.
  const importMatch = text.match(
    /import \{([^}]*)\} from "@phosphor-icons\/react";/,
  );
  if (importMatch) {
    const names = importMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const body = text.replace(importMatch[0], "");
    const keep = names.filter(
      (n) => n.startsWith("type ") || new RegExp(`\\b${n}\\b`).test(body),
    );
    text = text.replace(
      importMatch[0],
      `import {\n  ${keep.join(",\n  ")},\n} from "@phosphor-icons/react";`,
    );
  }
  return text;
}
