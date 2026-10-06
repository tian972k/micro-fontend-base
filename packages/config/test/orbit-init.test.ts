import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { MFE_APPS } from "../src/constants/apps";
import {
  removeFromCi,
  removeFromCompose,
  removeFromNav,
  removeFromRegistry,
  removeFromScriptsConfig,
  removeFromTurbo,
} from "../../../scripts/lib/orbit-transforms.mjs";

// `pnpm orbit:init --keep ...` removes MFEs from the real repo files. These
// tests run every removal against the current files, so changing CI,
// compose or the registry can't silently break project initialisation.
const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf-8");

type Job = { needs?: string | string[]; if?: string };

describe.each(MFE_APPS.map((app) => [app.id, app] as const))(
  "orbit:init removing %s",
  (id, app) => {
    it("leaves a valid CI workflow without the app", () => {
      const ci = removeFromCi(read(".github/workflows/ci-cd.yml"), id);
      const doc = parse(ci) as { jobs: Record<string, Job> };
      const jobs = Object.keys(doc.jobs);

      expect(jobs).not.toContain(`build-${id}`);
      expect(jobs).not.toContain(`deploy-${id}`);
      for (const job of Object.values(doc.jobs)) {
        const needs = [job.needs ?? []].flat();
        for (const n of needs) expect(jobs).toContain(n);
        // no condition chain may end with a dangling "||"
        if (typeof job.if === "string") {
          expect(job.if.trimEnd()).not.toMatch(/\|\|$/);
        }
      }
      expect(ci).not.toContain(`${id.replace(/-/g, "_")}_changed`);
    });

    it("leaves valid compose / turbo / registry files", () => {
      const compose = parse(removeFromCompose(read("docker-compose.yml"), id));
      expect(Object.keys(compose.services)).not.toContain(id);
      expect(JSON.stringify(compose)).not.toContain(`- ${id}`);

      const turbo = JSON.parse(
        removeFromTurbo(read("turbo.json"), { name: id, slug: app.slug }),
      );
      expect(turbo.globalEnv).not.toContain(
        `VITE_APP_${app.slug.toUpperCase()}_HOST`,
      );

      const registry = removeFromRegistry(
        read("packages/config/src/constants/apps.ts"),
        id,
      );
      expect(registry).not.toContain(`id: "${id}"`);
      expect(registry.match(/id: "app-/g)?.length ?? 0).toBe(
        MFE_APPS.length - 1,
      );

      const scripts = removeFromScriptsConfig(
        read("scripts/mfe.config.mjs"),
        id,
      );
      expect(scripts).not.toContain(`name: '${id}'`);

      const nav = removeFromNav(
        read("apps/shell/app/components/layout/sidebar/nav-config.ts"),
        id,
      );
      expect(nav).not.toContain(`"${id}":`);
    });
  },
);
