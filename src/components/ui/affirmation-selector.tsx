import { Check, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isCompleted = selected.length >= 3;

  // Auto-collapse when completed
  useEffect(() => {
    if (isCompleted) {
      setIsCollapsed(true);
    }
  }, [isCompleted]);

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
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Morning Affirmations
          </h3>
        </div>
        {isCompleted && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/30 active:scale-95"
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {isCollapsed ? "View" : "Hide"}
          </button>
        )}
      </div>

      {isCompleted && isCollapsed ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
           <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-primary">Anchored for the day</p>
               <p className="text-[10px] uppercase tracking-widest text-primary/40">Affirmations internalized</p>
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-300">
          {affirmations.map((affirmation, idx) => {
            const isAcknowledged = selected.includes(affirmation);
            const isPressing = pressing === affirmation;

            return (
              <div key={idx} className="relative">
                <button
                  onMouseDown={() => startPress(affirmation)}
                  onMouseUp={endPress}
                  onMouseLeave={endPress}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startPress(affirmation);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    endPress();
                  }}
                  disabled={isAcknowledged}
                  className={cn(
                    "w-full rounded-2xl border p-5 text-left transition-all duration-300 select-none relative overflow-hidden",
                    isAcknowledged
                      ? "border-border bg-muted/30 opacity-60 scale-[0.98]"
                      : "border-border bg-card hover:border-border/80 active:scale-[0.99]",
                    isPressing && "ring-2 ring-primary/20 bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className={cn(
                        "text-lg font-medium transition-colors duration-500",
                        isAcknowledged ? "text-muted-foreground/60" : "text-foreground"
                      )}>
                        {affirmation}
                      </p>
                    </div>
                    {isAcknowledged && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                  
                  {isPressing && (
                    <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary/10 overflow-hidden">
                      <div 
                        className="h-full bg-primary animate-progress-fill"
                        style={{ animationDuration: '500ms' }}
                      />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
