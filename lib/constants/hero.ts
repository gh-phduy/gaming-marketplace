import heroSlideTab1Image from "@/public/hero-slide-tab-1.webp";
import heroSlideTabMobile1Image from "@/public/hero-slide-tab-mobile-1.webp";
import heroSlideTab2Image from "@/public/hero-slide-tab-2.webp";
import heroSlideTabMobile2Image from "@/public/hero-slide-tab-mobile-2.webp";
import heroSlide1Image from "@/public/hero-slide-1.webp";
import heroSlideMobile1Image from "@/public/hero-slide-mobile-1.webp";
import heroSlide2Image from "@/public/hero-slide-2.webp";
import heroSlideMobile2Image from "@/public/hero-slide-mobile-2.webp";
import heroSlide3Image from "@/public/hero-slide-3.webp";
import heroSlideMobile3Image from "@/public/hero-slide-mobile-3.webp";
import heroSlide4Image from "@/public/hero-slide-4.webp";
import heroSlideMobile4Image from "@/public/hero-slide-mobile-4.webp";
import bannerItemImage from "@/public/banner-item.webp";
import bannerItem2Image from "@/public/banner-item-2.webp";
import bgCategoryHeroPcImage from "@/public/bg-category-hero-pc.jpg";
import categoryHeroPcImage from "@/public/category-hero-pc.webp";
import bgCategoryHeroConsoleImage from "@/public/bg-category-hero-console.jpg";
import categoryHeroConsoleImage from "@/public/category-hero-console.webp";
import bgCategoryHeroGiftImage from "@/public/bg-category-hero-gift.jpg";
import categoryHeroGift1Image from "@/public/category-hero-gift1.webp";
import categoryHeroGift2Image from "@/public/category-hero-gift2.webp";
import categoryHeroGift3Image from "@/public/category-hero-gift3.webp";
import bgCategoryHeroSoftwareImage from "@/public/bg-category-hero-software.jpg";
import categoryHeroSoftware1Image from "@/public/category-hero-software1.webp";
import categoryHeroSoftware2Image from "@/public/category-hero-software2.webp";
import bgCategoryAllCategoriesImage from "@/public/bg-category-all-categories.jpg";
import categoryHeroAllCategoriesImage from "@/public/category-hero-all-categories.webp";
import bgCategoryMobileImage from "@/public/bg-category-mobile.jpg";
import categoryHeroMobileImage from "@/public/category-hero-mobile.webp";
import bgCategoryServicesImage from "@/public/bg-category-services.jpg";
import categoryHeroServices1Image from "@/public/category-hero-services1.webp";
import categoryHeroServices2Image from "@/public/category-hero-services2.webp";
import categoryHeroServices3Image from "@/public/category-hero-services3.webp";
import categoryHeroServices4Image from "@/public/category-hero-services4.webp";
import categoryHeroServices5Image from "@/public/category-hero-services5.webp";
import HERO_PRODUCTS from "./hero-products.json";

// Hero carousel slides configuration
export interface HeroSlide {
  id: string;
  image: string;
  mobileImage: string;
  alt?: string;
  link?: string;
}

export const HERO_SLIDES_DIGITAL: HeroSlide[] = [
  {
    id: "hero-slide-tab-1",
    image: heroSlideTab1Image.src,
    mobileImage: heroSlideTabMobile1Image.src,
    alt: "Digital Products Hero 1",
  },
  {
    id: "hero-slide-tab-2",
    image: heroSlideTab2Image.src,
    mobileImage: heroSlideTabMobile2Image.src,
    alt: "Digital Products Hero 2",
  },
];

