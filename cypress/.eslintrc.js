module.exports = {
  env: {
    jest: true
  },
  globals: {
    context: true,
    cy: true,
    Cypress: true
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "prefer-const": "off"
  }
}
