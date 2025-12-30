module.exports = {
  extends: ["./.eslintrc.cjs"],
  rules: {
    "local/no-impure-render": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error"
  }
};