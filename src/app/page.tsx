"use client";

import { useEffect, useState } from "react";
import { format, addDays, subDays, parse, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, LogIn, Lock } from "lucide-react";
import { HabitToggle } from "@/components/ui/habit-toggle";
import { AffirmationSelector } from "@/components/ui/affirmation-selector";
import { useDailyLog } from "@/hooks/use-daily-log";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { WordOfDay } from "@/components/ui/word-of-day";
import { SongLink } from "@/components/ui/song-link";
import { AVAILABLE_ICONS } from "@/components/ui/icon-picker";
import { cn } from "@/lib/utils";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { log, updateLog, loading, user, customHabits, customAffirmations, recordExists } = useDailyLog(selectedDate);
  
  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");
  const isEditable = isToday || recordExists;

  const goToPreviousDay = () => {
    setSelectedDate((prev: string) => 
      format(subDays(parse(prev, 'yyyy-MM-dd', new Date()), 1), "yyyy-MM-dd")
    );
  };

  const goToNextDay = () => {
    setSelectedDate((prev: string) => 
      format(addDays(parse(prev, 'yyyy-MM-dd', new Date()), 1), "yyyy-MM-dd")
    );
  };

  const goToToday = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  };

  const handleToggleHabit = (habitName: string, done: boolean) => {
    if (!isEditable) return;
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
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {isToday ? "Today" : format(new Date(selectedDate), "MMM d")}
                </h1>
                {!isToday && (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={goToToday}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary transition-all hover:bg-primary/20"
                        >
                            TODAY
                        </button>
                        {!isEditable && (
                            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-500">
                                <Lock size={10} />
                                READ ONLY
                            </div>
                        )}
                    </div>
                )}
            </div>
            <p className="text-sm text-muted-foreground">
                {format(parse(selectedDate, 'yyyy-MM-dd', new Date()), "EEEE, MMMM d")}
            </p>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="mr-4 flex items-center rounded-xl bg-secondary/50 p-1">
                <button 
                    onClick={goToPreviousDay}
                    className="rounded-lg p-2 hover:bg-background transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                <button 
                    onClick={goToNextDay}
                    className="rounded-lg p-2 hover:bg-background transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
            {user ? (
                <UserAvatar />
            ) : (
                <Link href="/auth" className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                    <LogIn size={14} />
                    <span className="sr-only sm:not-sr-only">Sign In</span>
                </Link>
            )}
        </div>
      </header>

      <section className={cn("space-y-4 transition-opacity", !isEditable && "opacity-80")}>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Today's Goal</h3>
        <input
          type="text"
          value={log.today_goal || ""}
          onChange={(e) => updateLog({ today_goal: e.target.value })}
          placeholder={isEditable ? "What's your main focus today?" : "No goal set for this day."}
          disabled={!isEditable}
          className="flex h-14 w-full rounded-2xl border border-input bg-card px-5 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        />
      </section>

      <section className={cn("transition-opacity", !isEditable && "opacity-80 pointer-events-none")}>
        <AffirmationSelector 
            affirmations={customAffirmations} 
            selected={log.selected_affirmations || []} 
            onSelect={(val) => updateLog({ selected_affirmations: val })}
        />
      </section>

      <section className={cn("space-y-4 transition-opacity", !isEditable && "opacity-80")}>
        <h2 className="text-xl font-semibold tracking-tight">Daily Habits</h2>
        <div className="grid gap-3">
          {log.habits.length > 0 ? log.habits.map((habit) => {
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
          }) : (
            <p className="text-sm text-muted-foreground py-4">No habits recorded for this day.</p>
          )}
        </div>
      </section>

      <section className={cn("space-y-6 transition-opacity", !isEditable && "opacity-80")}>
         <h2 className="text-xl font-semibold tracking-tight">Evening Reflections</h2>
         <div className="space-y-6">
           <WordOfDay 
              value={log.word_of_day || ""}
              onChange={(val) => updateLog({ word_of_day: val })}
           />
           <SongLink 
              value={log.song_link || ""}
              onChange={(val) => updateLog({ song_link: val })}
              disabled={!isEditable}
           />
         </div>
      </section>
    </div>
  );
}
