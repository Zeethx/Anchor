"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  const NAV_ITEMS = [
    { label: "Today", icon: Home, href: "/" },
    { label: "Logs", icon: Calendar, href: "/logs" },
  ];

  // Don't show on Auth page
  if (pathname.startsWith("/auth")) return null;

  const isSettingsActive = pathname === "/settings";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 px-6 pb-6 pt-2 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-all active:scale-90",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                size={24}
                className={cn("transition-all", isActive)}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium opacity-80">{item.label}</span>
            </Link>
          );
        })}
        {/* Settings link with avatar */}
        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-all active:scale-90",
            isSettingsActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {user ? (
            <>
              <UserAvatar />
              <span className="text-[10px] font-medium opacity-80">Settings</span>
            </>
          ) : (
            <>
              <Settings
                size={24}
                strokeWidth={isSettingsActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium opacity-80">Settings</span>
            </>
          )}
        </Link>
      </div>
    </nav>
  );
}
