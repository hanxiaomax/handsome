import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    // Test environment
    environment: "jsdom",

    // Include test files from all tools
    include: [
      "src/tools/*/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "src/tools/*/tests/**/*-tests.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],

    // Global test setup
    globals: true,

    // Coverage reporting
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/tools/**/lib/**"],
      exclude: ["src/tools/**/tests/**", "src/tools/**/docs/**", "**/*.d.ts"],
    },

    // Test timeout
    testTimeout: 10000,

    // Fail fast - stop on first failure
    bail: 1,

    // Reporters
    reporters: ["verbose", "json", "html"],
  },

  // Resolve aliases (same as vite config)
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  // Define global variables for testing
  define: {
    __TEST__: true,
  },
});
