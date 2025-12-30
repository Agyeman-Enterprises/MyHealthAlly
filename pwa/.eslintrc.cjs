/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks", "import", "local"],
  settings: { react: { version: "detect" } },
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    // Dev: do not block on warnings
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",

    // Allow map/filter/reduce in JSX. No rule banning it.
    // Our guard exists but is warning-only in dev.
    "local/no-impure-render": "warn",
  },
  overrides: [
    {
      files: ["**/*.cjs", "**/*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
