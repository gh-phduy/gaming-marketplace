import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { LuClock3 } from "react-icons/lu";
import { BsTwitterX } from "react-icons/bs";
import { FaFacebookF, FaLink } from "react-icons/fa";
import { SiTelegram, SiVk } from "react-icons/si";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  NEWS_ARTICLES,
  getNewsArticleBySlug,
  getNewsArticleHref,
  NEWS_ROUTE,
} from "@/lib/constants/news";

export const dynamic = "force-dynamic";

interface NewsArticlePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsArticleBySlug(slug);

  if (!article) {
    return {
      title: "News article not found - Difmark",
    };
  }

  return {
    title: `${article.title} - Difmark`,
    description: article.excerpt,
  };
}

export default async function NewsArticlePage({
  params,
}: NewsArticlePageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = getNewsArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "product" });

  const relatedArticles = NEWS_ARTICLES.filter(
    (item) => item.slug !== article.slug,
  ).slice(0, 4);

  return (
    <main
      id="main-content"
      className="flex w-full justify-center px-8 py-10 800:px-0"
    >
      <div className="responsive">
        <nav
          aria-label="Breadcrumb"
          className="mb-10 flex flex-wrap items-center gap-2 text-sm font-medium text-dm-text-primary uppercase"
        >
          <Link
            href="/"
            className="transition-colors hover:text-dm-accent-green"
          >
            {t("home")}
          </Link>
          <span className="text-dm-text-disabled">/</span>
          <Link
            href={NEWS_ROUTE}
            className="transition-colors hover:text-dm-accent-green"
          >
            {t("news")}
          </Link>
          <span className="text-dm-text-disabled">/</span>
          <span className="max-w-full text-dm-text-primary">
            {article.title}
          </span>
        </nav>

        <article className="mx-auto max-w-[1140px] rounded-lg bg-surface-card p-6 990:p-8">
          <header className="grid gap-6 990:grid-cols-[1fr_0.95fr] 990:items-start">
            <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 990px) 100vw, 540px"
              />
            </div>

            <div className="flex min-w-0 flex-col gap-8">
              <h1 className="text-2xl leading-tight font-bold text-dm-text-primary 990:text-3xl">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-dm-accent-green">
                  <LuClock3 size={22} aria-hidden="true" />
                  <time>{article.timeAgo}</time>
                </div>

                <div className="flex items-center gap-3" aria-label="Share">
                  <button
                    type="button"
                    aria-label="Copy article link"
                    className="flex size-8 items-center justify-center rounded-full bg-dm-text-disabled text-white"
                  >
                    <FaLink size={14} aria-hidden="true" />
                  </button>
                  <a
                    href="https://telegram.org"
                    aria-label="Share on Telegram"
                    className="flex size-8 items-center justify-center rounded-full bg-[#37aee2] text-white"
                  >
                    <SiTelegram size={16} aria-hidden="true" />
                  </a>
                  <a
                    href="https://twitter.com"
                    aria-label="Share on X"
                    className="flex size-8 items-center justify-center rounded-full bg-[#55acee] text-white"
                  >
                    <BsTwitterX size={14} aria-hidden="true" />
                  </a>
                  <a
                    href="https://vk.com"
                    aria-label="Share on VK"
                    className="flex size-8 items-center justify-center rounded-full bg-[#4c75a3] text-white"
                  >
                    <SiVk size={16} aria-hidden="true" />
                  </a>
                  <a
                    href="https://facebook.com"
                    aria-label="Share on Facebook"
                    className="flex size-8 items-center justify-center rounded-full bg-[#3b5998] text-white"
                  >
                    <FaFacebookF size={14} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </header>

          <p className="mt-6 text-base leading-8 font-semibold text-dm-text-primary">
            {article.excerpt}
          </p>

          <div className="mt-10 space-y-10">
            {article.content.map((section) => (
              <section key={section.heading} className="space-y-5">
                <h2 className="text-2xl font-bold text-dm-accent-green">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 font-semibold text-dm-text-primary"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <section
          className="mx-auto mt-10 max-w-[1140px]"
          aria-labelledby="comments"
        >
          <h2
            id="comments"
            className="mb-14 text-lg font-bold text-dm-text-primary uppercase"
          >
            {t("comments")}
          </h2>

          <textarea
            className="h-36 w-full resize-none rounded-sm bg-midnight-500 p-5 text-dm-text-primary placeholder:text-dm-text-secondary focus:ring-2 focus:ring-dm-accent-green/70 focus:outline-none"
            maxLength={2000}
            placeholder={t("typeYourCommentHere")}
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-dm-text-secondary">
            <span>{t("charactersLeft")}</span>
            <button className="rounded-sm bg-dm-accent-green px-8 py-3 text-sm font-bold text-white uppercase transition-colors hover:bg-dm-accent-green-hover">
              {t("addComment")}
            </button>
          </div>

          <div className="my-16 text-center">
            <p className="font-bold text-dm-text-primary uppercase">
              {t("noCommentsFound")}
            </p>
            <p className="mt-4 text-dm-text-secondary">
              {t("fillOutTheFormAboveToLeaveAComment")}
            </p>
          </div>
        </section>

        <section
          className="mx-auto max-w-[1140px] border-t border-dm-border-strong pt-10"
          aria-labelledby="this-month"
        >
          <h2
            id="this-month"
            className="mb-10 text-lg font-bold text-dm-text-primary uppercase"
          >
            {t("thisMonth")}
          </h2>

          <div className="grid gap-8 800:grid-cols-2 1200:grid-cols-4">
            {relatedArticles.map((related) => (
              <article key={related.slug} className="flex flex-col gap-4">
                <Link
                  href={getNewsArticleHref(related.slug)}
                  className="group focus-visible:ring-2 focus-visible:ring-dm-accent-green/70 focus-visible:outline-none"
                >
                  <div className="relative aspect-[16/6] overflow-hidden rounded-sm">
                    <Image
                      src={related.image}
                      alt={related.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 800px) 100vw, (max-width: 1200px) 50vw, 280px"
                    />
                  </div>
                </Link>

                <h3 className="line-clamp-3 text-base font-bold text-dm-text-primary uppercase">
                  <Link
                    href={getNewsArticleHref(related.slug)}
                    className="transition-colors hover:text-dm-accent-green"
                  >
                    {related.title}
                  </Link>
                </h3>

                <p className="line-clamp-3 text-sm leading-6 font-medium text-dm-text-primary">
                  {related.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between gap-4 text-sm text-dm-text-secondary">
                  <span>{related.timeAgo}</span>
                  <Link
                    href={getNewsArticleHref(related.slug)}
                    className="rounded-sm bg-dm-accent-green px-9 py-2 text-sm font-medium text-white uppercase transition-colors hover:bg-dm-accent-green-hover"
                  >
                    {t("read")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
