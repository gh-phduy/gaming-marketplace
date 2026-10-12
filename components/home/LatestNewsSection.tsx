"use client";

import NewsCard from "./NewsCard";
import ProductCarousel from "../product/ProductCarousel";
import SectionHeader from "../shared/SectionHeader";
import {
  getNewsArticleHref,
  LATEST_NEWS,
  NEWS_ROUTE,
} from "@/lib/constants/news";
import { useLocale, useTranslations } from "next-intl";

export default function LatestNewsSection() {
  const t = useTranslations("home");
  const locale = useLocale();

  const newsCards = LATEST_NEWS.map((article) => (
    <NewsCard
      key={article.slug}
      image={article.image}
      timeAgo={article.timeAgo}
      title={article.title}
      excerpt={article.excerpt}
      views={article.views}
      href={getNewsArticleHref(article.slug)}
    />
  ));

  return (
    <section
      className="w-full max-w-[720px] px-8 800:px-0 990:max-w-[940px] 1200:max-w-[1140px] 1640:max-w-[1310px] 1920:max-w-[1590px]"
      aria-labelledby="latest-news-heading"
    >
      <SectionHeader
        headingId="latest-news-heading"
        headingText={t("latestNews")}
        title={t("latestNewsTitle")}
        viewAllHref={`/${locale}${NEWS_ROUTE}`}
        viewAllAriaLabel={t("viewAllLatestNews")}
      />
      <div className="hidden justify-between 800:flex">
        {newsCards[0]}
        {newsCards[1]}
        <div className="hidden 970:block">{newsCards[2]}</div>
        <div className="hidden 1920:block">{newsCards[3]}</div>
      </div>
      <div className="block 800:hidden">
        <ProductCarousel>{newsCards}</ProductCarousel>
      </div>
    </section>
  );
}
