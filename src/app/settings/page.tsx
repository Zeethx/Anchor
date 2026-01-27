"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LogOut, Save, Plus, X, Dumbbell, Brain, Flame, Trophy, 
  Target, Music as MusicIcon, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconPicker, AVAILABLE_ICONS } from "@/components/ui/icon-picker";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [habits, setHabits] = useState<Array<{ name: string; icon: string }>>([]);
  const [affirmations, setAffirmations] = useState<string[]>([]);
  
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("dumbbell");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [newAffirmation, setNewAffirmation] = useState("");

  const router = useRouter();
  const supabase = createClient();

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
        if (data.custom_habits) setHabits(data.custom_habits);
        if (data.custom_affirmations) setAffirmations(data.custom_affirmations);
      }
      
      setLoading(false);
    }
    loadSettings();
  }, [supabase, router]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const { error } = await supabase.from("users").upsert({
            id: user.id,
            email: user.email,
            custom_habits: habits,
            custom_affirmations: affirmations
        });
        
        if (error) {
          console.error(error);
          alert("Error saving settings");
        } else {
          alert("Settings saved successfully");
        }
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    setHabits([...habits, { name: newHabitName.trim(), icon: newHabitIcon }]);
    setNewHabitName("");
    setNewHabitIcon("dumbbell");
  };

  const removeHabit = (index: number) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  const addAffirmation = () => {
    if (!newAffirmation.trim()) return;
    setAffirmations([...affirmations, newAffirmation.trim()]);
    setNewAffirmation("");
  };

  const removeAffirmation = (index: number) => {
    setAffirmations(affirmations.filter((_, i) => i !== index));
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
    <div className="pb-24 space-y-10">
      <header className="py-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">{email}</p>
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
                    <button onClick={() => removeHabit(i)} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <X size={16} />
                    </button>
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

        <div className="flex flex-col gap-4 pt-6">
          <button 
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
              <Save size={20} />
              {saving ? "Saving..." : "Save All Changes"}
          </button>
          
          <button 
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-4 font-medium text-destructive transition-all hover:bg-destructive/10 active:scale-95"
          >
              <LogOut size={18} />
              Sign Out
          </button>
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
