/**
 * @repo/core is consumed by every MFE, so it is held to a stricter bar
 * than the apps: no `any` and no raw console calls (use the logger).
 */
module.exports = {
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": "error",
  },
  overrides: [
    {
      // The logger is the one place allowed to talk to the console.
      files: ["src/logger/**"],
      rules: { "no-console": "off" },
    },
    {
      files: ["test/**"],
      rules: { "@typescript-eslint/no-explicit-any": "off" },
    },
  ],
};
