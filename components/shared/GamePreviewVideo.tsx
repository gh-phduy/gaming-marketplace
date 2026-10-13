"use client";

import type { useGamePreview } from "@/hooks/useGamePreview";

export default function GamePreviewVideo({
  preview,
}: {
  preview: ReturnType<typeof useGamePreview>;
}) {
  if (!preview.videoSrc) return null;
  return (
    <video
      ref={preview.videoRef}
      src={preview.videoSrc}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${preview.isPlaying ? "opacity-100 delay-100" : "opacity-0 delay-0"}`}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={preview.onPlaying}
      onError={preview.onError}
    />
  );
}
