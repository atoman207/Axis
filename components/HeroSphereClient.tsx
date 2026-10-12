"use client";

import dynamic from "next/dynamic";

const HeroSphere = dynamic(() => import("@/components/HeroSphere"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-40 w-40 animate-pulse rounded-full bg-shu-500/20 ring-1 ring-shu-400/30" />
    </div>
  ),
});

export default function HeroSphereClient() {
  return <HeroSphere />;
}
