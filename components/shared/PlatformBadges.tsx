import PlatformBadge from "./PlatformBadge";
import { getProductPlatforms, normalizePlatformId } from "@/lib/platforms";

export default function PlatformBadges({
  platform,
  size = 16,
  showLabel = false,
  compactLabels = false,
  className = "",
  badgeClassName = "",
}: {
  platform: string | string[];
  size?: number;
  showLabel?: boolean;
  compactLabels?: boolean;
  className?: string;
  badgeClassName?: string;
}) {
  return (
    <span
      data-platform-tags
      className={`inline-flex min-w-0 flex-wrap items-center gap-2 ${className}`}
    >
      {getProductPlatforms(platform).map((tag) => (
        <PlatformBadge
          key={normalizePlatformId(tag)}
          platform={tag}
          size={size}
          showLabel={showLabel}
          compactLabel={compactLabels}
          className={badgeClassName}
        />
      ))}
    </span>
  );
}
