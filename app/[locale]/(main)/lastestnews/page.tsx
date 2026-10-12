import type { Metadata } from "next";
import NewsCard from "@/components/home/NewsCard";
import { NEWS_ARTICLES, getNewsArticleHref } from "@/lib/constants/news";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest News - Difmark",
  description: "Read the latest sample gaming news and marketplace updates.",
};

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  return (
    <main
      id="main-content"
      className="flex w-full justify-center px-8 py-10 800:px-0"
    >
      <section className="responsive" aria-labelledby="news-page-heading">
        <h1
          id="news-page-heading"
          className="mb-8 text-2xl font-bold text-dm-text-primary uppercase"
        >
          {t("latestNews")}
        </h1>

        <div className="grid gap-7 800:grid-cols-2 1200:grid-cols-3 1920:grid-cols-4">
          {NEWS_ARTICLES.map((article) => (
            <NewsCard
              key={article.slug}
              image={article.image}
              timeAgo={article.timeAgo}
              title={article.title}
              excerpt={article.excerpt}
              views={article.views}
              href={getNewsArticleHref(article.slug)}
              fluid
            />
          ))}
        </div>
      </section>
    </main>
  );
}
