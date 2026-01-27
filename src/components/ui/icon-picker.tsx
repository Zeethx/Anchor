"use client";

import { Dumbbell, Brain, Languages, Hash, Heart, Zap, Target, Coffee, Book, Code, Music as MusicIcon, Flame, Trophy, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AVAILABLE_ICONS = [
  { name: "dumbbell", Icon: Dumbbell, label: "Gym" },
  { name: "brain", Icon: Brain, label: "Learning" },
  { name: "languages", Icon: Languages, label: "Language" },
  { name: "hash", Icon: Hash, label: "Game" },
  { name: "heart", Icon: Heart, label: "Health" },
  { name: "zap", Icon: Zap, label: "Energy" },
  { name: "target", Icon: Target, label: "Goal" },
  { name: "coffee", Icon: Coffee, label: "Coffee" },
  { name: "book", Icon: Book, label: "Reading" },
  { name: "code", Icon: Code, label: "Coding" },
  { name: "music", Icon: MusicIcon, label: "Music" },
  { name: "flame", Icon: Flame, label: "Streak" },
  { name: "trophy", Icon: Trophy, label: "Achievement" },
  { name: "star", Icon: Star, label: "Favorite" },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

export function IconPicker({ selectedIcon, onSelect, onClose }: IconPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Choose an Icon</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {AVAILABLE_ICONS.map(({ name, Icon, label }) => (
            <button
              key={name}
              onClick={() => {
                onSelect(name);
                onClose();
              }}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl p-3 transition-all hover:bg-muted",
                selectedIcon === name && "bg-primary/10 ring-2 ring-primary"
              )}
            >
              <Icon size={24} className={selectedIcon === name ? "text-primary" : "text-foreground"} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { AVAILABLE_ICONS };
