import { describe, expect, it } from "vitest";
import { MFE_APPS, APP_IDS, toFederationName } from "../src/constants/apps";
// Build scripts can't import TypeScript, so they keep a JS copy of the
// registry; this test fails CI if the two drift apart.
import { MFE_APPS as SCRIPT_APPS } from "../../../scripts/mfe.config.mjs";

describe("MFE registry", () => {
  it("scripts/mfe.config.mjs matches MFE_APPS (ids and ports)", () => {
    const fromTs = MFE_APPS.map(({ id, port }) => ({ id, port }));
    const fromScripts = (SCRIPT_APPS as { name: string; port: number }[]).map(
      ({ name, port }) => ({ id: name, port }),
    );
    expect(fromScripts).toEqual(fromTs);
  });

  it("has unique ids, ports and slugs", () => {
    for (const key of ["id", "port", "slug"] as const) {
      const values = MFE_APPS.map((a) => a[key]);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("derives APP_IDS and federation names", () => {
    expect(APP_IDS.REACT).toBe("app-react");
    expect(toFederationName("app-solidjs")).toBe("app_solidjs");
  });
});
