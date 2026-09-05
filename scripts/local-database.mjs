import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const snapshotDirectory = path.join(
  repositoryRoot,
  "supabase",
  "snapshots",
);

export const latestSnapshotPath = path.join(snapshotDirectory, "latest.sql");

export async function readProjectId() {
  const config = await readFile(
    path.join(repositoryRoot, "supabase", "config.toml"),
    "utf8",
  );
  const projectId = /^project_id\s*=\s*"([^"]+)"/m.exec(config)?.[1];

  if (!projectId) {
    throw new Error("supabase/config.toml does not declare a project_id.");
  }

  return projectId;
}

export async function readDatabaseContainerName() {
  return `supabase_db_${await readProjectId()}`;
}

export function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
