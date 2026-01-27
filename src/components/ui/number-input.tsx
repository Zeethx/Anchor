import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  unit,
}: NumberInputProps) {
  const handleDecrement = () => {
    if (value > min) onChange(Number((value - step).toFixed(1)));
  };

  const handleIncrement = () => {
    if (value < max) onChange(Number((value + step).toFixed(1)));
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className="text-base font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/20 text-foreground transition-colors hover:bg-muted disabled:opacity-50 active:scale-95"
        >
          <Minus size={18} />
        </button>
        <span className="min-w-[40px] text-center text-xl font-semibold">
          {value}
          {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
        </span>
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/20 text-foreground transition-colors hover:bg-muted disabled:opacity-50 active:scale-95"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
