import { FaDesktop, FaXbox, FaPlaystation, FaGlobe } from "react-icons/fa";
import { SiNintendoswitch } from "react-icons/si";
import {
  getPlatformFamily,
  getPlatformLabel,
  normalizePlatformId,
} from "@/lib/platforms";

export default function PlatformBadge({
  platform,
  size = 16,
  showLabel = false,
  className = "",
  compactLabel = false,
}: {
  platform: string;
  size?: number;
  showLabel?: boolean;
  className?: string;
  compactLabel?: boolean;
}) {
  const family = getPlatformFamily(platform);
  const Icon =
    family === "pc"
      ? FaDesktop
      : family === "xbox"
        ? FaXbox
        : family === "playstation"
          ? FaPlaystation
          : family === "nintendo"
            ? SiNintendoswitch
            : FaGlobe;
  const label = getPlatformLabel(platform);
  const compactLabels: Record<string, string> = {
    ps5: "PS5",
    ps4: "PS4",
    "xbox-series-x": "Xbox X/S",
    "xbox-one": "Xbox One",
    "nintendo-switch": "Switch",
  };
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      data-platform={normalizePlatformId(platform)}
      className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}
    >
      <Icon size={size} className="shrink-0" aria-hidden="true" />
      {showLabel && (
        <span className="truncate text-xs">
          {compactLabel
            ? (compactLabels[normalizePlatformId(platform)] ?? label)
            : label}
        </span>
      )}
    </span>
  );
}
