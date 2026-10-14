import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";
import { AppProviders } from "@/contexts/AppProviders";
import LazyFloatingChat from "@/components/chat/LazyFloatingChat";
import MarketplaceHero from "@/components/layout/MarketplaceHero";
import { setRequestLocale } from "next-intl/server";

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Layouts can render independently from the page during ISR generation.
  setRequestLocale(locale);
  return (
    <>
      <AppProviders>
        <NavBar />
        <div className="flex flex-1 flex-col items-center pt-16 w-full overflow-x-hidden">
          <MarketplaceHero />
          {children}
        </div>
        <LazyFloatingChat />
        <Footer />
      </AppProviders>
    </>
  );
}
