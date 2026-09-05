import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const architectureBoundaries = {
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "import/no-restricted-paths": [
      "error",
      {
        basePath: process.cwd(),
        zones: [
          {
            target: "./src/shared",
            from: "./src/features",
            message: "Shared code cannot depend on a feature.",
          },
          {
            target: "./src/shared",
            from: "./src/server",
            message: "Shared code cannot depend on server infrastructure.",
          },
          {
            target: "./src/features",
            from: "./src/server",
            message: "Feature code cannot import server infrastructure.",
          },
          {
            target: ["./src/features", "./src/server", "./src/shared"],
            from: "./src/app",
            message: "Application modules cannot depend on route adapters.",
          },
          {
            target: ["./src/app", "./src/features", "./src/shared"],
            from: "./src/server/database",
            message:
              "Generated database types and clients are private to server infrastructure.",
          },
        ],
      },
    ],
  },
};

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  architectureBoundaries,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "temp_handoff/**",
    // Playwright writes these on every browser run; they are generated
    // artifacts, not source, and linting them breaks `npm run check`.
    "playwright-report/**",
    "test-results/**",
  ]),
]);