export const HERO_SLIDES_TOPUP: HeroSlide[] = [
  {
    id: "hero-slide-tab-1",
    image: heroSlideTab1Image.src,
    mobileImage: heroSlideTabMobile1Image.src,
    alt: "Direct Top Up Hero 1",
    link: "/direct-top-up/mobile-games/mobile-legends",
  },
  {
    id: "hero-slide-tab-2",
    image: heroSlideTab2Image.src,
    mobileImage: heroSlideTabMobile2Image.src,
    alt: "Direct Top Up Hero 2",
    link: "/direct-top-up/mobile-games/pubg-mobile",
  },
];

const DIGITAL_SLIDE_IMAGES = [
  [heroSlide1Image.src, heroSlideMobile1Image.src],
  [heroSlide2Image.src, heroSlideMobile2Image.src],
  [heroSlide3Image.src, heroSlideMobile3Image.src],
  [heroSlide4Image.src, heroSlideMobile4Image.src],
];

export const HERO_SLIDES: HeroSlide[] = HERO_PRODUCTS.map((product, index) => ({
  id: product.slug,
  image: DIGITAL_SLIDE_IMAGES[index][0],
  mobileImage: DIGITAL_SLIDE_IMAGES[index][1],
  alt: product.title,
  link: `/buy-cheap?id=${product.id}`,
}));

// Side banners configuration
export interface SideBanner {
  id: string;
  image: string;
  link: string;
  alt: string;
}

export const HERO_SIDE_BANNERS: SideBanner[] = [
  {
    id: "cashback",
    image: bannerItemImage.src,
    link: "/buy-cheap",
    alt: "Up to 10% Cashback",
  },
  {
    id: "topup-promo",
    image: bannerItem2Image.src,
    link: "/buy-cheap",
    alt: "Top Up Promo",
  },
];

// Hero category cards
export interface HeroCategory {
  id: string;
  title: string;
  icon: string;
  image: string;
  heroImages: string[];
  link: string;
}

export const HERO_CATEGORIES: HeroCategory[] = [
  {
    id: "pc-games",
    title: "PC GAMES",
    icon: "monitor",
    image: bgCategoryHeroPcImage.src,
    heroImages: [categoryHeroPcImage.src],
    link: "/buy-pc-games",
  },
  {
    id: "console-games",
    title: "CONSOLE GAMES",
    icon: "gamepad-2",
    image: bgCategoryHeroConsoleImage.src,
    heroImages: [categoryHeroConsoleImage.src],
    link: "/buy-console-games",
  },
  {
    id: "gift-cards",
    title: "GIFT CARDS",
    icon: "credit-card",
    image: bgCategoryHeroGiftImage.src,
    heroImages: [categoryHeroGift1Image.src, categoryHeroGift2Image.src, categoryHeroGift3Image.src],
    link: "/buy-gift-cards",
  },
  {
    id: "software",
    title: "SOFTWARE",
    icon: "package",
    image: bgCategoryHeroSoftwareImage.src,
    heroImages: [categoryHeroSoftware1Image.src, categoryHeroSoftware2Image.src],
    link: "/buy-software",
  },
];

export const TOPUP_CATEGORIES: HeroCategory[] = [
  {
    id: "all-category",
    title: "ALL CATEGORY",
    icon: "package",
    image: bgCategoryAllCategoriesImage.src,
    heroImages: [categoryHeroAllCategoriesImage.src],
    link: "/direct-top-up?category=all#top-up-products",
  },
  {
    id: "mobile-games",
    title: "MOBILE GAMES",
    icon: "gamepad-2",
    image: bgCategoryMobileImage.src,
    heroImages: [categoryHeroMobileImage.src],
    link: "/direct-top-up?category=mobile#top-up-products",
  },
  {
    id: "services",
    title: "SERVICES",
    icon: "credit-card",
    image: bgCategoryServicesImage.src,
    heroImages: [
      categoryHeroServices1Image.src,
      categoryHeroServices2Image.src,
      categoryHeroServices3Image.src,
      categoryHeroServices4Image.src,
      categoryHeroServices5Image.src,
    ],
    link: "/direct-top-up?category=services#top-up-products",
  },
];
