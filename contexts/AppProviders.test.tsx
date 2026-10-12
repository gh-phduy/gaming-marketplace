import type { ReactNode } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import { AppProviders } from "./AppProviders";
import { useSettings } from "./SettingsContext";
import enMessages from "@/messages/en.json";
import koMessages from "@/messages/ko.json";

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

function SettingsProbe() {
  const { language, currency, setCurrency } = useSettings();
  const locale = useLocale();
  const t = useTranslations("common");
  return (
    <>
      <span data-testid="locale">{locale}</span>
      <span data-testid="language">{language}</span>
      <span data-testid="currency">{currency}</span>
      <span data-testid="search">{t("search")}</span>
      <button onClick={() => setCurrency("EUR")}>Change currency</button>
    </>
  );
}

function TestApp({ locale }: { locale: string }) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "ko" ? koMessages : enMessages}
      timeZone="UTC"
    >
      <AppProviders><SettingsProbe /></AppProviders>
    </NextIntlClientProvider>
  );
}

describe("route locale in AppProviders", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it.each([
    ["en", "KO", "EN", enMessages.common.search],
    ["ko", "EN", "KO", koMessages.common.search],
  ])("keeps %s translations despite saved %s preference", async (locale, saved, language, search) => {
    window.localStorage.setItem("app-language", JSON.stringify(saved));
    render(<TestApp locale={locale} />);
    await act(async () => { await vi.runAllTimersAsync(); });

    expect(screen.getByTestId("locale")).toHaveTextContent(locale);
    expect(screen.getByTestId("language")).toHaveTextContent(language);
    expect(screen.getByTestId("search")).toHaveTextContent(search);
  });

  it("updates the selected language when the route locale changes", () => {
    const { rerender } = render(<TestApp locale="en" />);
    rerender(<TestApp locale="ko" />);
    expect(screen.getByTestId("language")).toHaveTextContent("KO");
    expect(screen.getByTestId("search")).toHaveTextContent(koMessages.common.search);
    rerender(<TestApp locale="zh" />);
    expect(screen.getByTestId("language")).toHaveTextContent("CN");
  });

  it("still restores and persists currency independently of language", async () => {
    window.localStorage.setItem("app-language", JSON.stringify("KO"));
    window.localStorage.setItem("app-currency", JSON.stringify("VND"));
    render(<TestApp locale="en" />);
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(screen.getByTestId("currency")).toHaveTextContent("VND");
    act(() => { screen.getByRole("button", { name: "Change currency" }).click(); });
    expect(window.localStorage.getItem("app-currency")).toBe(JSON.stringify("EUR"));
    expect(screen.getByTestId("language")).toHaveTextContent("EN");
  });
});
