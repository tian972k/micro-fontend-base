/** @type {import('svelte/compiler').CompileOptions} */
const config = {
  compilerOptions: {
    // Enable run-time checks during development
    dev: process.env.NODE_ENV !== "production",
  },
};

export default config;
