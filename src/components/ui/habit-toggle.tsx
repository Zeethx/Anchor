import { LucideIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitToggleProps {
  label: string;
  icon: LucideIcon;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string; // Allow custom classes
}

export function HabitToggle({
  label,
  icon: Icon,
  checked,
  onChange,
  className,
}: HabitToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative flex w-full items-center justify-between rounded-xl border p-5 transition-all duration-500 active:scale-[0.98]",
        checked
          ? "border-border/50 bg-muted/20 opacity-80"
          : "border-border bg-card hover:border-border/80 hover:bg-muted/30",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500",
            checked ? "bg-muted text-muted-foreground/60" : "bg-primary/10 text-primary"
          )}
        >
          <Icon size={20} />
        </div>
        <span className={cn(
            "text-lg font-medium transition-colors duration-500", 
            checked ? "text-muted-foreground/60" : "text-foreground"
        )}>
          {label}
        </span>
      </div>
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500",
          checked
            ? "border-muted-foreground/20 bg-muted-foreground/10 text-muted-foreground/60"
            : "border-muted-foreground/30 bg-transparent"
        )}
      >
        {checked && <Check size={14} />}
      </div>
    </button>
  );
}
