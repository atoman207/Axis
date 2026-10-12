import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NextResponse } from "next/server";
import pg from "pg";
import { unauthorizedResponse, verifyAdminKey } from "@/lib/admin-auth";

const { Client } = pg;

export async function POST(request: Request) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  const connectionString = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json(
      {
        error:
          "Missing SUPABASE_DB_URL. Add your Postgres connection string from Supabase Dashboard → Database.",
      },
      { status: 500 }
    );
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
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply schema";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.end();
  }
}
