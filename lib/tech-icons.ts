/** Icon CDN helpers shared by the service cards, tech stack and architecture diagram. */

export function devicon(path: string) {
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}`;
}

export function simpleIcon(slug: string, hex?: string) {
  return `https://cdn.simpleicons.org/${slug}${hex ? `/${hex}` : ""}`;
}

export function lucide(name: string) {
  return `https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/${name}.svg`;
}

export type TechItem = {
  name: string;
  src?: string;
  /** OpenAI's mark ships colorless from third-party CDNs, so it is drawn inline instead. */
  isOpenAI?: boolean;
  /** Wordmark logos that need a wider box. */
  wide?: boolean;
};
