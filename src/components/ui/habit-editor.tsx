"use client";

import { Plus, X, Edit2 } from "lucide-react";
import { useState } from "react";
import { IconPicker, AVAILABLE_ICONS } from "./icon-picker";

interface Habit {
  name: string;
  icon: string;
}

interface HabitEditorProps {
  habits: Habit[];
  onSave: (habits: Habit[]) => void;
  onClose: () => void;
}

export function HabitEditor({ habits, onSave, onClose }: HabitEditorProps) {
  const [editedHabits, setEditedHabits] = useState<Habit[]>([...habits]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("dumbbell");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editingIconIndex, setEditingIconIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newHabitName.trim()) return;
    setEditedHabits([...editedHabits, { name: newHabitName.trim(), icon: newHabitIcon }]);
    setNewHabitName("");
    setNewHabitIcon("dumbbell");
  };

  const handleRemove = (index: number) => {
    setEditedHabits(editedHabits.filter((_, i) => i !== index));
  };

  const handleChangeIcon = (index: number, icon: string) => {
    const updated = [...editedHabits];
    updated[index].icon = icon;
    setEditedHabits(updated);
  };

  const getIconComponent = (iconName: string) => {
    const icon = AVAILABLE_ICONS.find(i => i.name === iconName);
    return icon ? icon.Icon : AVAILABLE_ICONS[0].Icon;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Habits</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        {/* Existing Habits */}
        <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
          {editedHabits.map((habit, index) => {
            const IconComponent = getIconComponent(habit.icon);
            return (
              <div key={index} className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
                <button
                  onClick={() => {
                    setEditingIconIndex(index);
                    setShowIconPicker(true);
                  }}
                  className="rounded-lg p-1.5 hover:bg-muted"
                >
                  <IconComponent size={20} />
                </button>
                <span className="flex-1 text-sm font-medium">{habit.name}</span>
                <button
                  onClick={() => handleRemove(index)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add New Habit */}
        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingIconIndex(null);
                setShowIconPicker(true);
              }}
              className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-muted"
            >
              {(() => {
                const IconComponent = getIconComponent(newHabitIcon);
                return <IconComponent size={16} />;
              })()}
            </button>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="New habit name..."
              className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={handleAdd}
              disabled={!newHabitName.trim()}
              className="rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => {
            onSave(editedHabits);
            onClose();
          }}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Save Changes
        </button>
      </div>

      {showIconPicker && (
        <IconPicker
          selectedIcon={editingIconIndex !== null ? editedHabits[editingIconIndex].icon : newHabitIcon}
          onSelect={(icon) => {
            if (editingIconIndex !== null) {
              handleChangeIcon(editingIconIndex, icon);
            } else {
              setNewHabitIcon(icon);
            }
            setShowIconPicker(false);
            setEditingIconIndex(null);
          }}
          onClose={() => {
            setShowIconPicker(false);
            setEditingIconIndex(null);
          }}
        />
      )}
    </div>
  );
}
