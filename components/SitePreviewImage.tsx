"use client";

import { useEffect, useRef, useState } from "react";
import { getSiteName } from "@/lib/portfolio/utils";
import {
  isScreenshotUrl,
  MIN_PREVIEW_HEIGHT,
  MIN_PREVIEW_WIDTH,
} from "@/lib/site-hero";

type Props = {
  url: string;
  categoryLabel: string;
  imageUrl?: string | null;
};

type HeroResponse = {
  candidates: string[];
};

function isMostlyBlankImage(img: HTMLImageElement) {
  try {
    const canvas = document.createElement("canvas");
    const width = Math.min(img.naturalWidth, 120);
    const height = Math.min(img.naturalHeight, 120);

    if (width === 0 || height === 0) return true;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return false;

    context.drawImage(img, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;

    let lightPixels = 0;
    let darkPixels = 0;
    const total = width * height;

    for (let index = 0; index < pixels.length; index += 4) {
      const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
      if (brightness > 235) lightPixels += 1;
      if (brightness < 60) darkPixels += 1;
    }

    const lightRatio = lightPixels / total;
    const darkRatio = darkPixels / total;

    return lightRatio > 0.88 || (lightRatio > 0.75 && darkRatio > 0.04);
  } catch {
    // Cross-origin screenshots cannot be analyzed safely.
    return false;
  }
}

export default function SitePreviewImage({ url, categoryLabel, imageUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const siteName = getSiteName(url);
  const imageSrc = candidates[candidateIndex] ?? "";

  useEffect(() => {
    setCandidates([]);
    setCandidateIndex(0);
    setHasError(false);
    setIsLoading(true);
    retryCountRef.current = 0;

    if (imageUrl) {
      setCandidates([imageUrl]);
      setCandidateIndex(0);
      setIsLoading(false);
    }
  }, [url, imageUrl]);

  useEffect(() => {
    if (imageUrl) return;

    const element = containerRef.current;
    if (!element) return;

    let isCancelled = false;

    const loadHeroImage = async () => {
      try {
        const response = await fetch(`/api/site-hero?url=${encodeURIComponent(url)}`);
        if (!response.ok || isCancelled) return;

        const data = (await response.json()) as HeroResponse;
        if (isCancelled || data.candidates.length === 0) return;

        setCandidates(data.candidates);
        setCandidateIndex(0);
      } catch {
        if (!isCancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadHeroImage();
          observer.disconnect();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(element);

    return () => {
      isCancelled = true;
      observer.disconnect();
    };
  }, [url, imageUrl]);

  const tryNextCandidate = () => {
    const nextIndex = candidateIndex + 1;

    if (nextIndex < candidates.length) {
      setCandidateIndex(nextIndex);
      setIsLoading(true);
      return true;
    }

    setHasError(true);
    setIsLoading(false);
    return false;
  };

  const handleError = () => {
    tryNextCandidate();
  };

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const screenshot = isScreenshotUrl(imageSrc);

    if (
      !imageUrl &&
      !screenshot &&
      (img.naturalWidth < MIN_PREVIEW_WIDTH || img.naturalHeight < MIN_PREVIEW_HEIGHT)
    ) {
      tryNextCandidate();
      return;
    }

    if (screenshot && isMostlyBlankImage(img)) {
      tryNextCandidate();
      return;
    }

    if (screenshot && img.naturalWidth < 400 && retryCountRef.current < 2) {
      retryCountRef.current += 1;
      setIsLoading(true);
      window.setTimeout(() => {
        img.src = `${imageSrc}${imageSrc.includes("?") ? "&" : "?"}retry=${retryCountRef.current}`;
      }, 2500);
      return;
    }

    setIsLoading(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-52 overflow-hidden border-b border-line-soft bg-sunken"
    >
      {!hasError && imageSrc ? (
        <>
          <img
            key={`${url}-${candidateIndex}-${imageSrc}`}
            src={imageSrc}
            alt={`${siteName} site preview`}
            loading="lazy"
            crossOrigin={imageSrc.startsWith("/api/site-image") ? "anonymous" : undefined}
            onLoad={handleLoad}
            onError={handleError}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-line via-sunken to-line" />
          )}
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-sunken to-line px-4 text-center">
          {isLoading && !hasError ? (
            <div className="h-full w-full animate-pulse bg-gradient-to-br from-line via-sunken to-line" />
          ) : (
            <>
              <span className="text-2xl font-bold text-muted">
                {siteName.slice(0, 2).toUpperCase()}
              </span>
              <span className="mt-2 text-xs text-muted">Preview unavailable</span>
            </>
          )}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-3 left-3 rounded-full border border-gold-300 bg-gold-300 px-2.5 py-1 text-[10px] font-semibold text-ai-950 shadow-sm">
        {categoryLabel}
      </div>
    </div>
  );
}
