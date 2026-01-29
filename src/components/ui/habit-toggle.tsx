import { LucideIcon, Check, CircleOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitToggleProps {
  label: string;
  icon: LucideIcon;
  status: 'done' | 'pending' | 'skipped';
  onClick: () => void;
  className?: string;
}

export function HabitToggle({
  label,
  icon: Icon,
  status,
  onClick,
  className,
}: HabitToggleProps) {
  const isDone = status === 'done';
  const isSkipped = status === 'skipped';

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border transition-all duration-300",
      isDone
        ? "border-border/50 bg-muted/20 opacity-80"
        : isSkipped
        ? "border-orange-500/20 bg-orange-500/5 opacity-80"
        : "border-border bg-card hover:border-border/80 shadow-sm",
      className
    )}>
      <button
        onClick={onClick}
        className="relative flex w-full items-center justify-between p-5 transition-all duration-300 active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500",
              isDone ? "bg-muted text-muted-foreground/60" : 
              isSkipped ? "bg-orange-500/20 text-orange-500" : 
              "bg-primary/10 text-primary"
            )}
          >
            <Icon size={20} />
          </div>
          <div className="flex flex-col items-start">
            <span className={cn(
                "text-lg font-medium transition-colors duration-500", 
                isDone ? "text-muted-foreground/60" : "text-foreground",
                isSkipped && "text-orange-950/60 line-through"
            )}>
              {label}
            </span>
            {isSkipped && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Skipped today</span>
            )}
          </div>
        </div>
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500",
            isDone
              ? "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground/60"
              : isSkipped
              ? "border-orange-500/30 bg-orange-500/10 text-orange-500"
              : "border-muted-foreground/30 bg-transparent"
          )}
        >
          {isDone && <Check size={14} />}
          {isSkipped && <CircleOff size={12} />}
        </div>
      </button>
    </div>
  );
}
