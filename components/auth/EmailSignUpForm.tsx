import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IoArrowBack } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";
import { TfiEmail } from "react-icons/tfi";
import { GoShieldLock } from "react-icons/go";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { supabase } from "@/lib/supabase";
import { parseError } from "./auth-utils";
import SubmitButton from "./SubmitButton";
import { useLocale } from "next-intl";
import EmailSignUpConfirmation from "./EmailSignUpConfirmation";

// Define the validation schema for Email Signup using Zod
const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFields = z.infer<typeof signupSchema>;

interface EmailSignUpFormProps {
  onBack: () => void;
  onLoginClick: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Handles the registration form submission via username, email, and password credentials.
 * Shows email confirmation instructions before signing in when verification is required.
 */
export default function EmailSignUpForm({
  onBack,
  onLoginClick,
  onSuccess,
}: EmailSignUpFormProps) {
  const locale = useLocale();
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );
  // Password input visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Submission loading state
  const [loading, setLoading] = useState(false);
  // Error state from the API response
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize React Hook Form with Zod schema verification
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const showConfirmation = (email: string) => {
    setApiError(null);
    setVerificationEmail(email.trim());
    setShowPassword(false);
    setShowConfirm(false);
    reset();
  };

  // Action executed upon form submission
  const onSubmit = async (data: SignupFields) => {
    setLoading(true);
    setApiError(null);
    try {
      // Register through the public flow, preserving Supabase email confirmation.
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          username: data.username,
          locale,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setApiError(
          json.error ?? "Could not create account. Please try again.",
        );
        return;
      }

      // Only sign in automatically when the API explicitly permits it.
      if (json.requiresEmailConfirmation !== false) {
        showConfirmation(data.email);
        return;
      }

      // Automatically sign in the user after a successful signup
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (loginError) {
        if (
          loginError.code === "email_not_confirmed" ||
          /email not confirmed/i.test(loginError.message)
        ) {
          showConfirmation(data.email);
          return;
        }
        throw loginError;
      }

      // Save success flag to sessionStorage and callback the parent handler
      sessionStorage.setItem(
        "auth_success_toast",
        "Account created and logged in successfully!",
      );
      onSuccess("Account created and logged in successfully!");
    } catch (err: any) {

      console.error("Signup error:", err);
      setApiError(
        parseError(err, "Could not create account. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  if (verificationEmail) {
    return <EmailSignUpConfirmation email={verificationEmail} />;
  }

  return (
    <>
      {/* Return button back to the login view */}
      <button
        onClick={onBack}
        className="mb-8 flex w-fit cursor-pointer items-center gap-2 text-sm text-dm-text-secondary transition-colors hover:text-white"
      >
        <IoArrowBack size={16} />
        <span>Back</span>
      </button>

      {/* Title description */}
      <div className="mb-7">
        <h2 className="mb-2 text-3xl font-bold text-white">
          Create an account
        </h2>
        <p className="text-sm text-dm-text-secondary">
          Create an account and join the world of games together
        </p>
      </div>

      {/* Main Email Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* API response error alert */}
        {apiError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {apiError}
          </div>
        )}

        {/* Username input field */}
        <div className="relative">
          <div
            className={`flex h-[54px] items-center gap-3 rounded-xl border px-4 transition-all duration-200 ${
              errors.username
                ? "border-red-500/50 bg-red-500/5 focus-within:border-red-500"
                : "border-white/10 bg-[#1F2533] focus-within:border-white/30 focus-within:bg-[#252d3d]"
            }`}
          >
            <FaRegUser
              size={18}
              className={`shrink-0 ${errors.username ? "text-red-400" : "text-dm-text-secondary"}`}
            />
            <input
              type="text"
              placeholder="Username"
              {...register("username")}
              className="flex-1 bg-transparent text-sm text-white placeholder-dm-text-secondary outline-none"
            />
          </div>
          {errors.username && (
            <p className="absolute -bottom-5 left-2 text-xs text-red-400">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email input field */}
        <div className="relative">
          <div
            className={`flex h-[54px] items-center gap-3 rounded-xl border px-4 transition-all duration-200 ${
              errors.email
                ? "border-red-500/50 bg-red-500/5 focus-within:border-red-500"
                : "border-white/10 bg-[#1F2533] focus-within:border-white/30 focus-within:bg-[#252d3d]"
            }`}
          >
            <TfiEmail
              size={18}
              className={`shrink-0 ${errors.email ? "text-red-400" : "text-dm-text-secondary"}`}
            />
            <input
              type="email"
              placeholder="Your email"
              {...register("email")}
              className="flex-1 bg-transparent text-sm text-white placeholder-dm-text-secondary outline-none"
            />
          </div>
          {errors.email && (
            <p className="absolute -bottom-5 left-2 text-xs text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password input field */}
        <div className="relative">
          <div
            className={`flex h-[54px] items-center gap-3 rounded-xl border px-4 transition-all duration-200 ${
              errors.password
                ? "border-red-500/50 bg-red-500/5 focus-within:border-red-500"
                : "border-white/10 bg-[#1F2533] focus-within:border-white/30 focus-within:bg-[#252d3d]"
            }`}
          >
            <GoShieldLock
              size={18}
              className={`shrink-0 ${errors.password ? "text-red-400" : "text-dm-text-secondary"}`}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your password (min. 6 characters)"
              {...register("password")}
              className="flex-1 bg-transparent text-sm text-white placeholder-dm-text-secondary outline-none"
            />
            {/* View/Hide password toggle trigger */}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={`shrink-0 cursor-pointer transition-colors hover:text-white ${errors.password ? "text-red-400" : "text-dm-text-secondary"}`}
            >
              {showPassword ? (
                <MdOutlineVisibility size={18} />
              ) : (
                <MdOutlineVisibilityOff size={18} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="absolute -bottom-5 left-2 text-xs text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Password confirmation input field */}
        <div className="relative">
          <div
            className={`flex h-[54px] items-center gap-3 rounded-xl border px-4 transition-all duration-200 ${
              errors.confirmPassword
                ? "border-red-500/50 bg-red-500/5 focus-within:border-red-500"
                : "border-white/10 bg-[#1F2533] focus-within:border-white/30 focus-within:bg-[#252d3d]"
            }`}
          >
            <GoShieldLock
              size={18}
              className={`shrink-0 ${errors.confirmPassword ? "text-red-400" : "text-dm-text-secondary"}`}
            />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              {...register("confirmPassword")}
              className="flex-1 bg-transparent text-sm text-white placeholder-dm-text-secondary outline-none"
            />
            {/* View/Hide password confirmation toggle trigger */}
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className={`shrink-0 cursor-pointer transition-colors hover:text-white ${errors.confirmPassword ? "text-red-400" : "text-dm-text-secondary"}`}
            >
              {showConfirm ? (
                <MdOutlineVisibility size={18} />
              ) : (
                <MdOutlineVisibilityOff size={18} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="absolute -bottom-5 left-2 text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Form submission button */}
        <SubmitButton loading={loading} label="SIGN UP" />
      </form>

      {/* Toggle option to navigate back to the email login form */}
      <div className="mt-6 text-center text-sm text-dm-text-secondary">
        Already have an account?{" "}
        <button
          onClick={onLoginClick}
          className="cursor-pointer font-semibold text-[#46ca43] transition-colors hover:text-[#5de85a]"
        >
          Log In
        </button>
      </div>
    </>
  );
}
