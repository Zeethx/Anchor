"use client";

import { Music, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface SongLinkProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

interface Track {
  name: string;
  artist: string;
  image?: string;
  url?: string;
}

export function SongLink({ value, onChange, disabled, className }: SongLinkProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse existing value into selectedTrack
  useEffect(() => {
    if (value && !selectedTrack) {
      const [artist, ...nameParts] = value.split(" - ");
      setSelectedTrack({
        name: nameParts.join(" - "),
        artist: artist,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Search Last.fm as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTracks([]);
      setShowDropdown(false);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_LASTFM_APIKEY;
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(
            searchQuery
          )}&api_key=${apiKey}&format=json&limit=10`
        );
        const data = await response.json();

        if (data.results?.trackmatches?.track) {
          const trackList = Array.isArray(data.results.trackmatches.track)
            ? data.results.trackmatches.track
            : [data.results.trackmatches.track];

          const formattedTracks: Track[] = trackList.map((t: any) => ({
            name: t.name,
            artist: t.artist,
            image: t.image?.find((img: any) => img.size === "medium")?.["#text"],
            url: t.url,
          }));

          setTracks(formattedTracks);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Failed to search tracks:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track);
    onChange(`${track.artist} - ${track.name}`);
    setSearchQuery("");
    setShowDropdown(false);
    setTracks([]);
  };

  const handleClearSelection = () => {
    setSelectedTrack(null);
    onChange("");
    setSearchQuery("");
  };

  return (
    <div className={cn("space-y-3", className)} ref={dropdownRef}>
      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Music size={16} />
        Today's Song
      </label>

      {selectedTrack ? (
        // Selected Track Card
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          {selectedTrack.image && (
            <img
              src={selectedTrack.image}
              alt={selectedTrack.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium text-foreground">{selectedTrack.name}</div>
            <div className="truncate text-sm text-muted-foreground">{selectedTrack.artist}</div>
          </div>
          {!disabled && (
            <button
              onClick={handleClearSelection}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        // Search Input
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={disabled ? "Song selection disabled" : "Search for a song..."}
              disabled={disabled}
              className="flex h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>

          {/* Dropdown Results */}
          {showDropdown && tracks.length > 0 && (
            <div className="absolute z-[100] bottom-full mb-2 max-h-80 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-bottom-2">
              {tracks.map((track, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectTrack(track)}
                  className="flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors last:border-0 hover:bg-muted"
                >
                  {track.image ? (
                    <img
                      src={track.image}
                      alt={track.name}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <Music size={16} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{track.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{track.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
