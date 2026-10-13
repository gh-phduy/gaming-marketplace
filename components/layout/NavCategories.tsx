/**
 * NavCategories Component
 *
 * Categories dropdown menu for the navigation bar
 * Shows categorized product types with icons
 */

"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { IoIosArrowForward } from "react-icons/io";
import { IoKey, IoPhonePortraitOutline } from "react-icons/io5";
import { IconType } from "react-icons";
import {
  FaBolt,
  FaGamepad,
  FaMobileAlt,
  FaTools,
  FaWindows,
} from "react-icons/fa";
import {
  MdAccountCircle,
  MdCardGiftcard,
  MdComputer,
  MdInventory2,
} from "react-icons/md";
import { useTranslations } from "next-intl";

/* ============================================
   TYPES
   ============================================ */

interface CategoryItem {
  id: number;
  name: string;
  icon: IconType;
  href: string;
}

interface Category {
  id: number;
  title: string;
  items: CategoryItem[];
}

/* ============================================
   CONSTANTS
   ============================================ */

const CATEGORIES_DATA: Category[] = [
  {
    id: 1,
    title: "videoGames",
    items: [
      { id: 1, name: "gameKeys", icon: IoKey, href: "/buy-game-keys" },
      {
        id: 2,
        name: "consoleGames",
        icon: FaGamepad,
        href: "/buy-console-games",
      },
      {
        id: 3,
        name: "pcGames",
        icon: MdComputer,
        href: "/buy-pc-games",
      },
      {
        id: 4,
        name: "mobile",
        icon: IoPhonePortraitOutline,
        href: "/buy-mobile",
      },
    ],
  },
  {
    id: 2,
    title: "onlineGames",
    items: [
      {
        id: 5,
        name: "gameCurrency",
        icon: FaMobileAlt,
        href: "/buy-game-currency",
      },
      {
        id: 6,
        name: "gameAccounts",
        icon: MdAccountCircle,
        href: "/buy-game-accounts",
      },
      {
        id: 7,
        name: "gameItems",
        icon: FaTools,
        href: "/buy-game-items",
      },
      {
        id: 8,
        name: "powerLeveling",
        icon: FaBolt,
        href: "/buy-power-leveling",
      },
    ],
  },
  {
    id: 3,
    title: "giftCardsAndSoftware",
    items: [
      {
        id: 9,
        name: "software",
        icon: FaWindows,
        href: "/buy-software",
      },
      {
        id: 10,
        name: "giftCards",
        icon: MdCardGiftcard,
        href: "/buy-gift-cards",
      },
      {
        id: 11,
        name: "gameCards",
        icon: MdInventory2,
        href: "/buy-game-cards",
      },
    ],
  },
] as const;

/* ============================================
   SUB-COMPONENTS
   ============================================ */

interface CategoryHeaderProps {
  title: string;
}

/**
 * Category section header with gradient mask
 */
function CategoryHeader({ title }: CategoryHeaderProps) {
  return (
    <div
      style={{
        maskImage:
          "linear-gradient(to right, black 8%, black 60%, transparent 100%)",
      }}
      className="w-fit rounded-sm bg-surface-overlay pr-16 pl-3 text-[14px] text-dm-text-muted 990:text-[16px]"
    >
      {title}
    </div>
  );
}

interface ItemCardProps {
  item: CategoryItem;
}

/**
 * Individual category item card
 */
function ItemCard({ item }: ItemCardProps) {
  const t = useTranslations("nav");
  const IconComponent = item.icon;

  return (
    <Link
      href={item.href}
      className="group relative flex h-[65px] w-[100px] origin-center cursor-pointer flex-col items-center justify-center gap-y-1 overflow-hidden rounded-lg bg-surface-overlay text-dm-text-muted transition-colors duration-1000 ease-out hover:bg-state-hover 990:h-[75px] 990:w-[130px] 990:gap-y-2 1200:h-[92px] 1200:w-[170px]"
    >
      {/* Hover background */}
      <Image
        src="/nav-cate-hover1.webp"
        alt=""
        fill
        className="z-10 origin-center object-cover opacity-0 transition-all duration-1000 ease-out group-hover:opacity-95"
        aria-hidden="true"
      />

      {/* Icon container */}
      <div className="relative z-20 flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-state-active shadow-nav-cate transition-colors duration-1000 ease-out group-hover:bg-state-active/10 990:h-[38px] 990:w-[38px] 1200:h-[44px] 1200:w-[44px]">
        <IconComponent
          className="scale-100 transition-transform duration-1000 ease-out group-hover:scale-110"
          size={16}
          aria-hidden="true"
        />
      </div>

      {/* Item name */}
      <span className="relative z-20 text-[10px] 990:text-xs 1200:text-sm">
        {t(item.name as any)}
      </span>
    </Link>
  );
}

interface CategorySectionProps {
  category: Category;
  showTopMargin?: boolean;
}

/**
 * Category section with header and items
 */
function CategorySection({
  category,
  showTopMargin = false,
}: CategorySectionProps) {
  const t = useTranslations("nav");
  return (
    <div className={showTopMargin ? "mt-2 990:mt-3" : ""}>
      <CategoryHeader title={t(category.title as any)} />
      <div
        className="mt-2 flex items-center justify-center gap-x-2 990:mt-3 990:gap-x-3 1200:gap-x-4"
        role="list"
      >
        {category.items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

/**
 * NavCategories Component
 *
 * Dropdown menu showing all product categories
 */
export default function NavCategories() {
  const t = useTranslations("nav");
  return (
    <nav
      className="max-w-[440px] 990:max-w-[580px] 1200:max-w-[760px]"
      aria-label={t("productCategories")}
    >
      {/* Categories content */}
      <div className="flex flex-col items-start gap-y-2 p-3 990:gap-y-3 990:p-4">
        {CATEGORIES_DATA.map((category, index) => (
          <CategorySection
            key={category.id}
            category={category}
            showTopMargin={index > 0}
          />
        ))}
      </div>

      {/* Footer link */}
      <Link
        href="/categories"
        className="flex cursor-pointer items-center justify-center gap-x-2 bg-brand-light p-2 text-dm-text-muted transition-colors hover:text-dm-text-primary"
      >
        <span className="text-[14px] 990:text-[16px] 1200:text-[18px]">
          {t("seeAllCategories")}
        </span>
        <IoIosArrowForward size={18} aria-hidden="true" />
      </Link>
    </nav>
  );
}
