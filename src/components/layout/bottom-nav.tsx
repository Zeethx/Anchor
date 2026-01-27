"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Today", icon: Home, href: "/" },
    { label: "Logs", icon: Calendar, href: "/logs" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  // Don't show on Auth page
  if (pathname.startsWith("/auth")) return null;

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
      </div>
    </nav>
  );
}
