"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { Dumbbell, Brain, Flame, Trophy, Music, Calendar as CalendarIcon, List as ListIcon, ChevronLeft, ChevronRight, X, Check, Circle, StickyNote, Eye, EyeOff, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { AVAILABLE_ICONS } from "@/components/ui/icon-picker";

interface LogEntry {
  id?: string;
  date: string;
  habits: Array<{ name: string; done: boolean; status?: 'done' | 'pending' | 'skipped' }>;
  word_of_day: string | null;
  today_goal: string | null;
  song_link?: string | null;
  note?: string | null;
  mood?: number | null;
}

import { LogsSkeleton } from "@/components/ui/skeleton";
import { useUser } from "@/components/providers/user-provider";

const MOODS = [
  { value: 4, label: "Excellent", image: "/Excellent.png" },
  { value: 3, label: "Good", image: "/Good.png" },
  { value: 2, label: "Neutral", image: "/Neutral.png" },
  { value: 1, label: "Bad", image: "/Bad.png" },
  { value: 0, label: "Awful", image: "/Awful.png" },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showHabitStreaks, setShowHabitStreaks] = useState(false);
  const [habitStreaks, setHabitStreaks] = useState<Record<string, number>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [customHabits, setCustomHabits] = useState<Array<{ name: string; icon: string; skippable?: boolean }>>([]);

  const { user, supabase, loading: authLoading } = useUser();

  useEffect(() => {
    async function fetchLogs() {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch user settings and logs
      const [settingsRes, logsRes] = await Promise.all([
        supabase.from("users").select("custom_habits").eq("id", user.id).maybeSingle(),
        supabase.from("daily_logs").select("*").eq("user_id", user.id).order("date", { ascending: false })
      ]);
      
      if (settingsRes.data?.custom_habits) {
        setCustomHabits(settingsRes.data.custom_habits);
      }

      if (logsRes.data) {
        setLogs(logsRes.data);
        const habitsToUse = settingsRes.data?.custom_habits || [];
        calculateStreak(logsRes.data, habitsToUse);
      }
      setLoading(false);
    }

    fetchLogs();
  }, [supabase, user, authLoading]);

  function calculateStreak(data: LogEntry[], habitsToUse: any[]) {
    if (!data.length) return 0;
    
    let currentStreak = 0;
    const today = new Date();
    // Check if the most recent log is today or yesterday to start the streak
    const lastLogDate = parseISO(data[0].date);
    const diff = differenceInCalendarDays(today, lastLogDate);
    
    if (diff > 1) {
        setStreak(0);
        return;
    }

    // Simple consecutive days check
    // Note: This assumes data is sorted DESC
    for (let i = 0; i < data.length; i++) {
        const currentDate = parseISO(data[i].date);
        const nextDate = data[i+1] ? parseISO(data[i+1].date) : null;
        
        // Count this day if it happened (which it did, if it's in logs)
        currentStreak++;

        if (!nextDate) break;

        const gap = differenceInCalendarDays(currentDate, nextDate);
        if (gap > 1) break; // Streak broken
    }
    setStreak(currentStreak);
    calculateHabitStreaks(data, habitsToUse);
  }

  function calculateHabitStreaks(data: LogEntry[], habitsToUse: any[]) {
    const streaks: Record<string, number> = {};
    
    // Only calculate streaks for CURRENT habits
    habitsToUse.forEach(habitConfig => {
      const habitName = habitConfig.name;
      let streak = 0;
      const today = new Date();
      
      // Find the most recent log for this habit to check if streak is alive
      let lastActivityIndex = -1;
      for (let i = 0; i < data.length; i++) {
        const habit = data[i].habits?.find(h => h.name === habitName);
        const status = habit?.status || (habit?.done ? 'done' : 'pending');
        
        if (status === 'done' || status === 'skipped') {
          lastActivityIndex = i;
          break;
        }
      }

      if (lastActivityIndex === -1) {
        streaks[habitName] = 0;
        return;
      }

      const lastActivityDate = parseISO(data[lastActivityIndex].date);
      const diff = differenceInCalendarDays(today, lastActivityDate);
      
      // If last activity is more than 1 day ago, streak is broken
      if (diff > 1) {
        streaks[habitName] = 0;
        return;
      }

      // Count consecutive completed days, allowing skips to pass through
      for (let i = lastActivityIndex; i < data.length; i++) {
        const habit = data[i].habits?.find(h => h.name === habitName);
        const status = habit?.status || (habit?.done ? 'done' : 'pending');
        
        if (status === 'done') {
          streak++;
        } else if (status === 'skipped') {
          // Carry forward without incrementing
        } else {
          // Pending or missing breaks the streak
          break;
        }

        const nextLog = data[i + 1];
        if (!nextLog) break;

        const currentDate = parseISO(data[i].date);
        const nextDate = parseISO(nextLog.date);
        const gap = differenceInCalendarDays(currentDate, nextDate);
        if (gap > 1) break;
      }

      streaks[habitName] = streak;
    });

    setHabitStreaks(streaks);
  }

  const getIconComponent = (iconName: string): LucideIcon => {
    const icon = AVAILABLE_ICONS.find(i => i.name === iconName);
    return icon ? icon.Icon : AVAILABLE_ICONS[0].Icon;
  };

  if (loading) {
    return <LogsSkeleton />;
  }


  return (
    <div className="mx-auto max-w-md px-4 pb-40 pt-6 space-y-10 min-h-screen">
      <header className="flex items-center justify-between py-2 border-b pb-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Logs</h1>
            <p className="text-muted-foreground">Your history</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex rounded-lg bg-muted p-1">
                <button 
                  onClick={() => setView("list")}
                  className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-all text-nowrap", view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  <ListIcon size={16} className="sm:mr-2 inline" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button 
                  onClick={() => setView("calendar")}
                  className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-all text-nowrap", view === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  <CalendarIcon size={16} className="sm:mr-2 inline" />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
            </div>
            <div className="flex flex-col items-end">
                <button 
                  onClick={() => setShowHabitStreaks(!showHabitStreaks)}
                  className="flex items-center gap-1.5 text-orange-500 hover:opacity-80 transition-opacity cursor-pointer"
                  title="Click to see individual habit streaks"
                >
                    <Flame size={20} className="fill-current" />
                    <span className="text-2xl font-bold">{streak}</span>
                </button>
                <span className="text-xs font-medium text-muted-foreground">Streak</span>
            </div>
        </div>
      </header>
      
      {view === "list" ? (
        <div className="space-y-6">
          {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                      <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No logs yet</h3>
                  <p className="text-sm text-muted-foreground">Complete "Today" to start your streak.</p>
              </div>
          ) : (
              logs.map((log, index) => (
                  <div 
                      key={log.date} 
                      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50"
                      style={{ 
                          animation: `slideInFromBottom 0.5s ease-out ${index * 50}ms backwards`
                      }}
                  >
                      <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 shrink-0">
                              <div className="flex flex-col leading-none">
                                  <span className="text-base font-semibold">{format(parseISO(log.date), "EEEE")}</span>
                                  <span className="text-xs text-muted-foreground">{format(parseISO(log.date), "MMM d")}</span>
                                  {log.today_goal && (
                                     <p className="mt-1 text-sm italic text-muted-foreground truncate max-w-[200px] sm:max-w-[400px]">
                                         {log.today_goal}
                                     </p>
                                  )}
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                              {log.mood !== null && log.mood !== undefined && (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/50 p-1.5 shadow-sm" title={MOODS.find(m => m.value === log.mood)?.label}>
                                      <img 
                                          src={MOODS.find(m => m.value === log.mood)?.image} 
                                          alt="Mood" 
                                          className="h-full w-full object-contain"
                                      />
                                  </div>
                              )}
                              {log.note && (
                                  <div className="flex justify-end">
                                      <button
                                          onClick={() => setExpandedNotes(prev => ({ ...prev, [log.date]: !prev[log.date] }))}
                                          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 text-xs text-muted-foreground/80 hover:text-foreground hover:bg-muted/30 transition"
                                      >
                                          {expandedNotes[log.date] ? <EyeOff size={14} /> : <Eye size={14} />}
                                          {expandedNotes[log.date] ? "Hide" : "Note"}
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>

                      {log.habits?.some(h => h.done) && (
                          <div className="flex flex-wrap gap-2 pt-1 border-t border-border/30 mt-1">
                              {log.habits.filter(h => h.done).map((habit, idx) => {
                                  const habitConfig = customHabits.find(h => h.name === habit.name);
                                  const Icon = getIconComponent(habitConfig?.icon || "dumbbell");
                                  return (
                                    <div key={idx} className="flex items-center gap-1 rounded-lg bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary border border-primary/10">
                                        <Icon size={10} />
                                        <span>{habit.name}</span>
                                    </div>
                                  );
                              })}
                          </div>
                      )}

                      {log.note && expandedNotes[log.date] && (
                          <div className="rounded-xl border border-amber-200/50 bg-amber-500/5 p-4 text-sm italic text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                             "{log.note}"
                          </div>
                      )}
                      
                      {log.song_link && (
                          <div className="flex items-center gap-2 border-t border-border/50 pt-3 mt-1">
                              <Music size={14} className="text-muted-foreground/60" />
                              <span className="text-sm text-muted-foreground/80 truncate italic">{log.song_link}</span>
                          </div>
                      )}
                  </div>
              ))
          )}
        </div>
      ) : (
        <CalendarDisplay logs={logs} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
      )}

      {/* Habit Streaks Modal */}
      {showHabitStreaks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={24} className="text-orange-500 fill-current" />
                <h2 className="text-xl font-bold">Individual Streaks</h2>
              </div>
              <button 
                onClick={() => setShowHabitStreaks(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(habitStreaks).length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No habit streaks yet</p>
              ) : (
                Object.entries(habitStreaks)
                  .sort((a, b) => b[1] - a[1])
                  .map(([habitName, streakCount]) => (
                    <div key={habitName} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                      <span className="font-medium">{habitName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-orange-500">{streakCount}</span>
                        <Flame size={16} className="text-orange-500 fill-current" />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarDisplay({ logs, currentMonth, setCurrentMonth }: { logs: LogEntry[], currentMonth: Date, setCurrentMonth: (d: Date) => void }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const getLogForDay = (day: Date) => {
    return logs.find(l => isSameDay(parseISO(l.date), day));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="flex gap-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground/40 hover:text-foreground">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground/40 hover:text-foreground">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-medium text-muted-foreground uppercase">{d}</div>
        ))}
        {/* Placeholder for empty days at start of month */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const log = getLogForDay(day);
          const active = !!log;
          const doneHabits = log?.habits?.filter(h => h.done).length || 0;
          const totalHabits = log?.habits?.length || 0;
          const completedAll = active && doneHabits === totalHabits && totalHabits > 0;

          return (
            <button
              key={day.toISOString()}
              onClick={() => active && setSelectedLog(log)}
              disabled={!active}
              className={cn(
                "group relative aspect-square rounded-xl border transition-all flex flex-col items-center justify-center overflow-hidden",
                !isSameMonth(day, monthStart) && "opacity-20",
                active ? "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10 shadow-sm cursor-pointer" : "border-border opacity-40 cursor-default",
                isToday(day) && "ring-2 ring-primary ring-offset-background z-10",
                completedAll && "bg-green-500/10 border-green-500/40"
              )}
            >
              <span className={cn("text-xs sm:text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                {format(day, "d")}
              </span>
              {active && (
                <div className="mt-1 flex flex-col items-center gap-1">
                   <div className="flex gap-0.5">
                      {completedAll ? (
                        <Trophy size={10} className="text-green-500" />
                      ) : (
                        <div className="h-1 w-1 rounded-full bg-primary" />
                      )}
                   </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedLog && (
        <div className="rounded-2xl border border-primary/50 bg-primary/5 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
               {selectedLog.mood !== null && selectedLog.mood !== undefined && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background border p-2 shadow-sm" title={MOODS.find(m => m.value === selectedLog.mood)?.label}>
                      <img 
                          src={MOODS.find(m => m.value === selectedLog.mood)?.image} 
                          alt="Mood" 
                          className="h-full w-full object-contain" 
                      />
                  </div>
               )}
               <div>
                 <h3 className="text-lg font-bold">{format(parseISO(selectedLog.date), "EEEE, MMM d")}</h3>
                 {selectedLog.today_goal && <p className="text-sm italic text-muted-foreground">"{selectedLog.today_goal}"</p>}
               </div>
            </div>
            <button onClick={() => setSelectedLog(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
               {selectedLog.habits?.map((h, i) => (
                 <div key={i} className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium", h.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {h.done ? <Check size={12} /> : <Circle size={12} />}
                    {h.name}
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedLog.note && (
                <div className="rounded-xl border border-border bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                    <StickyNote size={14} />
                    Reflections
                  </div>
                  <div className="text-sm italic leading-relaxed text-foreground whitespace-pre-wrap">"{selectedLog.note}"</div>
                </div>
              )}
              {selectedLog.song_link && (
                <div className="rounded-xl bg-card border border-border p-3">
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-medium text-muted-foreground">
                    <Music size={12} />
                    TODAY'S SONG
                  </div>
                  <div className="text-sm font-semibold break-words">{selectedLog.song_link}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
