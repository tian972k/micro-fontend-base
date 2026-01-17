module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:storybook/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],
    "no-undef": "off",
  },
  ignorePatterns: ["node_modules/", "dist/", "build/", "public/"],
};
