"use client";

import { useEffect, useState } from "react";
import { format, addDays, subDays, parse, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, LogIn, Lock, Settings, Pencil, Plus, StickyNote, Trash2 } from "lucide-react";
import { HabitToggle } from "@/components/ui/habit-toggle";
import { AffirmationSelector } from "@/components/ui/affirmation-selector";
import { useDailyLog } from "@/hooks/use-daily-log";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { WordOfDay } from "@/components/ui/word-of-day";
import { SongLink } from "@/components/ui/song-link";
import { AVAILABLE_ICONS } from "@/components/ui/icon-picker";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { log, updateLog, loading, user, customHabits, customAffirmations, loggedDates } = useDailyLog(selectedDate);
  const { toast } = useToast();
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  
  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");
  const isEditable = isToday;

  const goToPreviousDay = () => {
    const prevDate = format(subDays(parse(selectedDate, 'yyyy-MM-dd', new Date()), 1), "yyyy-MM-dd");
    if (loggedDates.has(prevDate) || prevDate === format(new Date(), "yyyy-MM-dd")) {
      setSelectedDate(prevDate);
    } else {
      toast("No entry found for this date", "info");
    }
  };

  const goToNextDay = () => {
    const nextDate = format(addDays(parse(selectedDate, 'yyyy-MM-dd', new Date()), 1), "yyyy-MM-dd");
    if (loggedDates.has(nextDate) || nextDate === format(new Date(), "yyyy-MM-dd")) {
      setSelectedDate(nextDate);
    } else {
      toast("No entry found for this date", "info");
    }
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
    <div className="space-y-8 pb-20">
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
            <div className="mr-4 flex items-center rounded-xl bg-transparent p-1">
                <button 
                    onClick={goToPreviousDay}
                    className="rounded-lg p-2 text-white shadow-sm hover:bg-primary/70 transition-colors border-2 border-primary/50"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="w-1" />
                <button 
                    onClick={goToNextDay}
                    className="rounded-lg p-2 text-white shadow-sm hover:bg-primary/70 transition-colors border-2 border-primary/50"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
            {user ? (
                <div />
            ) : (
                <Link href="/auth" className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                    <LogIn size={14} />
                    <span className="sr-only sm:not-sr-only">Sign In</span>
                </Link>
            )}
        </div>
      </header>

      <div className="h-px w-full bg-border/40 mb-4" />

      <section className={cn("space-y-4 transition-opacity", !isEditable && "opacity-80")}>
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">{isToday ? "Anchor for Today" : "Goal"}</h3>
            {isEditable && log.today_goal && !isEditingGoal && (
                <button 
                    onClick={() => setIsEditingGoal(true)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                >
                    <Pencil size={14} className="opacity-60" />
                </button>
            )}
        </div>
        
        {isEditingGoal || !log.today_goal ? (
            <input
                type="text"
                autoFocus={isEditingGoal}
                value={log.today_goal || ""}
                onBlur={() => setIsEditingGoal(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingGoal(false)}
                onChange={(e) => updateLog({ today_goal: e.target.value })}
                placeholder={isEditable ? "One thing worth doing today" : "No goal set for this day."}
                disabled={!isEditable}
                className="flex h-12 w-full rounded-2xl border-none bg-transparent px-0 py-2 text-base italic text-muted-foreground transition-all focus-visible:outline-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
            />
        ) : (
            <div className="pb-1 text-base text-muted-foreground leading-relaxed italic">
                {log.today_goal}
            </div>
        )}
      </section>

      <section className={cn("transition-opacity", !isEditable && "opacity-80 pointer-events-none")}>
        <AffirmationSelector 
            affirmations={customAffirmations} 
            selected={log.selected_affirmations || []} 
            onSelect={(val) => updateLog({ selected_affirmations: val })}
        />
      </section>

      <section className={cn("space-y-6 transition-opacity", !isEditable && "opacity-80")}>
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

      <section className={cn("space-y-10 transition-opacity", !isEditable && "opacity-80")}>
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Reflections</h2>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsEditingNote(!isEditingNote)}
                    className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                        "bg-primary/20 text-primary hover:bg-primary/30 active:scale-95"
                    )}
                >
                  {isEditingNote || log.note ? (
                    <Pencil size={12} className="rotate-12" />
                  ) : (
                    <Plus size={12} />
                  )}
                  {isEditingNote || log.note ? "Edit Note" : "Add Note"}
                </button>
            </div>
         </div>
         
         <div className="space-y-10">
            {(isEditingNote || log.note) && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                     <div className="flex items-center justify-between px-1">
                         <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                             <StickyNote size={16} />
                             Daily Note
                         </label>
                     </div>
                     {isEditingNote ? (
                        <div className="space-y-3">
                            <textarea 
                                autoFocus
                                value={log.note || ""}
                                onBlur={() => !log.note && setIsEditingNote(false)}
                                onChange={(e) => updateLog({ note: e.target.value })}
                                placeholder="A few honest lines."
                                className="min-h-[160px] w-full resize-none rounded-2xl border border-input bg-card p-5 text-base leading-relaxed ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-normal"
                            />
                            {log.note && (
                                <button 
                                    onClick={() => {
                                        updateLog({ note: "" });
                                        setIsEditingNote(false);
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive/50 hover:text-destructive transition-colors"
                                >
                                    <Trash2 size={12} />
                                    Delete Reflection
                                </button>
                            )}
                        </div>
                     ) : (
                         <div className="w-full whitespace-pre-wrap rounded-2xl border border-border bg-card/50 p-5 text-base leading-relaxed text-muted-foreground font-normal">
                             {log.note}
                         </div>
                     )}
                 </div>
            )}

            <WordOfDay 
               value={log.word_of_day || ""}
               onChange={(val) => updateLog({ word_of_day: val })}
               disabled={!isEditable}
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
