// Flat ESLint config (ESLint 9+). See https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
]);
