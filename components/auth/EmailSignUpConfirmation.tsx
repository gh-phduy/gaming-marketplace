import { CircleCheck, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export default function EmailSignUpConfirmation({ email }: { email: string }) {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex w-full flex-col items-center gap-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#63c54c]/30 bg-[#63c54c]/10 text-[#63c54c]">
          <CircleCheck size={44} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-3xl leading-tight font-bold text-white">
            {t("signupSuccessTitle")}
          </h2>
          <p className="mt-3 text-base font-semibold text-[#63c54c]">
            {t("checkEmailTitle")}
          </p>
        </div>
        <div className="w-full rounded-xl border border-[#63c54c]/20 bg-[#63c54c]/5 p-5">
          <Mail
            size={22}
            className="mx-auto mb-3 text-[#63c54c]"
            aria-hidden="true"
          />
          <p className="text-sm leading-6 break-words text-dm-text-secondary">
            {t("checkEmailDescription", { email })}
          </p>
        </div>
      </div>
    </div>
  );
}
