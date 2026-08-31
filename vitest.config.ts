import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const repositoryRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(repositoryRoot, "src"),
      "server-only": path.join(repositoryRoot, "test/support/server-only.ts"),
    },
  },
  test: {
    environment: "node",
  },
});
