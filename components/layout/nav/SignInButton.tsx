"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import AccountAvatar from "@/components/auth/AccountAvatar";

function AccountLoading() {
  const t = useTranslations("nav");
  return (
    <div
      aria-busy="true"
      role="status"
      className="flex h-10 w-10 shrink-0 items-center justify-center"
    >
      <AccountAvatar />
      <span className="sr-only">{t("signIn")}</span>
    </div>
  );
}

const SignIn = dynamic(() => import("@/components/auth/SignIn"), {
  loading: AccountLoading,
});
const UserMenu = dynamic(() => import("@/components/auth/UserMenu"), {
  loading: AccountLoading,
});

export default function SignInButton() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-start 770:w-28">
      {isLoading ? (
        <AccountLoading />
      ) : user ? (
        <UserMenu user={user} />
      ) : (
        <SignIn triggerClassName="flex h-10 w-full shrink-0 cursor-pointer items-center justify-start rounded-lg border-none bg-transparent text-dm-text-secondary transition-colors hover:text-dm-text-primary focus-visible:ring-2 focus-visible:ring-state-focus focus-visible:outline-none [&>svg]:h-10 [&>svg]:w-10 [&>svg]:p-2" />
      )}
    </div>
  );
}
