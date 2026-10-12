import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local is optional when env vars are already set
  }
}

async function main() {
  loadEnvFile();

  const connectionString = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "Missing SUPABASE_DB_URL or DATABASE_URL.\n" +
        "Add your Supabase Postgres connection string to .env.local, then rerun:\n" +
        "  npm run setup:db\n\n" +
        "You can copy it from Supabase Dashboard → Project Settings → Database → Connection string (URI)."
    );
    process.exit(1);
  }

  const schemaPath = resolve(process.cwd(), "supabase", "schema.sql");
  const sql = readFileSync(schemaPath, "utf8");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log("Database schema applied successfully.");
  } catch (error) {
    console.error("Failed to apply schema:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

void main();
