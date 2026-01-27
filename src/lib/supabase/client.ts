import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Handle build time or missing env vars
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("Supabase env vars missing. Client will not function.");
    // Return a dummy object or let createBrowserClient throw?
    // createBrowserClient throws immediately if args are empty.
    // We'll pass empty strings to avoid crash, but auth won't work.
    return createBrowserClient(url || "", key || "");
  }

  return createBrowserClient(url, key);
}
