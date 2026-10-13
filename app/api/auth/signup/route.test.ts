import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { POST } from "./route";
import { locales } from "@/i18n/config";
import confirmationCopy from "@/supabase/email-templates/confirmation-copy.json";

const auth = vi.hoisted(() => ({ signUp: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth })),
}));

const account = {
  email: "Test@example.com",
  password: "password123",
  username: "testuser",
};
function request(body: typeof account & { locale?: string } = account) {
  return new NextRequest("https://gamingmarketplace.click/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-public-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    auth.signUp.mockResolvedValue({
      data: { user: { id: "user-123" }, session: null },
      error: null,
    });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("rejects invalid input before contacting Supabase", async () => {
    const response = await POST(
      request({ email: "not-email", password: "123", username: "jo" }),
    );
    expect(response.status).toBe(400);
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("requires the public configuration instead of a service role key", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("uses public signup, preserves confirmation and sends the localized return URL", async () => {
    const response = await POST(request({ ...account, locale: "vi" }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ requiresEmailConfirmation: true });
    expect(createClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-public-key",
      expect.any(Object),
    );
    expect(auth.signUp).toHaveBeenCalledExactlyOnceWith({
      email: "test@example.com",
      password: account.password,
      options: {
        emailRedirectTo: "https://gamingmarketplace.click/vi",
        data: {
          locale: "vi",
          confirmation_subject: "Xác nhận email của bạn — Difmark",
          display_name: "testuser",
          username: "testuser",
          full_name: "testuser",
          avatar_url: "/avt-placeholder.jpg",
        },
      },
    });
  });

  it.each(locales)(
    "sends a bounded confirmation subject for %s",
    async (locale) => {
      const response = await POST(request({ ...account, locale }));
      expect(response.status).toBe(201);
      const metadata = auth.signUp.mock.calls[0][0].options.data;
      expect(metadata.locale).toBe(locale);
      expect(metadata.confirmation_subject).toBe(
        confirmationCopy[locale].subject,
      );
      expect([...metadata.confirmation_subject].length).toBeLessThanOrEqual(
        255,
      );
      expect(metadata.confirmation_subject).not.toMatch(/[\r\n]/);
    },
  );

  it("supports login when Supabase returns a session without returning tokens to the browser", async () => {
    auth.signUp.mockResolvedValue({
      data: {
        user: { id: "user-123" },
        session: { access_token: "test-token" },
      },
      error: null,
    });
    const response = await POST(request());
    expect(await response.json()).toEqual({ requiresEmailConfirmation: false });
    expect(auth.signUp.mock.calls[0][0].options.emailRedirectTo).toBe(
      "https://gamingmarketplace.click/en",
    );
  });

  it("does not accept arbitrary redirect paths as locales", async () => {
    const response = await POST(
      request({ ...account, locale: "//other.test" }),
    );
    expect(response.status).toBe(400);
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("preserves rate limit failures", async () => {
    auth.signUp.mockResolvedValue({
      data: {},
      error: { message: "Too many requests", status: 429 },
    });
    expect((await POST(request())).status).toBe(429);
  });

  it("reports email delivery failures without claiming success", async () => {
    auth.signUp.mockResolvedValue({
      data: {},
      error: { message: "Email address not authorized", status: 403 },
    });
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Email address not authorized",
    });
  });
});
