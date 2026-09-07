// Dumps the hosted production data to an ignored snapshot file. Supabase Free
// takes no automated backups and no point-in-time recovery, so what this writes
// is the only copy of the Owner's training history that exists off the server.
//
// There is deliberately no restore counterpart. `npm run db:restore` reloads a
// local snapshot into the local container, which is safe because that data is
// disposable. Putting a dump back into production is rare, destructive, and
// worth doing deliberately rather than behind a one-word command.

import { spawnSync } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fail, repositoryRoot, snapshotDirectory } from "./local-database.mjs";

// The dump connects as the database owner, so it needs the password the hosted
// project was created with. An environment variable wins; the ignored deploy
// file is the convenience; otherwise the CLI prompts, which works when a person
// runs this in their own terminal.
async function readDatabasePassword() {
  if (process.env.SUPABASE_DB_PASSWORD) return process.env.SUPABASE_DB_PASSWORD;

  try {
    const file = await readFile(
      path.join(repositoryRoot, ".env.deploy.local"),
      "utf8",
    );
    return /^SUPABASE_DB_PASSWORD=(.*)$/m.exec(file)?.[1].trim() || undefined;
  } catch {
    return undefined;
  }
}

const timestamp = new Date()
  .toLocaleString("sv-SE")
  .replace(/[^0-9]/g, "")
  .slice(0, 14);
const backupPath = path.join(snapshotDirectory, `production-${timestamp}.sql`);

await mkdir(snapshotDirectory, { recursive: true });

const password = await readDatabasePassword();
const dump = spawnSync(
  path.join(repositoryRoot, "node_modules", ".bin", "supabase"),
  [
    "db",
    "dump",
    "--linked",
    "--data-only",
    "--use-copy",
    "--schema",
    "public",
    "--file",
    backupPath,
  ],
  {
    cwd: repositoryRoot,
    stdio: "inherit",
    env: password
      ? { ...process.env, SUPABASE_DB_PASSWORD: password }
      : process.env,
  },
);

if (dump.status !== 0) {
  fail(
    "Backup failed. Check that the project is linked (`npx supabase link --project-ref <ref>`) and that the database password is available.",
  );
}

process.stdout.write(
  `Saved ${path.relative(repositoryRoot, backupPath)}.\n` +
    "This is a data-only dump of the public schema; the schema itself lives in supabase/migrations.\n",
);
