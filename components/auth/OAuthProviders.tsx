"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaTwitch, FaMicrosoft } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import SocialButton from "./SocialButton";
import { useLocale, useTranslations } from "next-intl";
import { parseError } from "./auth-utils";

interface OAuthProvidersProps {
  onEmailClick: () => void;
  onShowToast: (msg: string, type: "success" | "warning") => void;
}

/**
 * Renders the third-party OAuth providers list (Google, Facebook, Twitch, etc.).
 * Includes a primary Google Sign-in button and options to switch to Email/password authentication.
 */
export default function OAuthProviders({ onEmailClick, onShowToast }: OAuthProvidersProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Handles Google OAuth sign-in flow
  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo: `${window.location.origin}/${locale}`
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google sign in error:", err);
      onShowToast(parseError(err, "Unable to sign in with Google. Please try again."), "warning");
      setIsGoogleLoading(false);
    }
  };

  // Handles clicks on currently unavailable third-party login providers
  const handleUnavailableClick = () => {
    onShowToast(
      t("providerUnavailable"),
      "warning"
    );
  };

  return (
    <>
      {/* Title & Subtitle */}
      <div className="mb-10">
        <h2 className="mb-3 text-3xl font-bold text-white">Log in to your account</h2>
        <p className="text-sm text-dm-text-secondary">
          Login to your account and join the world of games together
        </p>
      </div>

      {/* Main Google sign-in button */}
      <Button
        variant="default"
        className="mb-8 flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-white text-base font-bold text-black transition-all hover:bg-gray-200"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        aria-busy={isGoogleLoading}
      >
        <FcGoogle className="h-6 w-6" />
        <span>{isGoogleLoading ? tCommon("loading") : "Log in with Google"}</span>
      </Button>

      {/* Separator line */}
      <div className="mb-8 h-px w-full bg-white/10" />

      {/* Secondary sign-in buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Toggle email login form view */}
        <Button
          variant="outline"
          className="group flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border-none bg-[#1F2533] font-medium text-dm-text-secondary transition-all duration-300 hover:bg-[#2A3140] hover:text-white"
          onClick={onEmailClick}
        >
          <MdEmail
            className="text-dm-text-secondary transition-colors group-hover:text-white"
            size={20}
          />
          <span>Email</span>
        </Button>

        {/* Facebook login wrapper */}
        <SocialButton
          icon={
            <FaFacebook 
              className="text-dm-text-secondary transition-colors group-hover:text-[#1877F2]" 
              size={20} 
            />
          }
          label="Facebook"
          onClick={handleUnavailableClick}
        />

        {/* Twitch login wrapper */}
        <SocialButton
          icon={
            <FaTwitch 
              className="text-dm-text-secondary transition-colors group-hover:text-[#9146FF]" 
              size={20} 
            />
          }
          label="Twitch"
          onClick={handleUnavailableClick}
        />

        {/* Microsoft login wrapper */}
        <SocialButton
          icon={
            <FaMicrosoft 
              className="text-dm-text-secondary transition-colors group-hover:text-[#00A4EF]" 
              size={20} 
            />
          }
          label="Microsoft"
          onClick={handleUnavailableClick}
        />
      </div>
    </>
  );
}
