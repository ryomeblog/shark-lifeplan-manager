module.exports = {
  env: {
    es2021: true,
    node: true,
    "react-native/react-native": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "react-native"],
  rules: {
    // React
    "react/prop-types": "off",
    "react/display-name": "off",
    "react/react-in-jsx-scope": "off",

    // React Native
    "react-native/no-unused-styles": "warn",
    "react-native/split-platform-components": "warn",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
    "react-native/no-raw-text": "off",

    // General
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "prefer-const": "warn",
    "no-var": "error",
    eqeqeq: ["error", "always"],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  globals: {
    __DEV__: true,
  },
};
