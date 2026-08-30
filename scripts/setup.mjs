import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const target = resolve(projectRoot, ".env");
const example = resolve(projectRoot, ".env.example");

if (existsSync(target)) {
  console.log("Environment file already exists: .env (kept unchanged)");
  process.exit(0);
}

const secret = () => randomBytes(32).toString("hex");
const content = readFileSync(example, "utf8")
  .replace("change-me-to-a-random-secret-with-at-least-32-bytes", secret())
  .replace("change-me-to-another-random-secret-with-at-least-32-bytes", secret());

writeFileSync(target, content, "utf8");
console.log("Created .env with memory demo mode and local random secrets.");
console.log("Run `npm run dev`, then open http://localhost:3000.");
