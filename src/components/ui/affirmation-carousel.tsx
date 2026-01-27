"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AffirmationCarouselProps {
  affirmations: string[];
  selected: string | null;
  onSelect: (affirmation: string) => void;
}

export function AffirmationCarousel({
  affirmations,
  selected,
  onSelect,
}: AffirmationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(
    selected ? affirmations.indexOf(selected) : 0
  );

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? affirmations.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onSelect(affirmations[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex === affirmations.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    onSelect(affirmations[newIndex]);
  };

  const currentAffirmation = affirmations[currentIndex];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">Today's Focus</h3>
      
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="flex items-center gap-3 rounded-xl bg-card/60 p-6 backdrop-blur-3xl">
          <button
            onClick={handlePrevious}
            className="shrink-0 rounded-full p-2 transition-colors hover:bg-muted active:scale-95"
          >
            <ChevronLeft size={20} className="text-muted-foreground" />
          </button>

          <div className="flex-1 text-center">
            <p className="text-lg font-medium leading-relaxed text-foreground">
              {currentAffirmation}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="shrink-0 rounded-full p-2 transition-colors hover:bg-muted active:scale-95"
          >
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-1.5">
        {affirmations.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              onSelect(affirmations[idx]);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}
