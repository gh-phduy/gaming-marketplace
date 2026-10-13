import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";
import { AppProviders } from "@/contexts/AppProviders";
import LazyFloatingChat from "@/components/chat/LazyFloatingChat";
import MarketplaceHero from "@/components/layout/MarketplaceHero";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
