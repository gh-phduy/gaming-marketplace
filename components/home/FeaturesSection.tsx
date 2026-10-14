/**
 * AboutSection1 Component
 *
 * Section displaying 3 key features: Buyer Protection, Payment, and Support
 * Features hover effects with dynamic background images
 */

import hoverAb1Image from "@/public/hover-ab-1.webp";
import hoverAb3Image from "@/public/hover-ab-3.webp";
import hoverAb2Image from "@/public/hover-ab-2.webp";
import aboutUs1Image from "@/public/about-us-1.webp";
import Image from "next/image";
import { HiShieldCheck } from "react-icons/hi";
import { FaCreditCard } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
import { useTranslations } from "next-intl";

/* ============================================
   CONSTANTS
   ============================================ */

/** Mask gradient style for fade effect */
const MASK_STYLE = {
  maskImage: `linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)`,
};

/** Radial gradient overlay for center fade effect */
const RADIAL_GRADIENT_STYLE = {
  background: `radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0.15) 100%)`,
  pointerEvents: "none" as const,
};

/* ============================================
   SUB-COMPONENTS
   ============================================ */

interface FeatureCardProps {
  icon: React.ElementType;
  iconSize: number;
  title: string;
  description: string;
  hoverImage: string;
}

/**
 * Individual feature card with hover effect
 */
function FeatureCard({
  icon: Icon,
  iconSize,
  title,
  description,
  hoverImage,
}: FeatureCardProps) {
  return (
    <div className="group relative h-full w-1/3 overflow-hidden rounded-2xl">
      {/* Hover background image */}
      <Image
        src={hoverImage}
        alt=""
        fill
        sizes="(max-width: 990px) 33vw, (min-width: 1920px) 530px, 33vw"
        className="z-10 origin-center rounded-full object-cover opacity-0 transition-all duration-1000 ease-out group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* Radial gradient overlay for fade effect */}
      <div
        style={RADIAL_GRADIENT_STYLE}
        className="absolute inset-0 z-[15] opacity-0 transition-opacity duration-1000 ease-out group-hover:opacity-100"
      />

      {/* Content */}
      <div className="relative z-20 flex h-full w-full flex-col items-center justify-center px-1 sm:px-2 md:px-4">
        {/* Icon container */}
        <div className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-dm-text-muted shadow-custom md:mb-3 md:h-[56px] md:w-[56px]">
          {/* Responsive icon sizing via wrapper since size prop overrides class */}
          <div className="scale-[0.6] md:scale-100">
            <Icon size={iconSize} aria-hidden="true" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center text-[11px] leading-tight font-semibold text-dm-text-primary sm:text-[13px] md:text-[18px]">
          {title}
        </h3>

        {/* Description */}
        <span className="mt-1 hidden text-center text-[9px] leading-tight text-dm-text-muted sm:block sm:text-[11px] md:mt-0 md:text-[14px]">
          {description}
        </span>
      </div>
    </div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * AboutSection1 Component
 *
 * Displays three key features with interactive hover effects
 */
export default function FeaturesSection() {
  const t = useTranslations("home");

  const FEATURES = [
    {
      id: "buyer-protection",
      icon: HiShieldCheck,
      iconSize: 30,
      title: t("buyerProtection"),
      description: t("secureTransactionsAndPersonalData"),
      hoverImage: hoverAb1Image.src,
    },
    {
      id: "secure-payment",
      icon: FaCreditCard,
      iconSize: 28,
      title: t("securePayment"),
      description: t("secureTransactionsAndPersonalData"),
      hoverImage: hoverAb3Image.src,
    },
    {
      id: "customer-support",
      icon: IoPerson,
      iconSize: 28,
      title: t("support247"),
      description: t("secureTransactionsAndPersonalData"),
      hoverImage: hoverAb2Image.src,
    },
  ];

  return (
    <section
      className="relative z-10 flex h-[156px] w-full items-center justify-center text-center"
      aria-label={t("keyFeatures")}
    >
      {/* Background image */}
      <Image
        src={aboutUs1Image.src}
        alt=""
        fill
        sizes="100vw"
        className="z-10 object-cover"
        aria-hidden="true"
        priority={false}
      />

      {/* Features container */}
      <div className="relative z-20 flex h-full w-full max-w-[940px] 1200:max-w-[1140px] 1640:max-w-[1310px] 1920:max-w-[1590px]">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.id}
            icon={feature.icon}
            iconSize={feature.iconSize}
            title={feature.title}
            description={feature.description}
            hoverImage={feature.hoverImage}
          />
        ))}
      </div>
    </section>
  );
}
