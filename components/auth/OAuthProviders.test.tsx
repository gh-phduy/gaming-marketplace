import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OAuthProviders from "./OAuthProviders";
import messages from "@/messages/en.json";

const auth = vi.hoisted(() => ({ signInWithOAuth: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { auth } }));

function setup(locale = "en") {
  const onShowToast = vi.fn();
  render(
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <OAuthProviders onEmailClick={vi.fn()} onShowToast={onShowToast} />
    </NextIntlClientProvider>,
  );
  return onShowToast;
}

describe("Google login", () => {
  beforeEach(() => { auth.signInWithOAuth.mockReset(); });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it.each(["en", "ko"])("returns to the active %s locale", async locale => {
    auth.signInWithOAuth.mockResolvedValue({ error: null });
    setup(locale);
    fireEvent.click(screen.getByRole("button", { name: "Log in with Google" }));
    await waitFor(() => expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google", options: { redirectTo: `${window.location.origin}/${locale}` },
    }));
  });

  it("shows an OAuth failure and lets the user retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    auth.signInWithOAuth.mockResolvedValue({ error: new Error("Google provider is not enabled") });
    const onShowToast = setup();
    fireEvent.click(screen.getByRole("button", { name: "Log in with Google" }));
    await waitFor(() => expect(onShowToast).toHaveBeenCalledWith("Google provider is not enabled", "warning"));
    expect(screen.getByRole("button", { name: "Log in with Google" })).toBeEnabled();
  });

  it("blocks repeated clicks while the redirect is pending", async () => {
    let finish!: (value: { error: null }) => void;
    auth.signInWithOAuth.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Log in with Google" }));
    const button = screen.getByRole("button", { name: "Loading..." });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(auth.signInWithOAuth).toHaveBeenCalledTimes(1);
    await act(async () => { finish({ error: null }); });
  });
});
