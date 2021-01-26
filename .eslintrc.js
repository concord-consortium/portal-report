module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:cypress/recommended"
  ],
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  overrides: [
    {
      files: [
        "webpack.config.js"
      ],
      globals: {
        __dirname: true,
        process: true
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  rules: {
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
    "@typescript-eslint/no-use-before-define": "off",
    "eol-last": "warn",
    eqeqeq: ["error", "smart"],
    "no-case-declarations": "off",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-trailing-spaces": "warn",
    "no-useless-escape": "off",
    "no-useless-rename": "warn",
    "object-shorthand": ["warn", "always", { "avoidQuotes": true }],
    "react/display-name": "off",
    "react/jsx-no-target-blank": "off",
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    semi: ["error", "always"],
    "cypress/no-unnecessary-waiting": "off"
  },
  settings: {
    react: {
      version: "detect",  // React version. "detect" automatically picks the version you have installed.
                          // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
                          // default to latest and warns if missing
                          // It will default to "detect" in the future
    }
  }
}
