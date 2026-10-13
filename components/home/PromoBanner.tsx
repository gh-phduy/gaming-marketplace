/**
 * AboutSection2 Component
 *
 * Banner section displaying promotional text about game deals
 */

import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * AboutSection2 Component
 *
 * Full-width banner with background image and promotional text
 */
export default function PromoBanner() {
  const t = useTranslations("home");

  return (
    <section
      className="h-[130px] 800:h-[204px] flex items-center justify-center text-center relative w-full"
      aria-label={t("promotionalBanner")}
    >
      {/* Background image */}
      <Image
        src="/about-us-2.webp"
        alt=""
        fill
        sizes="100vw"
        className="z-10 object-cover"
        aria-hidden="true"
        priority={false}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col gap-y-5 text-dm-text-primary p-4">
        <h2 className="text-[16px] 800:text-[32px] font-bold">
          {t("promoTitle")}
        </h2>
        <p className="text-[14px] 800:text-[18px] text-dm-text-muted">
          {t("promoSubtitle1")}
          <br />
          {t("promoSubtitle2")}
        </p>
      </div>
    </section>
  );
}
