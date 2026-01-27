import { Lightbulb } from "lucide-react";

interface SuggestionCardProps {
  suggestion: string;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  if (!suggestion) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-1">
      <div className="flex items-start gap-4 rounded-xl backdrop-blur-3xl bg-card/60 p-5">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-500">
           <Lightbulb size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Today's Focus</h4>
          <p className="text-lg font-medium leading-relaxed text-foreground">{suggestion}</p>
        </div>
      </div>
    </div>
  );
}
