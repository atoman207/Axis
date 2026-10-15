/** Demo project videos shown on the home page after Works. */
export const HOME_PROJECTS = [
  { id: "aiVideo", src: "/Pictures/ai-video-prompt.mp4" },
  { id: "luckyCoins", src: "/Pictures/luckycoins.mp4" },
  { id: "package7", src: "/Pictures/package7.mp4" },
  { id: "package8", src: "/Pictures/package8.mp4" },
  { id: "package9", src: "/Pictures/package9.mp4" },
  { id: "package10", src: "/Pictures/package10.mp4" },
  { id: "package11", src: "/Pictures/package11.mp4" },
] as const;

export type HomeProjectId = (typeof HOME_PROJECTS)[number]["id"];
