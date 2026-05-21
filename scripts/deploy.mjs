#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wranglerPath = join(root, "wrangler.toml");

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { cwd: root, stdio: "inherit", ...opts });
}

function ensureKvInToml() {
  let toml = readFileSync(wranglerPath, "utf8");
  if (!toml.includes("REPLACE_WITH_KV_ID")) return;

  console.log("Creating KV namespace...");
  const out = execSync("npx wrangler kv namespace create ALPHA_KV", {
    cwd: root,
    encoding: "utf8",
  });
  const previewOut = execSync("npx wrangler kv namespace create ALPHA_KV --preview", {
    cwd: root,
    encoding: "utf8",
  });
  const id = out.match(/id = "([^"]+)"/)?.[1];
  const previewId = previewOut.match(/id = "([^"]+)"/)?.[1];
  if (!id || !previewId) {
    throw new Error("Failed to parse KV namespace ids from wrangler output");
  }
  toml = toml
    .replace("REPLACE_WITH_KV_ID", id)
    .replace("REPLACE_WITH_PREVIEW_KV_ID", previewId);
  writeFileSync(wranglerPath, toml);
  console.log("Updated wrangler.toml with KV ids");
}

function main() {
  if (!existsSync(join(root, "node_modules"))) {
    run("npm install");
  }
  ensureKvInToml();
  run("npx wrangler pages deploy . --project-name=alpha-calculator --commit-dirty=true");
  console.log("\nDeploy complete.");
  console.log("Set secrets if not done yet:");
  console.log('  npx wrangler pages secret put ADMIN_PASSWORD --project-name=alpha-calculator');
  console.log('  npx wrangler pages secret put SESSION_SECRET --project-name=alpha-calculator');
}

main();
