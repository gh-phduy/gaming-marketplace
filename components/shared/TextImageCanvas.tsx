"use client";

import { useTranslations } from "next-intl";

interface TextImageProps {
  text: string;
  imageUrl: string;
  size?: string;
  className?: string;
}

export function CanvasTextImage({
  text,
  imageUrl,
  size = "3rem",
  className = "",
}: TextImageProps) {
  const t = useTranslations("home");

  // Determine translation key based on input text (case-insensitive)
  let displayText = text;
  const upperText = text.toUpperCase();
  if (upperText === "POPULAR GAMES") {
    displayText = t("popularGames");
  } else if (upperText === "POPULAR SELLERS") {
    displayText = t("popularSellers");
  } else if (upperText === "UPCOMING GAMES") {
    displayText = t("upcomingGames");
  } else if (upperText === "NEW ON DIFMARK") {
    displayText = t("newOnDifmark");
  } else if (upperText === "WEEKLY CHART") {
    displayText = t("weeklyChart");
  } else if (upperText === "BEST NEW GAMES") {
    displayText = t("bestNewGames");
  } else if (upperText.includes("UNDER")) {
    displayText = t("under100");
  }

  // Reserve the final heading dimensions in the server HTML. CSS paints the
  // same image through the glyphs without a canvas effect or an image onload.
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        flexShrink: 1,
        width: `calc(${size} * ${displayText.length * 0.8})`,
        maxWidth: "100%",
        lineHeight: 1.5,
        font: `bold ${size}/1.5 Arial, sans-serif`,
        textAlign: "center",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "100% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
      }}
    >
      {displayText}
    </span>
  );
}
