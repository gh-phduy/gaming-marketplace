import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import EmailSignUpForm from "./EmailSignUpForm";
import en from "@/messages/en.json";
import vn from "@/messages/vi.json";

const auth = vi.hoisted(() => ({ signInWithPassword: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { auth } }));

function setup(locale = "en") {
  const callbacks = {
    onBack: vi.fn(),
    onLoginClick: vi.fn(),
    onSuccess: vi.fn(),
  };
  render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "vi" ? vn : en}
      timeZone="UTC"
    >
      <EmailSignUpForm {...callbacks} />
    </NextIntlClientProvider>,
  );
  fireEvent.change(screen.getByPlaceholderText("Username"), {
    target: { value: "testuser" },
  });
  fireEvent.change(screen.getByPlaceholderText("Your email"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(
    screen.getByPlaceholderText("Your password (min. 6 characters)"),
    { target: { value: "password123" } },
  );
  fireEvent.change(screen.getByPlaceholderText("Confirm password"), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: "SIGN UP" }));
  return callbacks;
}

describe("email signup confirmation", () => {
  beforeEach(() => {
    auth.signInWithPassword.mockReset();
    sessionStorage.clear();
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("asks the user to verify the email instead of trying to sign in early", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ requiresEmailConfirmation: true }),
    });
    vi.stubGlobal("fetch", fetch);
    const callbacks = setup();
    await screen.findByRole("heading", { name: en.auth.signupSuccessTitle });
    expect(screen.getByText(en.auth.checkEmailTitle)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Username")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Your email")).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Your password (min. 6 characters)"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Confirm password"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("test@example.com");
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("auth_success_toast")).toBeNull();
    expect(JSON.parse(fetch.mock.calls[0][1].body).locale).toBe("en");
    expect(
      screen.queryByRole("button", { name: en.auth.loginButton }),
    ).not.toBeInTheDocument();
    expect(callbacks.onLoginClick).not.toHaveBeenCalled();
  });

  it("uses the active locale for confirmation guidance and the redirect", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ requiresEmailConfirmation: true }),
    });
    vi.stubGlobal("fetch", fetch);
    setup("vi");
    await screen.findByRole("heading", { name: vn.auth.signupSuccessTitle });
    expect(screen.getByText(vn.auth.checkEmailTitle)).toBeInTheDocument();
    expect(JSON.parse(fetch.mock.calls[0][1].body).locale).toBe("vi");
  });

  it("signs in when the configured signup flow does not require confirmation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ requiresEmailConfirmation: false }),
      }),
    );
    auth.signInWithPassword.mockResolvedValue({ error: null });
    const callbacks = setup();
    await waitFor(() => expect(callbacks.onSuccess).toHaveBeenCalledOnce());
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("shows a delivery failure without showing a confirmation success screen", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Email address not authorized" }),
      }),
    );
    const callbacks = setup();
    await screen.findByText("Email address not authorized");
    expect(
      screen.queryByRole("heading", { name: en.auth.signupSuccessTitle }),
    ).not.toBeInTheDocument();
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
  });

  it("shows confirmation when an older signup response omits the confirmation flag", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ userId: "test-user" }),
      }),
    );
    setup();
    await screen.findByRole("heading", { name: en.auth.signupSuccessTitle });
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "SIGN UP" }),
    ).not.toBeInTheDocument();
  });

  it("shows confirmation when auto login reports an unconfirmed email", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ requiresEmailConfirmation: false }),
      }),
    );
    auth.signInWithPassword.mockResolvedValue({
      error: { code: "email_not_confirmed", message: "Email not confirmed" },
    });
    const callbacks = setup();
    await screen.findByRole("heading", { name: en.auth.signupSuccessTitle });
    expect(
      screen.queryByText("Please verify your email address before logging in."),
    ).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Your email")).not.toBeInTheDocument();
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
  });
});
