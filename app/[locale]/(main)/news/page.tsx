import { permanentRedirect } from "next/navigation";
import { NEWS_ROUTE } from "@/lib/constants/news";

export default async function LegacyNewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect(`/${locale}${NEWS_ROUTE}`);
}
