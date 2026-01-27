"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { Dumbbell, Brain, Flame, Trophy, Music, Calendar as CalendarIcon, List as ListIcon, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";

interface LogEntry {
  id?: string;
  date: string;
  habits: Array<{ name: string; done: boolean }>;
  word_of_day: string | null;
  today_goal: string | null;
  song_link?: string | null;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const supabase = createClient();

  useEffect(() => {
    async function fetchLogs() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch all logs ordered by date DESC
      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (data) {
        setLogs(data);
        calculateStreak(data);
      }
      setLoading(false);
    }

    fetchLogs();
  }, [supabase]);

  function calculateStreak(data: LogEntry[]) {
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
        // Ideally checking if "meaningful" work was done, but for now just logging in/creating a row counts
        currentStreak++;

        if (!nextDate) break;

        const gap = differenceInCalendarDays(currentDate, nextDate);
        if (gap > 1) break; // Streak broken
    }
    setStreak(currentStreak);
  }

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
    );
  }

  return (
    <div className="pb-20">
      <header className="mb-6 flex items-center justify-between py-2">
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
                <div className="flex items-center gap-1.5 text-orange-500">
                    <Flame size={20} className="fill-current" />
                    <span className="text-2xl font-bold">{streak}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">Streak</span>
            </div>
        </div>
      </header>
      
      {view === "list" ? (
        <div className="space-y-3">
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
                              </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 justify-end">
                              {/* Dynamic habit badges */}
                              {log.habits?.filter(h => h.done).map((habit, idx) => (
                                  <div key={idx} className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-medium text-blue-500">
                                      <Dumbbell size={10} />
                                      <span>{habit.name}</span>
                                  </div>
                              ))}
                              {log.word_of_day && (
                                  <div className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-[10px] font-medium text-purple-500">
                                      <Brain size={10} />
                                      <span className="max-w-[80px] truncate">{log.word_of_day.split('-')[0].trim()}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-3">
                          <div className="flex gap-4 text-sm w-full">
                               <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-muted-foreground">{log.habits?.filter(h => h.done).length || 0}/{log.habits?.length || 0} habits</span>
                               </div>
                               {log.today_goal && (
                                 <div className="flex items-center gap-1.5 truncate flex-1 justify-end">
                                    <span className="text-muted-foreground hidden sm:inline text-xs">Goal:</span>
                                    <span className="text-foreground italic truncate text-xs">"{log.today_goal}"</span>
                                 </div>
                               )}
                          </div>
                      </div>
                      
                      {log.song_link && (
                          <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                              <Music size={14} className="text-muted-foreground" />
                              <span className="text-sm text-nowrap text-muted-foreground truncate">{log.song_link}</span>
                          </div>
                      )}
                  </div>
              ))
          )}
        </div>
      ) : (
        <CalendarDisplay logs={logs} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
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
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-md hover:bg-muted transition-colors">
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
                isToday(day) && "ring-2 ring-primary ring-offset-2 ring-offset-background z-10",
                completedAll && "bg-green-500/10 border-green-500/40"
              )}
            >
              <span className={cn("text-xs sm:text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                {format(day, "d")}
              </span>
              {active && (
                <div className="mt-1 flex gap-0.5">
                   {completedAll ? (
                     <Trophy size={10} className="text-green-500" />
                   ) : (
                     <div className="h-1 w-1 rounded-full bg-primary" />
                   )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedLog && (
        <div className="rounded-2xl border border-primary/50 bg-primary/5 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">{format(parseISO(selectedLog.date), "EEEE, MMM d")}</h3>
              {selectedLog.today_goal && <p className="text-sm italic text-muted-foreground">"{selectedLog.today_goal}"</p>}
            </div>
            <button onClick={() => setSelectedLog(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
               {selectedLog.habits?.map((h, i) => (
                 <div key={i} className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium", h.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {h.done ? <Check size={12} /> : <div className="w-3 h-3" />}
                    {h.name}
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedLog.word_of_day && (
                <div className="rounded-xl bg-card border border-border p-3">
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-medium text-muted-foreground">
                    <Brain size={12} />
                    WORD OF THE DAY
                  </div>
                  <div className="text-sm font-semibold">{selectedLog.word_of_day}</div>
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
