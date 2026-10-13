import Image from "next/image";
import { Link } from "@/i18n/routing";
import { HERO_SIDE_BANNERS } from "@/lib/constants/hero";
import type { HeroTab } from "./types";

interface HeroSideBannersProps {
  activeTab: HeroTab;
}

/**
 * Renders the contextual promotional banner beside the main hero slides.
 * Banner selection is tab-driven to keep UX copy/media consistent.
 */
export function HeroSideBanners({ activeTab }: HeroSideBannersProps) {
  const bannerIndex = activeTab === "topup" ? 1 : 0;
  const banner = HERO_SIDE_BANNERS[bannerIndex];

  if (!banner) return null;

  return (
    <div className="h-full w-full">
      <Link
        prefetch={false}
        href={banner.link}
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-black/30 shadow-lg transition-all hover:shadow-2xl"
      >
        <Image
          src={banner.image}
          alt={banner.alt}
          width={255}
          height={226}
          sizes="(min-width: 1920px) 510px, (min-width: 1640px) 417px, (min-width: 1200px) 350px, 300px"
          className="h-full w-full object-cover"
        />
      </Link>
    </div>
  );
}
