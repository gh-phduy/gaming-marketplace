"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PiSignInBold as SignInIcon } from "react-icons/pi";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import the sub-components
const OAuthProviders = dynamic(() => import("./OAuthProviders"));
const EmailLoginForm = dynamic(() => import("./EmailLoginForm"));
const EmailSignUpForm = dynamic(() => import("./EmailSignUpForm"));

import { useTranslations } from "next-intl";

type AuthView = "providers" | "email-login" | "email-signup";

/**
 * Main SignIn Modal Dialog container component.
 * Responsible for orchestrating:
 * - Opening and closing of the dialog modal.
 * - Transitioning views (OAuth, Login, Signup) with slide animations.
 * - Active UI Toast notifications for success alerts.
 */
export default function SignIn({
  triggerClassName,
  initialOpen = false,
}: {
  triggerClassName?: string;
  initialOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [view, setView] = useState<AuthView>("providers");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warning";
  } | null>(null);
  const t = useTranslations("nav");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleOpenLogin = () => setIsOpen(true);
    window.addEventListener("difmark:open-login", handleOpenLogin);
    return () => {
      window.removeEventListener("difmark:open-login", handleOpenLogin);
    };
  }, []);

  // Displays the toast message for 4 seconds then auto-hides
  const showToast = (msg: string, type: "success" | "warning" = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Listens for external redirects or page reloads with active success toast messages
  useEffect(() => {
    const msg = sessionStorage.getItem("auth_success_toast");
    if (msg) {
      showToast(msg, "success");
      sessionStorage.removeItem("auth_success_toast");
    }
  }, []);

  // Resets views and toast alerts when the dialog modal is closed
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setView("providers");
      }, 300);
    }
  };

  // Navigates between auth sub-views
  const goTo = (v: AuthView) => {
    setView(v);
  };

  // Invoked upon successful authentication events from sub-components
  const handleSuccess = (msg: string) => {
    showToast(msg, "success");
    setIsOpen(false);
  };

  // Builds CSS transition styling for sliding panels during view changes
  const slide = (activeView: AuthView) => ({
    opacity: view === activeView ? 1 : 0,
    transform:
      view === activeView
        ? "translateX(0)"
        : view === "providers"
          ? "translateX(60px)"
          : "translateX(-60px)",
    pointerEvents: (view === activeView
      ? "auto"
      : "none") as React.CSSProperties["pointerEvents"],
    transition: "opacity 400ms ease, transform 400ms ease",
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {/* Trigger button to open the modal */}
        <DialogTrigger
          aria-label={t("signIn")}
          title={t("signIn")}
          onClick={() => setIsOpen(true)}
          className={
            triggerClassName ??
            "flex cursor-pointer items-center gap-x-2 border-none bg-transparent px-2 py-4 text-dm-text-secondary outline-hidden transition-colors duration-500 hover:text-dm-text-primary"
          }
        >
          <SignInIcon size={24} className="shrink-0" aria-hidden="true" />
          <span className="hidden min-w-0 truncate 770:block">
            {t("signIn").toUpperCase()}
          </span>
        </DialogTrigger>

        {/* Modal Dialog Content Panel */}
        <DialogContent
          showCloseButton={true}
          className="data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-[100%] data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-[100%] w-full max-w-[950px] gap-0 overflow-hidden border-dm-border-subtle bg-surface-base p-0 duration-1000 ease-out sm:rounded-3xl"
        >
          <DialogTitle className="sr-only">Sign In</DialogTitle>
          <DialogDescription className="sr-only">
            Login to your account and join the world of games together
          </DialogDescription>

          <div className="grid h-[100dvh] grid-cols-1 md:h-auto md:min-h-[680px] md:grid-cols-2">
            {/* Left Column: Cover Hero Art */}
            <div className="relative hidden h-full w-full overflow-hidden md:block">
              <Image
                src="/modal-animate-bg.jpg"
                alt="Modal Background"
                fill
                className="object-cover"
                priority
              />
              <Image
                src="/modal-hero.webp"
                alt="Sign In Hero"
                fill
                className="z-10 object-cover"
                priority
              />
              <div className="absolute inset-0 z-20 bg-linear-to-t from-surface-base/80 to-transparent" />

              <div className="absolute right-8 bottom-12 left-8 z-30 rounded-2xl border border-white/10 bg-surface-base/40 p-6 backdrop-blur-md">
                <h3 className="mb-2 text-xl font-bold text-white">
                  Get your Cashback
                </h3>
                <p className="text-sm leading-relaxed text-dm-text-secondary">
                  Log in and get up to{" "}
                  <span className="font-bold text-white">10%</span> cashback!
                </p>
              </div>
            </div>

            {/* Right Column: Sliding auth forms container */}
            <div className="relative flex flex-col justify-center overflow-hidden bg-[#161b26]">
              {/* VIEW 1: Providers list (OAuth, Email navigation option) */}
              <div
                className="absolute inset-0 overflow-y-auto p-8 pt-16 md:p-12"
                style={slide("providers")}
              >
                <div className="flex min-h-full flex-col justify-center">
                  <OAuthProviders
                    onEmailClick={() => goTo("email-login")}
                    onShowToast={showToast}
                  />
                </div>
              </div>

              {/* VIEW 2: Email Login Form */}
              <div
                className="absolute inset-0 overflow-y-auto p-8 pt-16 md:p-12"
                style={slide("email-login")}
              >
                <div className="flex min-h-full flex-col justify-center">
                  <EmailLoginForm
                    key={isOpen ? "login-open" : "login-closed"}
                    onBack={() => goTo("providers")}
                    onSignUpClick={() => goTo("email-signup")}
                    onSuccess={handleSuccess}
                  />
                </div>
              </div>

              {/* VIEW 3: Email Sign Up Form */}
              <div
                className="absolute inset-0 overflow-y-auto p-8 pt-16 md:p-12"
                style={slide("email-signup")}
              >
                <div className="flex min-h-full flex-col justify-center">
                  <EmailSignUpForm
                    key={isOpen ? "signup-open" : "signup-closed"}
                    onBack={() => goTo("email-login")}
                    onLoginClick={() => goTo("email-login")}
                    onSuccess={handleSuccess}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dynamic typed notification popup toast */}
      {toast &&
        mounted &&
        createPortal(
          <div
            className={`fixed top-6 left-1/2 z-[99999] flex w-[calc(100%-2rem)] max-w-[360px] -translate-x-1/2 items-center justify-between gap-3 rounded-xl border sm:right-6 sm:left-auto sm:w-80 sm:translate-x-0 ${
              toast.type === "success"
                ? "border-[#46ca43]/30"
                : "border-yellow-500/30"
            } animate-in fade-in slide-in-from-top-4 bg-[#161b26]/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md duration-300`}
          >
            <span className="inline-flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  toast.type === "success"
                    ? "bg-[#46ca43]/20 text-[#46ca43]"
                    : "bg-yellow-500/20 text-yellow-500"
                }`}
              >
                {toast.type === "success" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-[14px] font-bold">!</span>
                )}
              </span>
              <span className="font-medium text-gray-200">{toast.message}</span>
            </span>
            <button
              type="button"
              className="cursor-pointer text-gray-400 transition-colors hover:text-white"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
