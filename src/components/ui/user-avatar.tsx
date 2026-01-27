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

  const [imgSrc, setImgSrc] = useState<string>("/logo.png");

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setImgSrc(user.user_metadata.avatar_url);
    }
  }, [user]);

  return (
    <img 
      src={imgSrc} 
      alt="User" 
      onError={() => setImgSrc("/logo.png")}
      className="h-8 w-8 rounded-full border border-border bg-background object-cover"
    />
  );
}
