"use client";

import { useEffect, useState, useRef } from "react";
import { format, addDays, subDays, parse, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, LogIn, Lock, Settings, Pencil, Plus, StickyNote, Trash2, Check, CircleOff } from "lucide-react";
import { HabitToggle } from "@/components/ui/habit-toggle";
import { AffirmationSelector } from "@/components/ui/affirmation-selector";
import { useDailyLog } from "@/hooks/use-daily-log";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { WordOfDay } from "@/components/ui/word-of-day";
import { SongLink } from "@/components/ui/song-link";
import { AVAILABLE_ICONS } from "@/components/ui/icon-picker";
import { cn } from "@/lib/utils";
import { LandingPage } from "@/components/ui/landing-page";
import { HomeSkeleton } from "@/components/ui/skeleton";
// import { OnboardingGuide } from "@/components/ui/onboarding-guide";
import { differenceInCalendarDays } from "date-fns";
import { useToast } from "@/components/ui/toast";


export default function Home() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { log, updateLog, loading, user, customHabits: _customHabits, customAffirmations, loggedDates } = useDailyLog(selectedDate);
  const customHabits = _customHabits as Array<{ name: string; icon: string; skippable?: boolean }>;
  const { toast } = useToast();
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [activeHabitModal, setActiveHabitModal] = useState<{name: string, status: string} | null>(null);
  
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
    return <HomeSkeleton />;
  }


  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-40 pt-6 space-y-8 min-h-screen">
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-5">
            <MoodSelector 
                value={log.mood ?? null} 
                onChange={(val) => updateLog({ mood: val })}
                disabled={!isEditable}
            />
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
            <h3 className="text-xl font-semibold tracking-tight text-foreground">{isToday ? "Today's Anchor" : "Goal"}</h3>
            {isEditable && log.today_goal && !isEditingGoal && (
                <button 
                    onClick={() => setIsEditingGoal(true)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                >
                    <Pencil size={14} className="opacity-60" />
                </button>
            )}
        </div>
        
        <div className="rounded-xl border border-border bg-card/50 p-4 transition-all">
          {isEditingGoal || !log.today_goal ? (
              <input
                  type="text"
                  autoFocus={isEditingGoal}
                  value={log.today_goal || ""}
                  onBlur={() => setIsEditingGoal(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingGoal(false)}
                  onChange={(e) => updateLog({ today_goal: e.target.value })}
                  placeholder={isEditable ? "One thing that matters today" : "No goal set for this day."}
                  disabled={!isEditable}
                  className="flex h-8 w-full border-none bg-transparent px-0 text-base italic text-muted-foreground transition-all focus-visible:outline-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
              />
          ) : (
              <div className="text-base text-foreground leading-relaxed font-medium italic">
                  "{log.today_goal}"
              </div>
          )}
        </div>
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
                icon={getIconComponent(habitConfig?.icon || "dumbbell")}
                status={(habit.status || (habit.done ? 'done' : 'pending')) as 'done' | 'pending' | 'skipped'}
                onClick={() => {
                  if (!isEditable) return;
                  if (habitConfig?.skippable) {
                    setActiveHabitModal({ name: habit.name, status: habit.status || (habit.done ? 'done' : 'pending') });
                  } else {
                    const isCurrentlyDone = habit.status === 'done' || (!habit.status && habit.done);
                    const newVal = !isCurrentlyDone;
                    const updatedHabits = log.habits.map(h =>
                      h.name === habit.name ? { ...h, done: newVal, status: (newVal ? 'done' : 'pending') as 'done' | 'pending' | 'skipped' } : h
                    );
                    updateLog({ habits: updatedHabits });
                  }
                }}
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
         </div>
         
         <div className="space-y-10">
             <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <StickyNote size={16} />
                          Daily Note
                      </label>
                      {isEditable && (
                        <button 
                            onClick={() => setIsEditingNote(!isEditingNote)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                                "bg-primary/10 text-primary hover:bg-primary/20 active:scale-95"
                            )}
                        >
                          {isEditingNote ? (
                            <Check size={12} />
                          ) : (
                            <Pencil size={12} className="rotate-12" />
                          )}
                          {isEditingNote ? "Done" : "Edit"}
                        </button>
                      )}
                  </div>
                  {(isEditingNote || !log.note) && isEditable ? (
                     <div className="space-y-3">
                         <textarea 
                             autoFocus={isEditingNote}
                             value={log.note || ""}
                             onChange={(e) => updateLog({ note: e.target.value })}
                             placeholder="Reflect on your day..."
                             className="min-h-[80px] w-full resize-none rounded-2xl border border-input bg-card p-5 text-base leading-relaxed ring-offset-background placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10 transition-all font-normal shadow-sm"
                         />
                         {log.note && isEditingNote && (
                             <button 
                                 onClick={() => {
                                     updateLog({ note: "" });
                                     setIsEditingNote(false);
                                 }}
                                 className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive/50 hover:text-destructive transition-colors"
                             >
                                 <Trash2 size={12} />
                                 Discard Note
                             </button>
                         )}
                     </div>
                  ) : (
                      <div className={cn(
                        "w-full whitespace-pre-wrap rounded-2xl border border-border bg-card p-5 text-base leading-relaxed font-medium transition-all",
                        log.note ? "text-foreground" : "text-muted-foreground italic opacity-40 text-center py-10"
                      )}>
                          {log.note || "No reflection shared for this day."}
                      </div>
                  )}
              </div>

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
      {activeHabitModal && (
        <HabitSelectionModal 
            habitName={activeHabitModal.name}
            currentStatus={activeHabitModal.status as any}
            onSelect={(newStatus) => {
                const updatedHabits = log.habits.map(h =>
                    h.name === activeHabitModal.name 
                        ? { ...h, done: newStatus === 'done', status: newStatus as any } 
                        : h
                );
                updateLog({ habits: updatedHabits });
                setActiveHabitModal(null);
            }}
            onClose={() => setActiveHabitModal(null)}
        />
      )}
    </div>
  );
}
interface MoodSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const MOODS = [
  { value: 4, label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500/10", image: "/Excellent.png" },
  { value: 3, label: "Good", color: "text-blue-500", bg: "bg-blue-500/10", image: "/Good.png" },
  { value: 2, label: "Neutral", color: "text-amber-500", bg: "bg-amber-500/10", image: "/Neutral.png" },
  { value: 1, label: "Bad", color: "text-orange-500", bg: "bg-orange-500/10", image: "/Bad.png" },
  { value: 0, label: "Awful", color: "text-red-500", bg: "bg-red-500/10", image: "/Awful.png" },
];

function MoodSelector({ value, onChange, disabled }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedMood = MOODS.find(m => m.value === value);

  return (
    <>
      <button
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full transition-all active:scale-95",
          selectedMood 
            ? "ring-2 ring-primary/20 ring-offset-2 ring-offset-background" 
            : "bg-muted/10 text-muted-foreground/30 border-2 border-dashed border-muted-foreground/20 hover:bg-muted/20"
        )}
      >
        {selectedMood ? (
          <img src={selectedMood.image} alt={selectedMood.label} className="h-full w-full object-contain" />
        ) : (
          <span className="text-3xl">😶</span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 px-6">
            <div 
                className="w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-border/50 bg-background shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            >
                <div className="p-8 text-center border-b bg-muted/20">
                    <h3 className="text-2xl font-bold tracking-tight">How's your spirit?</h3>
                    <p className="text-sm text-muted-foreground mt-2">Anchor your current mood</p>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-5 gap-4">
                        {MOODS.map((mood) => (
                            <button
                                key={mood.value}
                                onClick={() => {
                                    onChange(mood.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "group relative flex flex-col items-center gap-2 transition-all hover:scale-110 active:scale-90",
                                    value === mood.value ? "opacity-100" : "opacity-40 hover:opacity-100"
                                )}
                            >
                                <div className={cn(
                                    "flex h-14 w-14 items-center justify-center rounded-full transition-all",
                                    value === mood.value ? "ring-4 ring-primary/20 bg-primary/5" : "bg-muted/50"
                                )}>
                                    <img src={mood.image} alt={mood.label} className="h-10 w-10 object-contain" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {mood.label}
                                </span>
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="mt-10 w-full flex h-14 items-center justify-center rounded-2xl bg-muted font-bold text-muted-foreground transition-all hover:bg-muted/80 active:scale-95"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}

function HabitSelectionModal({ habitName, currentStatus, onSelect, onClose }: { 
    habitName: string, 
    currentStatus: 'done' | 'pending' | 'skipped',
    onSelect: (status: 'done' | 'pending' | 'skipped') => void,
    onClose: () => void 
}) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-6">
            <div 
                className="w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-border/50 bg-background shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
            >
                <div className="p-8 text-center border-b bg-muted/20">
                    <h3 className="text-2xl font-bold tracking-tight">{habitName}</h3>
                    <p className="text-sm text-muted-foreground mt-2">Daily Ritual Update</p>
                </div>
                <div className="p-6 grid gap-4">
                    <button 
                        onClick={() => onSelect('done')}
                        className={cn(
                            "flex h-16 items-center justify-center gap-3 rounded-[1.25rem] font-bold transition-all active:scale-[0.98] shadow-sm",
                            currentStatus === 'done' ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                    >
                        <Check size={22} />
                        MARK AS DONE
                    </button>
                    <button 
                        onClick={() => onSelect('skipped')}
                        className={cn(
                            "flex h-16 items-center justify-center gap-3 rounded-[1.25rem] font-bold transition-all active:scale-[0.98] border-2",
                            currentStatus === "skipped"
                                ? "bg-orange-500/12 text-orange-300 border-orange-500/25"
                                : "bg-orange-500/20 text-orange-300/60 border-transparent hover:bg-orange-500/20 hover:text-orange-200 hover:border-orange-500/20"
                        )}

                    >
                        <CircleOff size={22} />
                        SKIP FOR TODAY
                    </button>
                    <button 
                        onClick={() => onSelect('pending')}
                        className="flex h-16 items-center justify-center gap-3 rounded-[1.25rem] bg-muted font-bold text-muted-foreground transition-all hover:bg-muted/80 active:scale-[0.98]"
                    >
                        RESET TO PENDING
                    </button>
                    <button 
                        onClick={onClose}
                        className="mt-2 flex h-12 items-center justify-center font-bold text-muted-foreground/60 transition-all hover:text-foreground active:scale-95"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
}
