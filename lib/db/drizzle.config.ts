import { defineConfig } from "drizzle-kit";
import path from "path";
import fs from "fs";

// Auto-load .env from project root if DATABASE_URL isn't already in the environment.
// Replit injects env vars automatically; on a VPS we need this fallback so callers
// can run `pnpm --filter @workspace/db run push-force` without sourcing .env first.
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    for (const raw of fs.readFileSync(envPath, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] === undefined) process.env[key] = val;
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
