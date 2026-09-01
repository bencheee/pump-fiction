import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const inventories = [
  {
    manifest: "public/assets/fonts/font-manifest.json",
    directory: "public/assets/fonts",
    expectedCount: 8,
    listKey: "files",
  },
  {
    manifest: "public/assets/icons/icon-manifest.json",
    directory: "public/assets/icons",
    expectedCount: 38,
    listKey: "assets",
  },
];

for (const inventory of inventories) {
  const manifestPath = path.join(repositoryRoot, inventory.manifest);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const assets = manifest[inventory.listKey];

  if (!Array.isArray(assets) || assets.length !== inventory.expectedCount) {
    throw new Error(
      `${inventory.manifest}: expected ${inventory.expectedCount} assets`,
    );
  }

  for (const asset of assets) {
    const assetPath = path.join(
      repositoryRoot,
      inventory.directory,
      asset.filename,
    );
    const checksum = createHash("sha256")
      .update(await readFile(assetPath))
      .digest("hex");

    if (checksum !== asset.sha256) {
      throw new Error(
        `${assetPath}: checksum does not match the frozen manifest`,
      );
    }
  }

  console.log(`${inventory.manifest}: ${assets.length} checksums passed`);
}

for (const licensePath of [
  "public/assets/fonts/OFL-1.1.txt",
  "public/assets/icons/LICENSE-lucide.txt",
]) {
  const license = await stat(path.join(repositoryRoot, licensePath));
  if (license.size === 0)
    throw new Error(`${licensePath}: license file is empty`);
  console.log(`${licensePath}: present`);
}
