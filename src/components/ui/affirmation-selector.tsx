import { Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AffirmationSelectorProps {
  affirmations: string[];
  selected: string[];
  onSelect: (affirmations: string[]) => void;
}

export function AffirmationSelector({
  affirmations,
  selected = [],
  onSelect,
}: AffirmationSelectorProps) {
  const [pressing, setPressing] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = (affirmation: string) => {
    if (selected.includes(affirmation)) return;
    
    setPressing(affirmation);
    timerRef.current = setTimeout(() => {
      onSelect([...selected, affirmation]);
      setPressing(null);
    }, 500); // 500ms hold
  };

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setPressing(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Morning Affirmations</h3>
        <p className="text-xs text-muted-foreground">Hold to internalize</p>
      </div>

      <div className="space-y-3">
        {affirmations.map((affirmation, idx) => {
          const isAcknowledged = selected.includes(affirmation);
          const isPressing = pressing === affirmation;

          return (
            <div key={idx} className="relative">
              <button
                onMouseDown={() => startPress(affirmation)}
                onMouseUp={endPress}
                onMouseLeave={endPress}
                onTouchStart={() => startPress(affirmation)}
                onTouchEnd={endPress}
                disabled={isAcknowledged}
                className={cn(
                  "w-full rounded-2xl border p-5 text-left transition-all duration-300 select-none touch-none",
                  isAcknowledged
                    ? "border-border bg-muted/30 opacity-60 scale-[0.98]"
                    : "border-border bg-card hover:border-border/80 active:scale-[0.99]",
                  isPressing && "ring-2 ring-primary/20 bg-primary/5"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500",
                      isAcknowledged
                        ? "border-primary/40 bg-primary/40"
                        : "border-muted-foreground/20",
                      isPressing && "scale-110 border-primary"
                    )}
                  >
                    {isAcknowledged && <Check size={14} className="text-primary-foreground" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-base leading-relaxed transition-colors duration-500",
                      isAcknowledged ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {affirmation}
                    </p>
                    {isAcknowledged && (
                      <p className="text-[10px] font-medium uppercase tracking-wider text-primary/60 animate-in fade-in slide-in-from-left-2 duration-700">
                        Carried for today
                      </p>
                    )}
                  </div>
                </div>
              </button>
              
              {/* Progress bar during press */}
              {isPressing && (
                <div className="absolute bottom-0 left-0 h-1 bg-primary/30 transition-all duration-500 rounded-b-2xl" style={{ width: '100%' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
