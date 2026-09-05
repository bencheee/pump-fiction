// Saves the local `public` data to an ignored snapshot file so an
// approval-gated `supabase db reset` no longer costs the Owner their own
// programs, splits, exercises, and workouts. Restore it with
// `npm run db:restore`.

import { spawnSync } from "node:child_process";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  fail,
  latestSnapshotPath,
  repositoryRoot,
  snapshotDirectory,
} from "./local-database.mjs";

const timestamp = new Date()
  .toLocaleString("sv-SE")
  .replace(/[^0-9]/g, "")
  .slice(0, 14);
const snapshotPath = path.join(snapshotDirectory, `local-${timestamp}.sql`);

await mkdir(snapshotDirectory, { recursive: true });

const dump = spawnSync(
  path.join(repositoryRoot, "node_modules", ".bin", "supabase"),
  [
    "db",
    "dump",
    "--local",
    "--data-only",
    "--schema",
    "public",
    "--file",
    snapshotPath,
  ],
  { cwd: repositoryRoot, stdio: "inherit" },
);

if (dump.status !== 0) {
  fail(
    "Snapshot failed. Start the local stack with `npm run db:start` and try again.",
  );
}

await copyFile(snapshotPath, latestSnapshotPath);

process.stdout.write(
  `Saved ${path.relative(repositoryRoot, snapshotPath)} and updated ${path.relative(repositoryRoot, latestSnapshotPath)}.\n`,
);
