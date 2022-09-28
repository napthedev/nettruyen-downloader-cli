import globals from "globals";
import { FlatCompat } from "@eslint/eslintrc";
import tsESLintParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";

const compat = new FlatCompat();

export default [
  "eslint:recommended",
  ...compat.plugins("@typescript-eslint"),
  ...compat.extends("plugin:@typescript-eslint/recommended"),
  eslintConfigPrettier,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "simple-import-sort": eslintPluginSimpleImportSort,
    },
    languageOptions: {
      parser: tsESLintParser,
      parserOptions: {
        project: ["tsconfig.json"],
      },
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true },
      ],
      "no-extra-boolean-cast": "off",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
];
