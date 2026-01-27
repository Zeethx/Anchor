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
        "relative flex w-full items-center justify-between rounded-xl border p-5 transition-all duration-200 active:scale-[0.98]",
        checked
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:bg-muted/50",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            checked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon size={20} />
        </div>
        <span className={cn("text-lg font-medium", checked ? "text-foreground" : "text-muted-foreground")}>
          {label}
        </span>
      </div>
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 bg-transparent"
        )}
      >
        {checked && <Check size={14} />}
      </div>
    </button>
  );
}
