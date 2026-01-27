"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export function UserAvatar() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  if (!user || !user.user_metadata?.avatar_url) return null;

  return (
    <img 
      src={user.user_metadata.avatar_url} 
      alt="User Avatar" 
      className="h-8 w-8 rounded-full border border-border"
    />
  );
}
