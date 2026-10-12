import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ProductOverview from "@/components/product/ProductOverview";
import { ProductApiResponse } from "@/types/api-product";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { supabase } from "@/lib/supabase";
import { listingCategories } from "@/lib/seller-listing";
import Image from "next/image";
import { getProductDetailImage } from "@/lib/product-detail-image";
import { PRODUCT_PAGE_CLASS } from "@/components/product/product-layout";
import {
  ProductDescriptionSkeleton,
  SellerListSkeleton,
  ProductContentSkeleton,
} from "@/components/product/PageSkeletons";

// Dynamic imports for below-the-fold components (lazy loading)
const ProductDescription = nextDynamic(
  () => import("@/components/product/ProductDescription"),
  {
    loading: () => <ProductDescriptionSkeleton />,
  },
);
const SellerList = nextDynamic(
  () => import("@/components/product/SellerList"),
  {
    loading: () => <SellerListSkeleton />,
  },
);
const LoadMoreButton = nextDynamic(
  () => import("@/components/shared/LoadMoreButton"),
);
const Pagination = nextDynamic(() => import("@/components/shared/Pagination"));
const AboutProductSection = nextDynamic(
  () => import("@/components/product/ProductContent"),
  {
    loading: () => <ProductContentSkeleton />,
  },
);

// Helper for server-side fetching
async function getProduct(id: string): Promise<ProductApiResponse | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        seller:users (
          id,
          display_name,
          avatar_url,
          rating,
          is_verified_seller
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Failed to fetch product from Supabase:", error);
      return null;
    }

    const mapped: ProductApiResponse = {
      data: {
        id: data.id,
        name: data.title,
        type:
          Object.keys(listingCategories).find(
            (label) => listingCategories[label] === data.category,
          ) || data.category,
        platform: data.platform || "PC",
        edition: data.edition || "Standard",
        delivery: data.delivery || "Instant",
        activationRegion: data.region,
        price: Number(data.price),
        currency: data.currency,
        images: [data.image_url || "/cyberpunk_2077.jpg"],
        description: data.description || "",
      },
      seller: {
        id: data.seller?.id || "unknown",
        name: data.seller?.display_name || "Unknown Seller",
        avatar: data.seller?.avatar_url || "/avt1.png",
        isOnline: false,
        isVerified: Boolean(data.seller?.is_verified_seller),
        badge: data.seller?.is_verified_seller ? "Verified Seller" : "Seller",
        tier: "",
        rating: Number(data.seller?.rating ?? 0),
        successRate: 0,
        totalFeedbacks: 0,
        timezone: "",
        totalSales: 0,
        positiveFeedbacks: 0,
        negativeFeedbacks: 0,
      },
    };

    return mapped;
  } catch (e) {
    console.error("Failed to fetch product:", e);
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function BuyCheapPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const t = await getTranslations("product");
  const { id } = await searchParams;
  if (!id) {
    return (
      <main
        id="main-content"
        className="flex w-full max-w-[1590px] flex-col items-center gap-y-8"
      >
        <div className="rounded-lg bg-red-500/10 p-4 text-red-500">
          {t("noProductIdProvided")}
        </div>
      </main>
    );
  }
  // Fetch product data on the server
  const productData = await getProduct(id);
  if (!productData)
    return (
      <main id="main-content" className="w-full p-6">
        <p className="text-red-400">{t("productNotFoundOrFailedToLoad")}</p>
      </main>
    );

  return (
    <div className="relative isolate flex w-full justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[650px] overflow-hidden sm:h-[720px]"
      >
        <Image
          src={getProductDetailImage(productData.data.images[0])}
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover opacity-45 blur-3xl"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-linear-to-b from-[#181f28]/20 via-[#181f28]/10 to-[#181f28]" />
      </div>
      <main id="main-content" className={PRODUCT_PAGE_CLASS}>
        <ScrollToTop />
        <Breadcrumbs
          items={[
            { label: productData.data.type, href: "/product" },
            { label: productData.data.platform },
            { label: productData.data.name },
          ]}
        />

        {/* Product Header Section */}
        <h1 className="text-center text-2xl leading-tight font-semibold uppercase sm:text-[28px] lg:text-[32px]">
          {productData.data.name}
        </h1>
        <ProductOverview data={productData} />

        {/* Below-the-fold content with Suspense */}
        <Suspense fallback={<ProductDescriptionSkeleton />}>
          <ProductDescription description={productData.data.description} />
        </Suspense>

        <Suspense fallback={<SellerListSkeleton />}>
          <SellerList productTitle={productData.data.name} />
        </Suspense>

        <Pagination />

        <Suspense fallback={<ProductContentSkeleton />}>
          <AboutProductSection
            title={productData.data.name}
            description={productData.data.description}
          />
        </Suspense>
      </main>
    </div>
  );
}
