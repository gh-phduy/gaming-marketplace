import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth may be deferred for guests; subscribe before a newly loaded form logs in.
if (typeof window !== "undefined") {
  queueMicrotask(() =>
    window.dispatchEvent(new Event("difmark:auth-client-ready")),
  );
}
