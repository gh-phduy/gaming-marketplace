import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { defaultLocale, locales } from "@/i18n/config";
import confirmationCopy from "@/supabase/email-templates/confirmation-copy.json";

/* ==========================================================================
   SERVER-SIDE SIGNUP ROUTE
   Uses Supabase's public signup flow and honors its email confirmation policy.
   ========================================================================== */

const signupSchema = z.object({
  email: z.string().trim().email().max(255).toLowerCase(),
  password: z.string().min(6),
  username: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  locale: z.enum(locales).default(defaultLocale),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, password, username, locale } = parsed.data;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !publicKey) {
      return NextResponse.json(
        { error: "Email registration is unavailable. Please try again later." },
        { status: 500 },
      );
    }

    const client = createClient(url, publicKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: new URL(`/${locale}`, req.nextUrl.origin).toString(),
        data: {
          locale,
          confirmation_subject: confirmationCopy[locale].subject,
          display_name: username,
          username: username,
          full_name: username,
          avatar_url: "/avt-placeholder.jpg",
        },
      },
    });

    if (error) {
      const errMsg = error.message || JSON.stringify(error);

      // Handle duplicate email gracefully
      if (
        errMsg.toLowerCase().includes("already been registered") ||
        errMsg.toLowerCase().includes("already exists")
      ) {
        return NextResponse.json(
          {
            error:
              "An account with this email already exists. Please log in instead.",
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: errMsg },
        { status: error.status === 429 ? 429 : 400 },
      );
    }

    return NextResponse.json(
      { requiresEmailConfirmation: !data.session },
      { status: 201 },
    );
  } catch (err: any) {

    console.error("❌ Signup route crash:", err);
    return NextResponse.json(
      { error: err?.message || "Server error. Please try again." },
      { status: 500 },
    );
  }
}
