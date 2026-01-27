"use client";

import { BookOpen, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface WordOfDayProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function WordOfDay({ value, onChange, disabled, className }: WordOfDayProps) {
  const [loading, setLoading] = useState(false);
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");

  // Parse existing value
  useEffect(() => {
    if (value && value.includes(" - ")) {
      const [w, d] = value.split(" - ");
      setWord(w.trim());
      setDefinition(d.trim());
    } else {
      setWord(value);
      setDefinition("");
    }
  }, [value]);

  const fetchRandomWord = async () => {
    if (disabled) return;
    setLoading(true);
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        const randomWordRes = await fetch("https://random-word-api.herokuapp.com/word");
        const [randomWord] = await randomWordRes.json();
        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
        
        if (!dictRes.ok) continue;
        
        const dictData = await dictRes.json();
        
        if (dictData && dictData[0]?.meanings?.[0]?.definitions?.[0]) {
          const newWord = dictData[0].word;
          const newDef = dictData[0].meanings[0].definitions[0].definition;
          const wordWithDef = `${newWord} - ${newDef}`;
          
          setWord(newWord);
          setDefinition(newDef);
          onChange(wordWithDef);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error);
      }
    }
    setLoading(false);
  };

  // Auto-fetch on mount ONLY if no value exists AND not disabled
  useEffect(() => {
    if (!value && !disabled) {
      fetchRandomWord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpen size={16} />
          A Word for Today
        </label>
      </div>
      
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80">
        {!disabled && (
          <button
            onClick={fetchRandomWord}
            disabled={loading}
            className="absolute right-3 top-3 z-10 rounded-lg p-1 text-muted-foreground/40 transition-all hover:bg-muted hover:text-foreground active:scale-90 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        )}
        
        <div className="space-y-1">
          <div className="text-base font-bold capitalize text-foreground">
            {word || value.split(' - ')[0]}
          </div>
          {definition ? (
            <p className="text-xs leading-relaxed text-muted-foreground/60 line-clamp-3">
              {definition}
            </p>
          ) : value.includes(' - ') && (
             <p className="text-xs leading-relaxed text-muted-foreground/60 line-clamp-3">
              {value.split(' - ')[1]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
