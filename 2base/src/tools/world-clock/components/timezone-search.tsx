import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeZone } from "../lib";

interface TimeZoneSearchProps {
  onAddTimeZone: (
    timezone: Omit<TimeZone, "id" | "order" | "isFavorite">
  ) => void;
  searchResults: Omit<TimeZone, "id" | "order" | "isFavorite">[];
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export function TimeZoneSearch({
  onAddTimeZone,
  searchResults,
  onSearch,
  isSearching = false,
}: TimeZoneSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch(value);
    setIsOpen(value.length > 0);
  };

  const handleAddTimeZone = (
    timezone: Omit<TimeZone, "id" | "order" | "isFavorite">
  ) => {
    onAddTimeZone(timezone);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (query.length > 0 || searchResults.length > 0) {
      setIsOpen(true);
    }
  };

  const formatTimeZoneDisplay = (
    tz: Omit<TimeZone, "id" | "order" | "isFavorite">
  ) => {
    const now = new Date();
    const timeString = now.toLocaleString("en-US", {
      timeZone: tz.timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${tz.name}, ${tz.country} (${timeString})`;
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search cities, countries, or time zones..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-10 pr-4"
        />
      </div>

      {isOpen && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto shadow-lg"
        >
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-4 text-center text-muted-foreground">
                <Clock className="h-4 w-4 animate-spin mx-auto mb-2" />
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((timezone, index) => (
                  <button
                    key={`${timezone.timezone}-${index}`}
                    onClick={() => handleAddTimeZone(timezone)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-accent transition-colors",
                      "flex items-center justify-between group"
                    )}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{timezone.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeZoneDisplay(timezone)}
                      </div>
                    </div>
                    <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : query.length > 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="text-sm">No time zones found for "{query}"</div>
                <div className="text-xs mt-1">
                  Try searching for a city or country name
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="text-sm font-medium mb-2">
                  Popular Time Zones
                </div>
                <div className="space-y-1">
                  {searchResults.slice(0, 6).map((timezone, index) => (
                    <button
                      key={`${timezone.timezone}-${index}`}
                      onClick={() => handleAddTimeZone(timezone)}
                      className={cn(
                        "w-full px-2 py-2 text-left hover:bg-accent transition-colors rounded-md",
                        "flex items-center justify-between group text-sm"
                      )}
                    >
                      <span>{timezone.name}</span>
                      <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
