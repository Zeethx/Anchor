"use client";

import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { HabitToggle } from "@/components/ui/habit-toggle";
import { AffirmationSelector } from "@/components/ui/affirmation-selector";
import { useDailyLog } from "@/hooks/use-daily-log";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { WordOfDay } from "@/components/ui/word-of-day";
import { SongLink } from "@/components/ui/song-link";
import { createClient } from "@/lib/supabase/client";
import { AVAILABLE_ICONS } from "@/components/ui/icon-picker";


export default function Home() {
  const { log, updateLog, loading, user, customHabits } = useDailyLog();
  const [customAffirmations, setCustomAffirmations] = useState<string[]>([]);
  
  const supabase = createClient();

  // Load custom affirmations from user profile
  useEffect(() => {
    async function loadCustomData() {
      if (!user) {
        // Set defaults for non-logged-in users
        setCustomAffirmations([
          "I am disciplined and focused.",
          "I build quietly and consistently.",
          "Action over anxiety.",
          "One step at a time.",
          "Progress, not perfection.",
        ]);
        return;
      }
      
      const { data } = await supabase
        .from("users")
        .select("custom_affirmations")
        .eq("id", user.id)
        .single();
      
      if (data?.custom_affirmations && data.custom_affirmations.length > 0) {
        setCustomAffirmations(data.custom_affirmations);
      } else {
        // Fallback to defaults if none found
        setCustomAffirmations([
          "I am disciplined and focused.",
          "I build quietly and consistently.",
          "Action over anxiety.",
          "One step at a time.",
          "Progress, not perfection.",
        ]);
      }
    }
    
    loadCustomData();
  }, [user, supabase]);

  const handleToggleHabit = (habitName: string, done: boolean) => {
    const updatedHabits = log.habits.map(h =>
      h.name === habitName ? { ...h, done } : h
    );
    updateLog({ habits: updatedHabits });
  };

  const getIconComponent = (iconName: string) => {
    const icon = AVAILABLE_ICONS.find(i => i.name === iconName);
    return icon ? icon.Icon : AVAILABLE_ICONS[0].Icon;
  };

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex items-center justify-between py-2">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-foreground">Today</h1>
           <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        
        {user ? (
            <UserAvatar />
        ) : (
            <Link href="/auth" className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                <LogIn size={14} />
                <span className="sr-only sm:not-sr-only">Sign In</span>
            </Link>
        )}
      </header>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Today's Goal</h3>
        <input
          type="text"
          value={log.today_goal || ""}
          onChange={(e) => updateLog({ today_goal: e.target.value })}
          placeholder="What's your main focus today?"
          className="flex h-14 w-full rounded-2xl border border-input bg-card px-5 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        />
      </section>

      <section>
        <AffirmationSelector 
            affirmations={customAffirmations} 
            selected={log.selected_affirmations || []} 
            onSelect={(val) => updateLog({ selected_affirmations: val })}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Daily Habits</h2>
        <div className="grid gap-3">
          {log.habits.map((habit) => {
            const habitConfig = customHabits.find(h => h.name === habit.name);
            const IconComponent = getIconComponent(habitConfig?.icon || 'dumbbell');
            return (
              <HabitToggle 
                key={habit.name}
                label={habit.name}
                icon={IconComponent}
                checked={habit.done}
                onChange={(val) => handleToggleHabit(habit.name, val)}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
         <h2 className="text-xl font-semibold tracking-tight">Evening Reflections</h2>
         <div className="space-y-6">
           <WordOfDay 
              value={log.word_of_day || ""}
              onChange={(val) => updateLog({ word_of_day: val })}
           />
           <SongLink 
              value={log.song_link || ""}
              onChange={(val) => updateLog({ song_link: val })}
           />
         </div>
      </section>
    </div>
  );
}
