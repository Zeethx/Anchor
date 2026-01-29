"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LogOut, Save, Plus, X, Dumbbell, Brain, Flame, Trophy, 
  Target, Music as MusicIcon, Check, ChevronUp, ChevronDown, CircleOff
} from "lucide-react";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconPicker, AVAILABLE_ICONS } from "@/components/ui/icon-picker";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [habits, setHabits] = useState<Array<{ name: string; icon: string; skippable?: boolean }>>([]);
  const [affirmations, setAffirmations] = useState<string[]>([]);
  
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("dumbbell");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [newAffirmation, setNewAffirmation] = useState("");

  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      
      setEmail(user.email || "");

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (data) {
        setHabits(data.custom_habits || []);
        setAffirmations(data.custom_affirmations || []);
      }
      
      setLoading(false);
    }
    loadSettings();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    const updated = [...habits, { name: newHabitName.trim(), icon: newHabitIcon, skippable: false }];
    setHabits(updated);
    setNewHabitName("");
    setNewHabitIcon("dumbbell");
    
    // Auto-save
    await syncSettings(updated, affirmations);
  };

  const removeHabit = async (index: number) => {
    const updated = habits.filter((_, i) => i !== index);
    setHabits(updated);
    await syncSettings(updated, affirmations);
  };

  const toggleSkippable = async (index: number) => {
    const updated = habits.map((h, i) => 
      i === index ? { ...h, skippable: !h.skippable } : h
    );
    setHabits(updated);
    await syncSettings(updated, affirmations);
  };

  const moveHabit = async (index: number, direction: 'up' | 'down') => {
    const updated = [...habits];
    if (direction === 'up' && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === 'down' && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    } else {
      return;
    }
    setHabits(updated);
    await syncSettings(updated, affirmations);
  };

  const addAffirmation = async () => {
    if (!newAffirmation.trim()) return;
    const updated = [...affirmations, newAffirmation.trim()];
    setAffirmations(updated);
    setNewAffirmation("");
    await syncSettings(habits, updated);
  };

  const removeAffirmation = async (index: number) => {
    const updated = affirmations.filter((_, i) => i !== index);
    setAffirmations(updated);
    await syncSettings(habits, updated);
  };

  const syncSettings = async (h: any[], a: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        setSaving(true);
        try {
          await supabase
            .from("users")
            .upsert({
              id: user.id,
              email: user.email,
              custom_habits: h,
              custom_affirmations: a
            });
        } catch (error) {
          console.error("Auto-save error:", error);
        }
        setSaving(false);
    }
  };

  const getIcon = (name: string) => {
    const icon = AVAILABLE_ICONS.find(i => i.name === name);
    return icon ? icon.Icon : Dumbbell;
  };

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-40 pt-6 space-y-10 min-h-screen">
      <header className="flex items-center justify-between py-2 border-b pb-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-muted-foreground">{email}</p>
        </div>
        <div className="flex items-center gap-3">
            {saving && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground animate-pulse">
                    <Save size={12} className="animate-spin" />
                    Saving...
                </div>
            )}
            <button 
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-all hover:bg-destructive/20 active:scale-95"
            >
                <LogOut size={14} />
                Sign Out
            </button>
        </div>
      </header>
      
      <div className="space-y-10">
        <section className="space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Daily Habits</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              {habits.map((habit, i) => {
                const Icon = getIcon(habit.icon);
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl border bg-card p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <Icon size={18} />
                      </div>
                      <span className="font-medium">{habit.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => toggleSkippable(i)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold transition-all",
                          habit.skippable 
                            ? "bg-orange-500/10 text-orange-500" 
                            : "bg-muted text-muted-foreground/40"
                        )}
                        title={habit.skippable ? "Skippable enabled" : "Make skippable"}
                      >
                         <CircleOff size={10} />
                         {habit.skippable ? "Optional" : "Required"}
                      </button>
                      <button 
                        onClick={() => moveHabit(i, 'up')}
                        disabled={i === 0}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted disabled:opacity-20 transition-all active:scale-90"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button 
                        onClick={() => moveHabit(i, 'down')}
                        disabled={i === habits.length - 1}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted disabled:opacity-20 transition-all active:scale-90"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button 
                        onClick={() => removeHabit(i)} 
                        className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors active:scale-90"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowIconPicker(true)}
                className="flex h-12 items-center justify-center rounded-xl border bg-card px-4 hover:bg-muted transition-colors"
              >
                {(() => {
                  const Icon = getIcon(newHabitIcon);
                  return <Icon size={20} />;
                })()}
              </button>
              <input
                type="text"
                placeholder="Add new habit..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                className="flex h-12 flex-1 rounded-xl border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={addHabit} className="flex h-12 items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Morning Affirmations</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              {affirmations.map((aff, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border bg-card p-4">
                  <span className="text-sm leading-relaxed">{aff}</span>
                  <button onClick={() => removeAffirmation(i)} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new affirmation..."
                value={newAffirmation}
                onChange={(e) => setNewAffirmation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAffirmation()}
                className="flex h-12 flex-1 rounded-xl border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={addAffirmation} className="flex h-12 items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </section>

         <div className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">Your changes are automatically saved.</p>
         </div>
      </div>

      {showIconPicker && (
        <IconPicker
          selectedIcon={newHabitIcon}
          onSelect={setNewHabitIcon}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}
