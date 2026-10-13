/**
 * Direct Top Up Page
 *
 * Trang top up trực tiếp game và dịch vụ số
 * Hero được render bởi MarketplaceHero trong layout chung.
 */

import { DirectTopUpClient } from "@/components/home/directtopup/DirectTopUpClient";

export const dynamic = "force-dynamic";

interface DirectTopUpPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function DirectTopUpPage({
  searchParams,
}: DirectTopUpPageProps) {
  const { category } = await searchParams;

  return (
    <>
      <main
        id="main-content"
        className="flex w-full flex-col items-center gap-y-16 pt-8"
      >
        <DirectTopUpClient category={category} />
      </main>
    </>
  );
}
