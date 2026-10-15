import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NextResponse } from "next/server";
import pg from "pg";
import { unauthorizedResponse, verifyAdminKey } from "@/lib/admin-auth";
import {
  createCategory,
  createSite,
  deleteCategory,
  deleteSite,
  seedPortfolioDatabase,
  updateCategory,
  updateSite,
  uploadPortfolioImage,
} from "@/lib/portfolio/db";

type Ctx = { params: Promise<{ path: string[] }> };

const { Client } = pg;

/**
 * Single admin entry point so Hobby plan stays under the 12 serverless-function limit.
 * Existing URLs are preserved: /api/admin/seed, /api/admin/sites/:id, etc.
 */
export async function POST(request: Request, { params }: Ctx) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  const path = (await params).path ?? [];
  const [resource, id] = path;

  try {
    if (resource === "setup-schema" && path.length === 1) {
      return setupSchema();
    }

    if (resource === "seed" && path.length === 1) {
      const data = await seedPortfolioDatabase();
      return NextResponse.json({ ok: true, data });
    }

    if (resource === "upload" && path.length === 1) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing file" }, { status: 400 });
      }
      const publicUrl = await uploadPortfolioImage(file);
      return NextResponse.json({ url: publicUrl });
    }

    if (resource === "categories" && path.length === 1) {
      const body = await request.json();
      const category = await createCategory({
        id: String(body.id ?? "").trim(),
        label: String(body.label ?? "").trim(),
        stacks: Array.isArray(body.stacks) ? body.stacks.map(String) : [],
        group_type: body.group_type === "other" ? "other" : "skill",
        sort_order: Number(body.sort_order ?? 0),
      });
      return NextResponse.json(category);
    }

    if (resource === "sites" && path.length === 1) {
      const body = await request.json();
      const site = await createSite({
        url: String(body.url ?? "").trim(),
        category_id: String(body.category_id ?? "").trim(),
        image_url: body.image_url ? String(body.image_url).trim() : null,
        sort_order: Number(body.sort_order ?? 0),
      });
      return NextResponse.json(site);
    }

    return NextResponse.json({ error: `Unknown admin route: ${path.join("/")}` }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  const path = (await params).path ?? [];
  const [resource, id] = path;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const body = await request.json();

    if (resource === "categories" && path.length === 2) {
      const category = await updateCategory(id, {
        label: body.label !== undefined ? String(body.label).trim() : undefined,
        stacks: Array.isArray(body.stacks) ? body.stacks.map(String) : undefined,
        group_type:
          body.group_type === "other" ? "other" : body.group_type === "skill" ? "skill" : undefined,
        sort_order: body.sort_order !== undefined ? Number(body.sort_order) : undefined,
      });
      return NextResponse.json(category);
    }

    if (resource === "sites" && path.length === 2) {
      const site = await updateSite(id, {
        url: body.url !== undefined ? String(body.url).trim() : undefined,
        category_id:
          body.category_id !== undefined ? String(body.category_id).trim() : undefined,
        image_url:
          body.image_url !== undefined
            ? body.image_url
              ? String(body.image_url).trim()
              : null
            : undefined,
        sort_order: body.sort_order !== undefined ? Number(body.sort_order) : undefined,
      });
      return NextResponse.json(site);
    }

    return NextResponse.json({ error: `Unknown admin route: ${path.join("/")}` }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!verifyAdminKey(request)) return unauthorizedResponse();

  const path = (await params).path ?? [];
  const [resource, id] = path;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    if (resource === "categories" && path.length === 2) {
      await deleteCategory(id);
      return NextResponse.json({ ok: true });
    }

    if (resource === "sites" && path.length === 2) {
      await deleteSite(id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: `Unknown admin route: ${path.join("/")}` }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function setupSchema() {
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
    await client.end().catch(() => undefined);
  }
}
