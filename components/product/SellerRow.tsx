"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  CircleCheck,
  KeyRound,
  Award,
  ShieldCheck,
  Star,
  ShoppingCart,
  Eye,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/contexts/CartContext";
import OptimizedAvatar from "../shared/OptimizedAvatar";
import { SELLER_OFFER_CLASS } from "./product-layout";
import PlatformBadges from "@/components/shared/PlatformBadges";

export interface SellerOffer {
  data: {
    id: string;
    type: string;
    platform: string;
    edition: string;
    activationRegion: string;
    price: number;
    currency: string;
    title: string;
    image_url: string;
  };
  seller: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    isVerified?: boolean;
    tier: string;
    rating: number;
  };
}

export default function SellerRow({ offer }: { offer: SellerOffer }) {
  const { addToCart } = useCart();
  const t = useTranslations("product");
  const locale = useLocale();
  const price = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: offer.data.currency,
    minimumFractionDigits: 2,
  }).format(offer.data.price);

  function addOffer() {
    addToCart({
      id: offer.data.id,
      name: offer.data.title,
      platform: offer.data.platform,
      image: offer.data.image_url,
      price: offer.data.price,
      currency: offer.data.currency,
    });
  }

  return (
    <article className={SELLER_OFFER_CLASS}>
      <div className="flex min-w-0 items-center gap-3">
        <OptimizedAvatar
          src={offer.seller.avatar}
          alt={offer.seller.name}
          size={44}
          fallback={offer.seller.name.substring(0, 2).toUpperCase()}
        />
        <div className="min-w-0">
          <Link
            href={`/user/${offer.seller.id}`}
            className="hover:text-forest-400 flex items-center gap-2 font-semibold"
          >
            <span className="truncate">{offer.seller.name}</span>
            {offer.seller.isVerified && (
              <ShieldCheck
                className="text-forest-400 h-4 w-4 shrink-0"
                aria-label="Verified Seller"
              />
            )}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <span>{offer.seller.tier}</span>
            <span className="border-l border-white/15 pl-2">
              <Star className="mr-1 inline h-3.5 w-3.5 text-[#f8c944]" />
              {offer.seller.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-300 xl:border-l xl:border-white/10 xl:pl-4">
        <KeyRound className="h-4 w-4 shrink-0 text-gray-400" />
        <PlatformBadges platform={offer.data.platform} size={16} />
      </div>
      <div className="flex items-center gap-2 text-sm xl:border-l xl:border-white/10 xl:pl-4">
        <Award className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="text-gray-400">{t("edition")}</span>
        <span>{offer.data.edition}</span>
      </div>
      <div className="flex items-center gap-2 text-sm xl:border-l xl:border-white/10 xl:pl-4">
        <CircleCheck className="h-6 w-6 shrink-0 text-[#65c756]" />
        <span className="text-gray-300">
          {t("canBeActivatedFrom")}{" "}
          <span className="text-white">{offer.data.activationRegion}</span>
        </span>
      </div>
      <div className="xl:border-l xl:border-white/10 xl:pl-4">
        <div className="text-xs text-gray-400">{t("totalAmount")}</div>
        <div className="mt-1 text-xl font-bold">{price}</div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/buy-cheap?id=${offer.data.id}`}
          aria-label={`View ${offer.data.title}`}
          className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <Eye className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={addOffer}
          aria-label={`${t("addToCart")}: ${offer.data.title}`}
          className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#39465b] text-white hover:bg-[#45546c] xl:w-[54px] xl:flex-none"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm xl:hidden">{t("addToCart")}</span>
        </button>
      </div>
    </article>
  );
}
