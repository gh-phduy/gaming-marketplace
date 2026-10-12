"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Eye,
  Share2,
  KeyRound,
  Gamepad2,
  Award,
  Truck,
  CircleCheck,
  Info,
  ShoppingCart,
  ShieldCheck,
  Star,
  MessageCircle,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApplePay } from "react-icons/fa";
import { Link } from "@/i18n/routing";
import { OptimizedAvatar } from "@/components/shared/OptimizedAvatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PurchaseCardProps } from "@/types/api-product";
import PlatformBadges from "@/components/shared/PlatformBadges";
import {
  PURCHASE_CARD_CLASS,
  PURCHASE_DETAILS_CLASS,
  PURCHASE_ACTIONS_CLASS,
} from "./product-layout";

export default function PurchaseCard({
  product,
  seller,
  onAddToCart,
  onCheckout,
  onChat,
}: PurchaseCardProps) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [shared, setShared] = useState(false);
  const price = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: product.currency,
    minimumFractionDigits: 2,
  }).format(product.price);
  const details = [
    { icon: KeyRound, label: t("productType"), value: product.type },
    { icon: Award, label: t("edition"), value: product.edition },
    {
      icon: Gamepad2,
      label: t("platform"),
      value: (
        <PlatformBadges
          platform={product.platform}
          showLabel
          compactLabels
          size={14}
        />
      ),
    },
    { icon: Truck, label: t("delivery"), value: product.delivery },
  ];

  async function shareProduct() {
    try {
      if (navigator.share)
        await navigator.share({
          title: product.name,
          url: window.location.href,
        });
      else await navigator.clipboard.writeText(window.location.href);
      setShared(true);
    } catch {
      /* Dismissing the share sheet keeps the current page. */
    }
  }

  return (
    <section aria-label={product.name} className={PURCHASE_CARD_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <OptimizedAvatar
            src={seller.avatar}
            alt={seller.name}
            size={44}
            fallback={seller.name.substring(0, 2).toUpperCase()}
          />
          <div className="min-w-0">
            <Link
              href={`/user/${seller.id}`}
              className="hover:text-forest-400 flex items-center gap-2 font-semibold text-white"
            >
              <span className="truncate">{seller.name}</span>
              {seller.isVerified && (
                <ShieldCheck
                  className="text-forest-400 h-4 w-4 shrink-0"
                  aria-label={seller.badge}
                />
              )}
            </Link>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span>{seller.badge}</span>
              <span className="h-3 border-l border-white/15" />
              <div
                aria-label={`Seller rating: ${seller.rating.toFixed(1)} out of 5`}
                className="flex items-center gap-1"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 ${index < Math.round(seller.rating) ? "fill-[#f8c944] text-[#f8c944]" : "text-gray-500"}`}
                  />
                ))}
                <span className="ml-1">{seller.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-gray-400">
          <Button
            variant="ghost"
            size="icon"
            onClick={onChat}
            aria-label={t("chat")}
            className="h-8 w-8 bg-transparent p-0 hover:bg-white/5 hover:text-white sm:h-10 sm:w-10"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden bg-transparent p-0 hover:bg-white/5 hover:text-white sm:inline-flex"
          >
            <a href="#about-product" aria-label="View product details">
              <Eye className="h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={shareProduct}
            aria-label="Share product"
            className="h-8 w-8 bg-transparent p-0 hover:bg-white/5 hover:text-white sm:h-10 sm:w-10"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {shared && (
        <span role="status" className="text-forest-400 mt-2 text-xs">
          Link ready to share
        </span>
      )}

      <dl className={PURCHASE_DETAILS_CLASS}>
        {details.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="grid min-w-0 grid-cols-[18px_auto_1fr] items-start gap-x-2"
          >
            <Icon className="mt-0.5 h-4 w-4 text-gray-400" aria-hidden="true" />
            <dt className="text-gray-400">{label}</dt>
            <dd className="min-w-0 text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex items-center gap-3 text-sm">
        <CircleCheck className="h-6 w-6 shrink-0 text-[#65c756]" />
        <p className="text-gray-300">
          {t("canBeActivatedFrom")}{" "}
          <span className="text-white">{product.activationRegion}</span>
        </p>
        <Popover>
          <PopoverTrigger
            aria-label="Activation region information"
            className="focus-visible:outline-forest-400 ml-auto rounded-full p-1 text-gray-400 hover:text-white focus-visible:outline-2"
          >
            <Info className="h-5 w-5" />
          </PopoverTrigger>
          <PopoverContent className="border-white/10 bg-[#222631] text-sm text-gray-300">
            {t("region")} {product.activationRegion}
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-white/10" />
        <span>{t("price")}</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 lg:mt-auto lg:pt-5">
        <span className="text-sm text-gray-400">{t("totalAmount")}</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[28px] leading-none font-bold text-white xl:text-[32px]">
            {price}
          </span>
          <div className="flex items-center gap-2" aria-label="Payment options">
            <span className="inline-flex h-8 items-center gap-0.5 rounded-full bg-white px-3 text-xs font-medium text-black">
              <FcGoogle size={16} />
              Pay
            </span>
            <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-black">
              <FaApplePay size={32} />
            </span>
          </div>
        </div>
      </div>
      <div className={PURCHASE_ACTIONS_CLASS}>
        <Button
          className="h-[54px] cursor-pointer rounded-xl bg-[#39465b] text-xs font-semibold text-white hover:bg-[#45546c] sm:text-sm"
          onClick={onAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          {t("addToCartUpper")}
        </Button>
        <Button
          className="h-[54px] cursor-pointer rounded-xl bg-[#65c756] text-xs font-semibold text-white hover:bg-[#58b94a] sm:text-sm"
          onClick={onCheckout}
        >
          {t("goToCheckout")}
        </Button>
      </div>
    </section>
  );
}
