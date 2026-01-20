#!/usr/bin/env node

/**
 * Get turbo filter arguments for all MFE apps
 * Uses central config from mfe.config.mjs
 * 
 * Usage: node scripts/get-mfe-filters.mjs
 * Output: --filter=app-react --filter=app-vue ...
 */

import { getTurboFilters, getMfeApps } from './mfe.config.mjs';

const mfeApps = getMfeApps();

if (mfeApps.length > 0) {
  console.log(getTurboFilters());
} else {
  console.error('No MFE apps configured');
  process.exit(1);
}
