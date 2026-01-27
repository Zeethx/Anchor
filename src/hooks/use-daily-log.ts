"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

export interface LogHabit {
  name: string;
  done: boolean;
}

export interface CustomHabit {
  name: string;
  icon: string;
}

export interface DailyLog {
  id?: string;
  user_id?: string;
  date: string;
  habits: LogHabit[];
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

export function useDailyLog(targetDate?: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  const initialDate = targetDate || today;
  
  const [log, setLog] = useState<DailyLog>({ ...DEFAULT_LOG, date: initialDate });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [customHabits, setCustomHabits] = useState<CustomHabit[]>([]);
  const [customAffirmations, setCustomAffirmations] = useState<string[]>([]);
  const [recordExists, setRecordExists] = useState(false);
  const router = useRouter();
  
  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize client once
  const [supabase] = useState(() => createClient());

  // 1. Check Auth & Load Initial Data
  useEffect(() => {
    let channel: any = null;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      setUser(user);
      setLoading(true);

      // Fetch both habits config and today's log in parallel
      const [userRes, logRes] = await Promise.all([
        supabase.from("users").select("custom_habits, custom_affirmations").eq("id", user.id).maybeSingle(),
        supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("date", initialDate).maybeSingle()
      ]);

      const fetchedCustomHabits: CustomHabit[] = userRes.data?.custom_habits || [];
      setCustomHabits(fetchedCustomHabits);
      
      if (userRes.data?.custom_affirmations) {
        setCustomAffirmations(userRes.data.custom_affirmations);
      } else {
        // Default affirmations if none set
        setCustomAffirmations([
          "I am disciplined and focused.",
          "I build quietly and consistently.",
          "Action over anxiety.",
          "One step at a time.",
          "Progress, not perfection.",
        ]);
      }
        
      if (logRes.data) {
        setRecordExists(true);
        // Merge config habits into existing log habits if any are missing
        const existingHabits: LogHabit[] = Array.isArray(logRes.data.habits) ? logRes.data.habits : [];
        const existingHabitNames = new Set(existingHabits.map((h: LogHabit) => h.name));
        
        const newHabitsFromConfig = fetchedCustomHabits
          .filter((h: CustomHabit) => !existingHabitNames.has(h.name))
          .map((h: CustomHabit) => ({ name: h.name, done: false }));

        setLog({
          ...logRes.data,
          habits: [...existingHabits, ...newHabitsFromConfig],
        });
        console.log(`Loaded log for ${initialDate} with merged habits:`, logRes.data);
      } else {
        setRecordExists(false);
        // No log for today yet - initialize habits from config
        const initialHabits: LogHabit[] = fetchedCustomHabits.map((h: CustomHabit) => ({
          name: h.name,
          done: false,
        }));
        
        setLog({
          ...DEFAULT_LOG,
          date: initialDate,
          habits: initialHabits
        });
        console.log(`No log found for ${initialDate}, initialized with defaults`);
      }
      
      // Subscribe to custom habits changes in real-time
      channel = supabase
        .channel(`public:users:id=eq.${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "users",
            filter: `id=eq.${user.id}`,
          },
          (payload: any) => {
            console.log("🔄 User preferences updated from Supabase:", payload.new);
            
            if (payload.new?.custom_habits) {
              setCustomHabits(payload.new.custom_habits);
              // Also update today's log with new habits
              setLog((prev) => {
                const existingHabitNames = new Set(prev.habits.map((h: any) => h.name));
                const newHabits = payload.new.custom_habits
                  .filter((h: any) => !existingHabitNames.has(h.name))
                  .map((h: any) => ({ name: h.name, done: false }));
                
                if (newHabits.length > 0) {
                  console.log("📝 Adding new habits to log:", newHabits);
                  return {
                    ...prev,
                    habits: [...prev.habits, ...newHabits]
                  };
                }
                return prev;
              });
            }

            if (payload.new?.custom_affirmations) {
              setCustomAffirmations(payload.new.custom_affirmations);
            }
          }
        )
        .subscribe((status) => {
          console.log("📡 Subscription status:", status);
        });
      
      setLoading(false);
    }
    
    init();

    // Cleanup function
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [supabase, initialDate]);

  // 2. Sync changes to Supabase (Debounced)
  const updateLog = useCallback((updates: Partial<DailyLog>) => {
    setLog((prev) => {
        const newLog = { ...prev, ...updates };
        
        // Optimistic update done, now schedule sync
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        // Safety: Only allow syncing Today or existing past logs
        const isEditable = newLog.date === today || recordExists;
        if (!isEditable) {
            console.log("Read-only mode: Skipping cloud sync");
            return newLog;
        }

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
  }, [user, supabase, today, recordExists]);

  return {
    log,
    updateLog,
    loading,
    user,
    customHabits,
    customAffirmations,
    recordExists,
    setCustomHabits,
    setCustomAffirmations,
    redirectToLogin: () => router.push("/auth")
  };
}
