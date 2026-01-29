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
  habits: Array<{ name: string; done: boolean; status?: 'done' | 'pending' | 'skipped' }>;
  word_of_day: string | null;
  today_goal: string | null;
  selected_affirmations: string[];
  song_link: string | null;
  note?: string;
  mood?: number | null; // 0-4
  created_at?: string;
}

const DEFAULT_LOG: DailyLog = {
  date: format(new Date(), "yyyy-MM-dd"),
  habits: [],
  word_of_day: null,
  today_goal: null,
  selected_affirmations: [],
  song_link: null,
  mood: null,
};

import { useUser } from "@/components/providers/user-provider";

export function useDailyLog(selectedDate: string) {
  const [log, setLog] = useState<DailyLog>(DEFAULT_LOG);
  const [loading, setLoading] = useState(true);
  const { user, supabase, loading: authLoading } = useUser();
  const [customHabits, setCustomHabits] = useState<Array<{ name: string; icon: string; skippable?: boolean }>>([]);
  const [customAffirmations, setCustomAffirmations] = useState<string[]>([]);
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const router = useRouter();
  
  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load Initial Data when user is available
  useEffect(() => {
    let channel: any = null;

    async function init() {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);

      // Fetch user config, the specific log, AND all dates with logs
      const [userRes, logRes, allLogsRes] = await Promise.all([
        supabase.from("users").select("custom_habits, custom_affirmations").eq("id", user.id).maybeSingle(),
        supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("date", selectedDate).maybeSingle(),
        supabase.from("daily_logs").select("date").eq("user_id", user.id)
      ]);


      if (userRes.data?.custom_habits) {
        setCustomHabits(userRes.data.custom_habits);
      }
      
      if (userRes.data?.custom_affirmations) {
        setCustomAffirmations(userRes.data.custom_affirmations);
      } else {
        setCustomAffirmations([
          "I am disciplined and focused.",
          "I build quietly and consistently.",
          "Action over anxiety.",
          "One step at a time.",
          "Progress, not perfection.",
        ]);
      }

      if (allLogsRes.data) {
        setLoggedDates(new Set(allLogsRes.data.map((l: any) => l.date)));
      }
        
      if (logRes.data) {
        const existingLog = logRes.data;
        const dbHabits = Array.isArray(existingLog.habits) ? existingLog.habits : [];
        const habitsToUse = userRes.data?.custom_habits || [];
        
        // Merge habits: Keep existing status for habits that still exist
        const mergedHabits = habitsToUse.map((h: any) => {
          const existing = dbHabits.find((eh: any) => eh.name === h.name);
          if (existing) {
            // Ensure status exists if it was older format
            return { 
              ...existing, 
              status: existing.status || (existing.done ? 'done' : 'pending') 
            };
          }
          return { name: h.name, done: false, status: 'pending' };
        });

        setLog({
          ...existingLog,
          habits: mergedHabits,
        });
        console.log(`Loaded and merged log for ${selectedDate}:`, mergedHabits);
      } else {
        const habitsToUse = userRes.data?.custom_habits || [];
        const initialHabits = habitsToUse.map((h: any) => ({
          name: h.name,
          done: false,
        }));
        
        setLog({
          ...DEFAULT_LOG,
          date: selectedDate,
          habits: initialHabits
        });
        console.log(`No log found for ${selectedDate}, initialized with defaults.`);
      }
      
      // Real-time subscription for user preferences
      channel = supabase
        .channel(`public:users:id=eq.${user.id}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${user.id}` },
          (payload: any) => {
            if (payload.new?.custom_habits) setCustomHabits(payload.new.custom_habits);
            if (payload.new?.custom_affirmations) setCustomAffirmations(payload.new.custom_affirmations);
          }
        )
        .subscribe();
      
      setLoading(false);
    }
    
    init();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [supabase, selectedDate, user, authLoading]);


  // 2. Sync changes to Supabase (Debounced)
  const updateLog = useCallback((updates: Partial<DailyLog>) => {
    setLog((prev) => {
        const newLog = { ...prev, ...updates };
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        timeoutRef.current = setTimeout(async () => {
            if (!user) return;
            
            console.log("Syncing to Supabase:", newLog);
            
            const { error } = await supabase
                .from("daily_logs")
                .upsert({
                    id: newLog.id,
                    user_id: user.id,
                    date: newLog.date,
                    habits: newLog.habits,
                    word_of_day: newLog.word_of_day,
                    today_goal: newLog.today_goal,
                    selected_affirmations: newLog.selected_affirmations,
                    song_link: newLog.song_link,
                    note: newLog.note,
                    mood: newLog.mood
                }, { onConflict: 'user_id, date' });
                
            if (error) {
                console.error("Sync error:", error);
            } else {
                console.log("✅ Synced successfully");
                // Update loggedDates if it's a new entry
                setLoggedDates(prev => new Set([...prev, newLog.date]));
            }
            
        }, 1000);
        
        return newLog;
    });
  }, [user, supabase]);

  return {
    log,
    updateLog,
    loading,
    user,
    customHabits,
    customAffirmations,
    loggedDates,
    redirectToLogin: () => router.push("/auth")
  };
}
