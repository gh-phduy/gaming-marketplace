"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaRegUser } from "react-icons/fa6";
import { TfiEmail } from "react-icons/tfi";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface GooglePayload {
  id: string;
  email: string;
  name: string;
  picture: string;
  temp: boolean;
}

function decodeJwt(token: string): GooglePayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    
    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Add padding if missing
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decoder = new TextDecoder("utf-8");
    const jsonStr = decoder.decode(bytes);
    
    return JSON.parse(jsonStr) as GooglePayload;
  } catch (e) {
    console.error("JWT decode error:", e);
    return null;
  }
}

function UsernameOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<GooglePayload | null>(null);
  
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const token = searchParams.get("tempToken");
    if (!token) {
      router.replace("/signup");
      return;
    }

    const decoded = decodeJwt(token);
    if (!decoded || !decoded.temp) {
      router.replace("/signup");
      return;
    }

    setTempToken(token);
    setUserData(decoded);
    
    // Pre-fill username with name or email prefix, cleaned of special characters
    const cleanName = (decoded.name || decoded.email.split("@")[0])
      .replace(/[^a-zA-Z0-9_]/g, "")
      .slice(0, 20);
    setUsername(cleanName);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Username cannot be empty");
      return;
    }

    if (trimmed.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await fetch(`${backendApiUrl}/api/auth/register-username`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tempToken,
            username: trimmed,
          }),
        });

        const data = (await res.json()) as {
          ok?: boolean;
          token?: string;
          error?: string;
          message?: string;
        };

        if (!res.ok || !data.ok || !data.token) {
          setError(data.error || "Failed to register username");
          return;
        }

        setSuccess(data.message || "Account created successfully!");
        
        // Log in the user in our AuthContext
        login(data.token);

        // Redirect to homepage after showing success notification
        setTimeout(() => {
          router.replace("/");
        }, 1500);
      } catch (err) {
        console.error("Register username error:", err);
        setError("Network error. Please check your connection and try again.");
      }
    });
  };

  if (!userData) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#62d676]" />
      </div>
    );
  }

  return (
    <div className="flex w-[420px] flex-col gap-y-5 items-center">
      <div className="text-[24px] font-semibold text-white">Complete your profile</div>
      <span className="text-[#9ba1ab] text-[15px] text-center">
        Please choose a username to finalize your new account creation.
      </span>

      {/* Google User Preview */}
      <div className="flex w-full items-center gap-4 rounded-lg border border-white/5 bg-[#2d3748]/40 p-4">
        {userData.picture && (
          <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-[#62d676]">
            <img
              src={userData.picture}
              alt={userData.name}
              className="h-full w-full object-cover rounded-full"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold text-white">{userData.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
            <TfiEmail className="shrink-0" />
            <span className="truncate">{userData.email}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-y-5">
        {/* Username input */}
        <div className="w-full">
          <span className="text-[#F6F6F6] text-[15px] font-medium">CHOOSE USERNAME</span>
          <div className="mt-2 w-full p-4 h-[55px] bg-[#354051] flex justify-between items-center rounded-md border border-white/5 focus-within:border-[#62d676] transition-all">
            <FaRegUser size={20} className="text-[#9ba1ab] shrink-0 mr-3" />
            <Input
              className="w-full border-none focus:outline-hidden caret-[#9ba1ab] text-white p-0 bg-transparent text-[16px] h-full"
              placeholder="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex gap-2 rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#62d676] disabled:bg-[#3d6144] disabled:text-slate-400 hover:bg-[#56c96a] rounded-lg w-full h-[54px] text-[16px] font-bold text-[#111827] flex justify-center items-center gap-2 shadow-[0_0_24px_rgba(98,214,118,0.2)] transition cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}

export default function UsernameOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#62d676]" />
      </div>
    }>
      <UsernameOnboardingContent />
    </Suspense>
  );
}
