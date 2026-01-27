"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LogIn } from "lucide-react";

export function AuthButton({ className }: { className?: string }) {
  const handleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
        console.error("Login error:", error.message);
        alert(`Login failed: ${error.message}`);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-xl bg-foreground px-6 py-4 font-semibold text-background transition-all active:scale-95",
        className
      )}
    >
      <LogIn size={20} />
      Sign in with Google
    </button>
  );
}
