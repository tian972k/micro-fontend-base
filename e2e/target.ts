import { MFE_APPS } from "../packages/config/src/constants/apps";

/**
 * The MFE the e2e suite mounts: E2E_MFE=<id>, or the first registered app
 * whose dev server serves its federation bundle (Next.js only does after
 * `build:mfe`, so it's skipped by default).
 */
export const E2E_MFE =
  MFE_APPS.find((app) => app.id === process.env.E2E_MFE) ??
  MFE_APPS.find((app) => app.framework !== "nextjs") ??
  MFE_APPS[0];
