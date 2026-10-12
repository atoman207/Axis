import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createServerClient } from "@/lib/supabase/server";

type LocalStore = {
  votes: string[];
};

// Vercel's serverless filesystem is read-only except for os.tmpdir(), and this
// store only exists as a dev-time fallback when Supabase isn't configured —
// so it must never throw if writes aren't possible.
const LOCAL_STORE_PATH = resolve(tmpdir(), "axis-recommendations.json");
const SUPABASE_TIMEOUT_MS = 2500;
// Baseline shown before any real votes are counted (social-proof starting point).
const BASE_COUNT = 983;

function hashIp(ip: string) {
  const salt = process.env.HIRAI_ADMIN_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "axis";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  return "unknown";
}

function readLocalStore(): LocalStore {
  try {
    if (!existsSync(LOCAL_STORE_PATH)) return { votes: [] };
    const raw = readFileSync(LOCAL_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as LocalStore;
    return { votes: Array.isArray(parsed.votes) ? parsed.votes : [] };
  } catch {
    return { votes: [] };
  }
}

function writeLocalStore(store: LocalStore) {
  try {
    mkdirSync(dirname(LOCAL_STORE_PATH), { recursive: true });
    writeFileSync(LOCAL_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Read-only filesystem or other write failure — the vote still counts
    // for this request, it just won't persist across invocations.
  }
}

function getStateFromLocal(ipHash: string) {
  const store = readLocalStore();
  return {
    count: BASE_COUNT + store.votes.length,
    recommended: store.votes.includes(ipHash),
  };
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Supabase request timed out")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function getStateFromSupabase(ipHash: string) {
  const supabase = createServerClient();

  const [{ count, error: countError }, { data: vote, error: voteError }] = await withTimeout(
    Promise.all([
      supabase.from("site_recommendation_votes").select("*", { count: "exact", head: true }),
      supabase
        .from("site_recommendation_votes")
        .select("ip_hash")
        .eq("ip_hash", ipHash)
        .maybeSingle(),
    ]),
    SUPABASE_TIMEOUT_MS
  );

  if (countError) throw new Error(countError.message);
  if (voteError) throw new Error(voteError.message);

  return {
    count: BASE_COUNT + (count ?? 0),
    recommended: Boolean(vote),
  };
}

async function recommendOnSupabase(ipHash: string) {
  const supabase = createServerClient();

  const { data: existing, error: existingError } = await withTimeout(
    supabase
      .from("site_recommendation_votes")
      .select("ip_hash")
      .eq("ip_hash", ipHash)
      .maybeSingle(),
    SUPABASE_TIMEOUT_MS
  );

  if (existingError) throw new Error(existingError.message);

  if (existing) {
    const state = await getStateFromSupabase(ipHash);
    return { ...state, alreadyRecommended: true as const };
  }

  const { error: insertError } = await withTimeout(
    supabase.from("site_recommendation_votes").insert({ ip_hash: ipHash }),
    SUPABASE_TIMEOUT_MS
  );

  if (insertError) {
    if (insertError.code === "23505") {
      const state = await getStateFromSupabase(ipHash);
      return { ...state, alreadyRecommended: true as const };
    }
    throw new Error(insertError.message);
  }

  const state = await getStateFromSupabase(ipHash);
  return { ...state, alreadyRecommended: false as const };
}

function recommendOnLocal(ipHash: string) {
  const store = readLocalStore();
  if (store.votes.includes(ipHash)) {
    return {
      count: BASE_COUNT + store.votes.length,
      recommended: true,
      alreadyRecommended: true as const,
    };
  }

  store.votes.push(ipHash);
  writeLocalStore(store);
  return {
    count: BASE_COUNT + store.votes.length,
    recommended: true,
    alreadyRecommended: false as const,
  };
}

export async function getRecommendationState(request: Request) {
  const ipHash = hashIp(getClientIp(request));

  try {
    return await getStateFromSupabase(ipHash);
  } catch {
    return getStateFromLocal(ipHash);
  }
}

export async function recommendOnce(request: Request) {
  const ipHash = hashIp(getClientIp(request));

  try {
    return await recommendOnSupabase(ipHash);
  } catch {
    return recommendOnLocal(ipHash);
  }
}
