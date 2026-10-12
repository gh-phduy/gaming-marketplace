import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/contexts/CartContext";
import { Analytics } from "@vercel/analytics/react";
import "../globals.css";

export const metadata: Metadata = {
  title: "Difmark - Digital Game Marketplace",
  description: "Buy cheap digital games, gift cards, and software keys",
  keywords: ["games", "digital keys", "marketplace", "cheap games"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function RootLayout(props: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await props.params;
  const { children } = props;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Keep inherited next-intl configuration independent of request headers.
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className="dark overflow-x-hidden">
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-midnight-850 text-dm-text-primary antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>

            {children}
            <Analytics />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
