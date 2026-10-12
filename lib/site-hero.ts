const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const FETCH_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
};

const META_IMAGE_KEYS = [
  "og:image",
  "og:image:url",
  "og:image:secure_url",
  "twitter:image",
  "twitter:image:src",
];

const LOW_VALUE_PATTERN =
  /logo|ogp|icon|favicon|apple-touch|sns_|preloader|noscript|default-user|sprite|badge|arrow|button|spacer|blank|pixel|tracking|analytics|avatar|user-image|loading|loader|project_ttl|ttl\.png/i;

const HERO_PATTERN =
  /hero|kv|banner|mainvisual|main_visual|eyecatch|keyvisual|key_visual|mv[_-]|slide|cover|visual|top[_-]|main[_-]?img|feature|campaign|recruit|corporate_banner|carousel|modal_img|special/i;

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function resolveUrl(imageUrl: string, pageUrl: string) {
  try {
    return new URL(decodeHtml(imageUrl.trim()), pageUrl).href;
  } catch {
    return null;
  }
}

function isLikelyImageUrl(url: string) {
  if (!url || url.startsWith("data:")) return false;
  if (/\.(svg|ico|gif)(\?|#|$)/i.test(url)) return false;
  if (/\.(jpg|jpeg|png|webp|avif|bmp)(\?|#|$)/i.test(url)) return true;
  if (HERO_PATTERN.test(url)) return true;
  return !LOW_VALUE_PATTERN.test(url);
}

function scoreImageUrl(url: string) {
  const lower = url.toLowerCase();
  let score = 40;

  if (HERO_PATTERN.test(lower)) score += 50;
  if (/modal_img|corporate_activities|carousel|mainvisual|keyvisual/i.test(lower)) {
    score += 35;
  }
  if (/\b(12\d{2}|13\d{2}|14\d{2}|15\d{2}|16\d{2}|19\d{2}|20\d{2})[_x-](\d{2,4})\b/.test(lower)) {
    score += 35;
  }
  if (/\.(jpg|jpeg|webp|avif)(\?|#|$)/i.test(lower)) score += 15;
  if (/goods_item/i.test(lower)) score -= 15;
  if (LOW_VALUE_PATTERN.test(lower)) score -= 100;
  if (/ogp|img_ogp|_og\.|opengraph/i.test(lower)) score -= 80;

  return score;
}

function uniqueUrls(urls: Array<string | null>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }

  return result;
}

function rankImageUrls(urls: string[]) {
  return [...urls]
    .filter(isLikelyImageUrl)
    .sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a))
    .filter((url) => scoreImageUrl(url) >= 20);
}

function extractMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function extractMetaImages(html: string, pageUrl: string) {
  return META_IMAGE_KEYS.map((key) => {
    const content = extractMetaContent(html, key);
    return content ? resolveUrl(content, pageUrl) : null;
  });
}

function extractLinkImages(html: string, pageUrl: string) {
  const urls: Array<string | null> = [];

  for (const match of html.matchAll(
    /<link[^>]+rel=["']preload["'][^>]+as=["']image["'][^>]+href=["']([^"']+)["'][^>]*>/gi
  )) {
    urls.push(resolveUrl(match[1], pageUrl));
  }

  for (const match of html.matchAll(
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']preload["'][^>]+as=["']image["'][^>]*>/gi
  )) {
    urls.push(resolveUrl(match[1], pageUrl));
  }

  return urls;
}

function extractImgTags(html: string, pageUrl: string) {
  const urls: Array<string | null> = [];
  const attrPatterns = [
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
    /<img[^>]+data-src=["']([^"']+)["'][^>]*>/gi,
    /<img[^>]+data-lazy-src=["']([^"']+)["'][^>]*>/gi,
    /<source[^>]+srcset=["']([^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of attrPatterns) {
    for (const match of html.matchAll(pattern)) {
      const rawValue = match[1];
      const candidate = rawValue.includes(",")
        ? rawValue.split(",").at(-1)?.trim().split(/\s+/)[0]
        : rawValue;
      if (candidate) urls.push(resolveUrl(candidate, pageUrl));
    }
  }

  return urls;
}

function extractBackgroundImages(html: string, pageUrl: string) {
  const urls: Array<string | null> = [];
  const stylePatterns = [
    /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi,
    /backgroundImage\s*:\s*["']url\(([^"')]+)\)["']/gi,
  ];

  for (const pattern of stylePatterns) {
    for (const match of html.matchAll(pattern)) {
      urls.push(resolveUrl(match[1], pageUrl));
    }
  }

  return urls;
}

function extractJsonLdImages(html: string, pageUrl: string) {
  const urls: Array<string | null> = [];

  for (const match of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      const json = JSON.parse(match[1]) as unknown;
      const queue = Array.isArray(json) ? [...json] : [json];

      while (queue.length > 0) {
        const item = queue.shift();
        if (!item || typeof item !== "object") continue;

        for (const value of Object.values(item as Record<string, unknown>)) {
          if (typeof value === "string" && isLikelyImageUrl(value)) {
            urls.push(resolveUrl(value, pageUrl));
          } else if (typeof value === "object" && value) {
            queue.push(value);
          }
        }
      }
    } catch {
      // Ignore invalid JSON-LD blocks.
    }
  }

  return urls;
}

async function fetchPageHtml(pageUrl: string) {
  const response = await fetch(pageUrl, {
    headers: FETCH_HEADERS,
    signal: AbortSignal.timeout(12000),
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;
  return response.text();
}

function extractHtmlImages(html: string, pageUrl: string) {
  return rankImageUrls(
    uniqueUrls([
      ...extractBackgroundImages(html, pageUrl),
      ...extractLinkImages(html, pageUrl),
      ...extractImgTags(html, pageUrl),
      ...extractMetaImages(html, pageUrl),
      ...extractJsonLdImages(html, pageUrl),
    ])
  );
}

export function getWordpressScreenshotUrl(pageUrl: string) {
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(pageUrl)}?w=1200`;
}

export async function resolveMicrolinkScreenshot(pageUrl: string) {
  try {
    const response = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(pageUrl)}&screenshot=true&meta=false`,
      { signal: AbortSignal.timeout(15000), next: { revalidate: 86400 } }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      data?: { screenshot?: { url?: string } };
    };

    return data.data?.screenshot?.url ?? null;
  } catch {
    return null;
  }
}

async function getScreenshotCandidates(pageUrl: string) {
  const microlinkScreenshot = await resolveMicrolinkScreenshot(pageUrl);
  return uniqueUrls([
    microlinkScreenshot,
    getWordpressScreenshotUrl(pageUrl),
  ]);
}

export async function findSiteHeroImages(pageUrl: string) {
  let rankedHtmlImages: string[] = [];

  try {
    const html = await fetchPageHtml(pageUrl);
    if (html) {
      rankedHtmlImages = extractHtmlImages(html, pageUrl);
    }
  } catch {
    // Continue with screenshot fallbacks.
  }

  const strongHtmlImages = rankedHtmlImages.filter((url) => scoreImageUrl(url) >= 45);

  if (strongHtmlImages.length > 0) {
    return uniqueUrls([
      ...strongHtmlImages,
      ...rankedHtmlImages.filter((url) => !strongHtmlImages.includes(url)),
      ...(await getScreenshotCandidates(pageUrl)),
    ]);
  }

  if (rankedHtmlImages.length > 0) {
    return uniqueUrls([...rankedHtmlImages, ...(await getScreenshotCandidates(pageUrl))]);
  }

  return getScreenshotCandidates(pageUrl);
}

export function getProxiedImageUrl(imageUrl: string, pageUrl?: string) {
  if (imageUrl.includes("mshots/v1") || imageUrl.includes("microlink.io")) {
    return imageUrl;
  }

  const params = new URLSearchParams({ url: imageUrl });
  if (pageUrl) params.set("page", pageUrl);

  return `/api/site-image?${params.toString()}`;
}

export function toDisplayCandidates(imageUrls: string[], pageUrl?: string) {
  return imageUrls.map((url) => getProxiedImageUrl(url, pageUrl));
}

/** @deprecated Use findSiteHeroImages instead */
export async function findSiteHeroImage(pageUrl: string) {
  const candidates = await findSiteHeroImages(pageUrl);
  const [primary, ...rest] = candidates;

  return {
    imageUrl: primary ?? null,
    screenshotUrl: rest[0] ?? getWordpressScreenshotUrl(pageUrl),
    candidates,
  };
}

/** @deprecated Use getWordpressScreenshotUrl instead */
export function getSiteHeroScreenshot(url: string) {
  return getWordpressScreenshotUrl(url);
}

export const MIN_PREVIEW_WIDTH = 320;
export const MIN_PREVIEW_HEIGHT = 180;

export function isScreenshotUrl(url: string) {
  return url.includes("mshots/v1") || url.includes("microlink.io");
}
