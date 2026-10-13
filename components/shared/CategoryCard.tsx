/**
 * CategoryCard Component (shared)
 *
 * Reusable card for displaying category/product type with hover effects
 */

"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { HOME_CATEGORY_SCROLL_KEY } from "../home/home-scroll-restoration";

/* ============================================
   TYPES
   ============================================ */

export interface CategoryCardData {
    id: number;
    title: string;
    description: string;
    productCount: string;
    bgImage: string;
    heroImage: string;
    gradientColor: string;
    href: string;
}

export interface CategoryCardProps {
    data: CategoryCardData;
}

/* ============================================
   COMPONENT
   ============================================ */

/**
 * CategoryCard Component
 *
 * Card with background image, hero character, and hover effects
 */
export function CategoryCard({ data }: CategoryCardProps) {
    const rememberHomeScrollPosition = () => {
        window.sessionStorage.setItem(
            HOME_CATEGORY_SCROLL_KEY,
            String(window.scrollY),
        );
    };

    return (
        <Link
            prefetch={false}
            href={data.href}
            className="inline-block relative group"
            onClick={rememberHomeScrollPosition}
        >
            <div className="w-[345px] h-[210px] 1000:w-[455px] 1000:h-[259px] 1200:w-[555px] 1200:h-[300px] 1640:w-[640px] 1640:h-[355px] 1920:w-[780px] rounded-md overflow-hidden relative">
                <div className="w-full h-full bg-surface-base cursor-pointer transition-all duration-300">
                    {/* Background image */}
                    <Image
                        src={data.bgImage}
                        alt=""
                        fill
                        className="object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-1000"
                        aria-hidden="true"
                        sizes="(max-width: 1000px) 345px, (max-width: 1200px) 455px, (max-width: 1640px) 555px, 780px"
                    />

                    {/* Gradient overlay for hover effect */}
                    <div
                        className={`absolute inset-0 bg-linear-to-r from-transparent ${data.gradientColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        aria-hidden="true"
                    />

                    {/* Content */}
                    <div className="text-dm-text-primary h-full w-full flex flex-col justify-between p-6 relative z-10">
                        <div>
                            <h3 className="block text-2xl font-semibold mb-2">
                                {data.title}
                            </h3>
                            <p className="text-dm-text-tertiary w-full hidden 1000:block max-w-[270px]">
                                {data.description}
                            </p>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-dm-text-tertiary">{data.productCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero image with hover effects */}
            <div className="absolute bottom-0 right-0 w-[177px] 1000:w-[208px] 1200:w-60 1640:w-[284px] z-20">
                <Image
                    src={data.heroImage}
                    alt={data.title}
                    width={284}
                    height={400}
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 1000:group-hover:scale-110 group-hover:-translate-x-1 group-hover:-translate-y-2 1000:group-hover:-translate-x-3 1000:group-hover:-translate-y-4"
                />
            </div>
        </Link>
    );
}
