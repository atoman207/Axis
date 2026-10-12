import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
    // optional
  }
}

async function main() {
  loadEnvFile();

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:3000";
  const adminKey = process.env.HIRAI_ADMIN_KEY;
  if (!adminKey) {
    console.error("HIRAI_ADMIN_KEY is not set. Add it to .env.local before seeding.");
    process.exit(1);
  }
  const origin = baseUrl.includes("localhost") ? "http://localhost:3000" : baseUrl;

  console.log("Seeding portfolio via", `${origin}/api/admin/seed`);

  const response = await fetch(`${origin}/api/admin/seed`, {
    method: "POST",
    headers: {
      "x-admin-key": adminKey,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Seed failed:", data.error ?? data);
    process.exit(1);
  }

  const total = data.data?.totalProjectCount ?? 0;
  console.log(`Seed complete: ${total} projects loaded.`);
}

void main();
