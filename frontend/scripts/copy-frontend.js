#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, "..");
const distDir = path.join(frontendDir, "dist");
const backendPublic = path.resolve(frontendDir, "..", "backend", "public");

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
  }
}

(async () => {
  try {
    if (!(await exists(distDir))) {
      console.error("Frontend build output not found. Run `npm run build` in frontend first.");
      process.exit(1);
    }

    // Remove previous public folder (if any) then copy
    await fs.rm(backendPublic, { recursive: true, force: true });
    await copyRecursive(distDir, backendPublic);
    console.log(`Copied ${distDir} -> ${backendPublic}`);
  } catch (err) {
    console.error("Error copying frontend build:", err);
    process.exit(1);
  }
})();
