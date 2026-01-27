"use client";

import { BookOpen, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface WordOfDayProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function WordOfDay({ value, onChange, className }: WordOfDayProps) {
  const [loading, setLoading] = useState(false);
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");

  // Parse existing value
  useEffect(() => {
    if (value && value.includes(" - ")) {
      const [w, d] = value.split(" - ");
      setWord(w.trim());
      setDefinition(d.trim());
    }
  }, [value]);

  const fetchRandomWord = async () => {
    setLoading(true);
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        
        // Using Random Word API + Dictionary API
        const randomWordRes = await fetch("https://random-word-api.herokuapp.com/word");
        const [randomWord] = await randomWordRes.json();
        
        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
        
        if (!dictRes.ok) {
          console.log(`Word "${randomWord}" not found, retrying... (${attempts}/${maxAttempts})`);
          continue; // Try another word
        }
        
        const dictData = await dictRes.json();
        
        if (dictData && dictData[0]?.meanings?.[0]?.definitions?.[0]) {
          const newWord = dictData[0].word;
          const newDef = dictData[0].meanings[0].definitions[0].definition;
          const wordWithDef = `${newWord} - ${newDef}`;
          
          setWord(newWord);
          setDefinition(newDef);
          onChange(wordWithDef); // This will auto-save to Supabase
          
          console.log(`✅ Found word: ${newWord}`);
          setLoading(false);
          return; // Success!
        }
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error);
      }
    }
    
    // If all attempts failed
    console.error("Failed to fetch word after maximum attempts");
    setLoading(false);
  };

  // Auto-fetch on mount ONLY if no value exists
  useEffect(() => {
    if (!value) {
      fetchRandomWord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount, never again

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpen size={16} />
          Word of the Day
        </label>
        <button
          onClick={fetchRandomWord}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all hover:bg-secondary/80 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          New Word
        </button>
      </div>
      
      {word && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-1 text-lg font-bold capitalize text-foreground">{word}</div>
          <div className="text-sm leading-relaxed text-muted-foreground">{definition}</div>
        </div>
      )}
    </div>
  );
}
