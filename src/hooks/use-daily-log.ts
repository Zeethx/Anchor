"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export interface DailyLog {
  id?: string;
  user_id?: string;
  date: string;
  habits: Array<{ name: string; done: boolean }>;
  word_of_day: string | null;
  today_goal: string | null;
  selected_affirmations: string[];
  song_link: string | null;
  note?: string;
  created_at?: string;
}

const DEFAULT_LOG: DailyLog = {
  date: format(new Date(), "yyyy-MM-dd"),
  habits: [],
  word_of_day: null,
  today_goal: null,
  selected_affirmations: [],
  song_link: null,
};

export function useDailyLog() {
  const [log, setLog] = useState<DailyLog>(DEFAULT_LOG);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [customHabits, setCustomHabits] = useState<Array<{ name: string; icon: string }>>([]);
  const router = useRouter();
  
  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize client once
  const [supabase] = useState(() => createClient());

  // 1. Check Auth & Load Initial Data
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      setUser(user);
      
      const today = format(new Date(), "yyyy-MM-dd");

      // Fetch both habits config and today's log in parallel
      const [userRes, logRes] = await Promise.all([
        supabase.from("users").select("custom_habits").eq("id", user.id).single(),
        supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("date", today).single()
      ]);

      let habitsConfig = [];
      if (userRes.data?.custom_habits) {
        habitsConfig = userRes.data.custom_habits;
        setCustomHabits(habitsConfig);
      }
        
      if (logRes.data) {
        // Ensure habits is an array and maintain its state
        setLog({
          ...logRes.data,
          habits: Array.isArray(logRes.data.habits) ? logRes.data.habits : [],
        });
        console.log("Loaded existing log:", logRes.data);
      } else {
        // No log for today yet - initialize habits from config
        const initialHabits = habitsConfig.map((h: any) => ({
          name: h.name,
          done: false,
        }));
        
        setLog({
          ...DEFAULT_LOG,
          date: today,
          habits: initialHabits
        });
        console.log("No log found for today, initialized with defaults");
      }
      
      setLoading(false);
    }
    
    init();
  }, [supabase]);

  // 2. Sync changes to Supabase (Debounced)
  const updateLog = useCallback((updates: Partial<DailyLog>) => {
    setLog((prev) => {
        const newLog = { ...prev, ...updates };
        
        // Optimistic update done, now schedule sync
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        timeoutRef.current = setTimeout(async () => {
            if (!user) return; // Can't sync if not logged in
            
            console.log("Syncing to Supabase:", newLog);
            
            const { error } = await supabase
                .from("daily_logs")
                .upsert({
                    id: newLog.id, // Include id if it exists
                    user_id: user.id,
                    date: newLog.date,
                    habits: newLog.habits,
                    word_of_day: newLog.word_of_day,
                    today_goal: newLog.today_goal,
                    selected_affirmations: newLog.selected_affirmations,
                    song_link: newLog.song_link
                }, { onConflict: 'user_id, date' });
                
            if (error) {
                console.error("Sync error:", error);
                console.error("Error details:", JSON.stringify(error, null, 2));
            } else {
                console.log("✅ Synced to cloud successfully");
            }
            
        }, 1000); // 1 sec debounce
        
        return newLog;
    });
  }, [user, supabase]);

  return {
    log,
    updateLog,
    loading,
    user,
    customHabits, // Export this so Home can use it
    setCustomHabits, // Allow Home to update it during "Edit Habits"
    redirectToLogin: () => router.push("/auth")
  };
}
