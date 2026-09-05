// Reloads a snapshot taken with `npm run db:snapshot` over the local `public`
// data, so the Owner's own programs, splits, exercises, and workouts survive an
// approval-gated `supabase db reset`. When no snapshot exists the committed
// `supabase/seed.sql` baseline that the reset already applied is the fallback,
// so this script reports that and changes nothing.

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  fail,
  latestSnapshotPath,
  readDatabaseContainerName,
  repositoryRoot,
} from "./local-database.mjs";

const requestedSnapshot = process.argv[2];
const snapshotPath = requestedSnapshot
  ? path.resolve(repositoryRoot, requestedSnapshot)
  : latestSnapshotPath;

let snapshot;

try {
  snapshot = await readFile(snapshotPath, "utf8");
} catch {
  if (requestedSnapshot) {
    fail(`Snapshot not found: ${snapshotPath}`);
  }

  process.stdout.write(
    "No snapshot found. The committed seed baseline applied by the reset stands; nothing to restore.\n",
  );
  process.exit(0);
}

const container = await readDatabaseContainerName();
const running = spawnSync(
  "docker",
  ["ps", "--filter", `name=^${container}$`, "--format", "{{.Names}}"],
  { encoding: "utf8" },
);

if (running.status !== 0 || running.stdout.trim() !== container) {
  fail(
    `The local database container ${container} is not running. Start it with \`npm run db:start\`.`,
  );
}

// Replica mode suppresses every trigger, including the foreign keys the
// programs/splits cycle would otherwise break on and the deferred definition
// constraints, so the dump's row order does not matter and `updated_at` keeps
// its snapshotted value. The dump's trailing `RESET ALL` ends replica mode
// after the last insert.
const restoreSql = `
set session_replication_role = replica;

do $$
declare
  data_tables text;
begin
  select string_agg(format('%I.%I', schemaname, tablename), ', ')
  into data_tables
  from pg_tables
  where schemaname = 'public';

  if data_tables is not null then
    execute 'truncate table ' || data_tables || ' restart identity cascade';
  end if;
end;
$$;

${snapshot}

set session_replication_role = origin;
`;

const restore = spawnSync(
  "docker",
  [
    "exec",
    "-i",
    container,
    "psql",
    "--username",
    "postgres",
    "--dbname",
    "postgres",
    "--quiet",
    "--single-transaction",
    "--set",
    "ON_ERROR_STOP=1",
  ],
  { input: restoreSql, stdio: ["pipe", "inherit", "inherit"] },
);

if (restore.status !== 0) {
  fail("Restore failed; the local data was left unchanged.");
}

process.stdout.write(
  `Restored ${path.relative(repositoryRoot, snapshotPath)} into the local database.\n`,
);
