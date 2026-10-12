import { existsSync } from "node:fs";
import { join } from "node:path";
import { createServerClient } from "@/lib/supabase/server";
import { seedPortfolioCategories } from "@/lib/portfolio/seed-data";
import type { PortfolioCategory, PortfolioSite } from "@/lib/portfolio/types";
import { buildPortfolioData } from "@/lib/portfolio/utils";

type DbCategory = {
  id: string;
  label: string;
  stacks: string[];
  group_type: "skill" | "other";
  sort_order: number;
};

type DbSite = {
  id: string;
  url: string;
  image_url: string | null;
  category_id: string;
  sort_order: number;
};

function sortSites(sites: PortfolioSite[]) {
  return [...sites].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.url.localeCompare(b.url, "en", { sensitivity: "base" });
  });
}

function localImageNames(url: string) {
  const host = new URL(url).hostname;
  const bare = host.replace(/^www\./, "");
  const names = [`${host}.png`, `${bare}.png`, `https${host}.png`];
  if (bare === "koholab.jp") names.push("koholab.png");
  return names;
}

/** Prefer screenshots in public/sites, then older files in public/. */
export function getLocalPortfolioImage(url: string) {
  let names: string[];
  try {
    names = localImageNames(url);
  } catch {
    return null;
  }

  for (const name of names) {
    if (existsSync(join(process.cwd(), "public", "sites", name))) {
      return `/sites/${name}`;
    }
  }

  for (const name of names) {
    if (existsSync(join(process.cwd(), "public", name))) {
      return `/${name}`;
    }
  }

  return null;
}

/** The bundled site list, shaped like the database result. */
export function getLocalPortfolio() {
  const categories: PortfolioCategory[] = [...seedPortfolioCategories]
    .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label, "en"))
    .map((category) => ({
      id: category.id,
      label: category.label,
      stacks: category.stacks,
      group_type: category.group_type,
      sort_order: category.sort_order,
      sites: category.sites.map((url, index) => ({
        id: `${category.id}-${index + 1}`,
        url,
        image_url: getLocalPortfolioImage(url),
        category_id: category.id,
        sort_order: index,
      })),
    }));

  return buildPortfolioData(categories);
}

/** The database when Supabase is configured and reachable, otherwise the bundled list. */
export async function getPortfolio() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    return getLocalPortfolio();
  }

  try {
    return await getPortfolioFromDb();
  } catch {
    return getLocalPortfolio();
  }
}

export async function getPortfolioFromDb() {
  const supabase = createServerClient();

  const [{ data: categories, error: categoryError }, { data: sites, error: siteError }] =
    await Promise.all([
      supabase.from("portfolio_categories").select("*").order("sort_order").order("label"),
      supabase.from("portfolio_sites").select("*").order("sort_order").order("url"),
    ]);

  if (categoryError) throw categoryError;
  if (siteError) throw siteError;

  const sitesByCategory = new Map<string, PortfolioSite[]>();

  for (const site of (sites ?? []) as DbSite[]) {
    const bucket = sitesByCategory.get(site.category_id) ?? [];
    bucket.push({
      id: site.id,
      url: site.url,
      image_url: getLocalPortfolioImage(site.url) ?? site.image_url,
      category_id: site.category_id,
      sort_order: site.sort_order,
    });
    sitesByCategory.set(site.category_id, bucket);
  }

  const portfolioCategories: PortfolioCategory[] = ((categories ?? []) as DbCategory[]).map(
    (category) => ({
      id: category.id,
      label: category.label,
      stacks: category.stacks ?? [],
      group_type: category.group_type,
      sort_order: category.sort_order,
      sites: sortSites(sitesByCategory.get(category.id) ?? []),
    })
  );

  return buildPortfolioData(portfolioCategories);
}

export async function seedPortfolioDatabase() {
  const supabase = createServerClient();

  for (const category of seedPortfolioCategories) {
    const { error: categoryError } = await supabase.from("portfolio_categories").upsert({
      id: category.id,
      label: category.label,
      stacks: category.stacks,
      group_type: category.group_type,
      sort_order: category.sort_order,
      updated_at: new Date().toISOString(),
    });

    if (categoryError) throw categoryError;

    for (const [siteIndex, url] of category.sites.entries()) {
      const homepageImage = getLocalPortfolioImage(url);

      const { error: siteError } = await supabase.from("portfolio_sites").upsert(
        {
          url,
          category_id: category.id,
          ...(homepageImage ? { image_url: homepageImage } : {}),
          sort_order: siteIndex,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "url,category_id" }
      );

      if (siteError) throw siteError;
    }
  }

  return getPortfolioFromDb();
}

export async function createCategory(input: {
  id: string;
  label: string;
  stacks: string[];
  group_type: "skill" | "other";
  sort_order?: number;
}) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_categories")
    .insert({
      ...input,
      sort_order: input.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  input: Partial<{
    label: string;
    stacks: string[];
    group_type: "skill" | "other";
    sort_order: number;
  }>
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_categories")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("portfolio_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function createSite(input: {
  url: string;
  category_id: string;
  image_url?: string | null;
  sort_order?: number;
}) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_sites")
    .insert({
      url: input.url,
      category_id: input.category_id,
      image_url: input.image_url ?? null,
      sort_order: input.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateSite(
  id: string,
  input: Partial<{
    url: string;
    category_id: string;
    image_url: string | null;
    sort_order: number;
  }>
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_sites")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSite(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("portfolio_sites").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadPortfolioImage(file: File) {
  const supabase = createServerClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const filePath = `cards/${fileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("portfolio-images")
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("portfolio-images").getPublicUrl(filePath);
  return data.publicUrl;
}
