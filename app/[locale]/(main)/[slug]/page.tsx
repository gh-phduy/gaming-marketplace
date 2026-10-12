import { notFound, permanentRedirect } from "next/navigation";
import { getNewsArticleBySlug, getNewsArticleHref } from "@/lib/constants/news";

export default async function LegacyNewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!getNewsArticleBySlug(slug)) {
    notFound();
  }

  permanentRedirect(`/${locale}${getNewsArticleHref(slug)}`);
}
