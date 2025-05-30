import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ToolLayout } from "@/components/layout/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, Heart, Clock, X, RotateCcw, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { toolInfo } from "./toolInfo";
import { EmojiLibraryEngine } from "./lib";
import type { EmojiData, SearchFilters } from "./lib";

const engine = new EmojiLibraryEngine();

export default function EmojiLibrary() {
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setFavorites(engine.getFavorites());
        setRecentlyUsed(engine.getRecentlyUsed());
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize emoji library:", error);
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Memoized search filters
  const searchFilters = useMemo<SearchFilters>(
    () => ({
      query: searchQuery,
      category: selectedCategory,
      showFavoritesOnly,
      showRecentOnly,
    }),
    [searchQuery, selectedCategory, showFavoritesOnly, showRecentOnly]
  );

  // Memoized filtered emojis
  const filteredEmojis = useMemo(() => {
    return engine.searchEmojis(searchQuery, searchFilters);
  }, [searchQuery, searchFilters]);

  // Get categories
  const categories = useMemo(() => engine.getCategories(), []);

  // Get quick access emojis
  const quickAccessEmojis = useMemo(() => {
    const recent = recentlyUsed.slice(0, 8);
    const favs = favorites.slice(0, 8);

    return {
      recent: recent
        .map((emoji) => engine.getEmojiDetails(emoji))
        .filter(Boolean) as EmojiData[],
      favorites: favs
        .map((emoji) => engine.getEmojiDetails(emoji))
        .filter(Boolean) as EmojiData[],
    };
  }, [recentlyUsed, favorites]);

  // Handle emoji click/copy
  const handleEmojiClick = useCallback(async (emoji: EmojiData) => {
    try {
      const success = await engine.copyToClipboard(emoji.emoji);

      if (success) {
        toast.success(`Copied ${emoji.emoji}`);
        setRecentlyUsed(engine.getRecentlyUsed());
      } else {
        toast.error("Failed to copy emoji");
      }
    } catch (error) {
      console.error("Error copying emoji:", error);
      toast.error("Failed to copy emoji");
    }
  }, []);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(
    (emoji: string, event: React.MouseEvent) => {
      event.stopPropagation();

      try {
        if (engine.isFavorite(emoji)) {
          engine.removeFromFavorites(emoji);
          toast.success("Removed from favorites");
        } else {
          engine.addToFavorites(emoji);
          toast.success("Added to favorites");
        }

        setFavorites(engine.getFavorites());
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast.error("Failed to update favorites");
      }
    },
    []
  );

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      engine.addToSearchHistory(value.trim());
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setShowFavoritesOnly(false);
    setShowRecentOnly(false);
  }, []);

  // Window controls
  const handleClose = useCallback(() => navigate("/"), [navigate]);
  const handleMinimize = useCallback(() => navigate("/"), [navigate]);
  const handleFullscreen = useCallback(
    () => setIsFullscreen(!isFullscreen),
    [isFullscreen]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) return;

      switch (event.key) {
        case "/":
          event.preventDefault();
          document.getElementById("emoji-search")?.focus();
          break;
        case "Escape":
          event.preventDefault();
          clearSearch();
          break;
        case "f":
        case "F":
          if (
            !event.target ||
            (event.target as HTMLElement).tagName !== "INPUT"
          ) {
            event.preventDefault();
            setShowFavoritesOnly(!showFavoritesOnly);
          }
          break;
        case "r":
        case "R":
          if (
            !event.target ||
            (event.target as HTMLElement).tagName !== "INPUT"
          ) {
            event.preventDefault();
            setShowRecentOnly(!showRecentOnly);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [clearSearch, showFavoritesOnly, showRecentOnly]);

  if (isLoading) {
    return (
      <ToolLayout
        toolName={toolInfo.name}
        toolDescription={toolInfo.description}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">🔄</div>
            <p className="text-muted-foreground">Loading emojis...</p>
          </div>
        </div>
      </ToolLayout>
    );
  }

  const selectedCategoryInfo = categories.find(
    (c) => c.id === selectedCategory
  );
  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    showFavoritesOnly ||
    showRecentOnly;

  return (
    <TooltipProvider>
      <ToolLayout
        toolName={toolInfo.name}
        toolDescription={toolInfo.description}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
      >
        <div className="w-full p-4 space-y-4">
          {/* Compact Search and Filter Bar */}
          <div className="flex gap-3 items-center">
            {/* Search Input - limited width */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="emoji-search"
                placeholder="Search emojis... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10 h-9 w-80"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Category Selector */}
            <Popover
              open={categoryPopoverOpen}
              onOpenChange={setCategoryPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 justify-between min-w-[120px]"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">
                      {selectedCategoryInfo?.icon}
                    </span>
                    <span className="text-xs">
                      {selectedCategoryInfo?.name}
                    </span>
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="Search categories..."
                    className="h-8"
                  />
                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.id}
                          onSelect={() => {
                            setSelectedCategory(category.id);
                            setCategoryPopoverOpen(false);
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span className="text-base">{category.icon}</span>
                          <span className="flex-1">{category.name}</span>
                          {category.id === selectedCategory && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Quick Filter Buttons */}
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showFavoritesOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className="h-9 w-9 p-0"
                  >
                    <Heart className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Favorites ({favorites.length})</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showRecentOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRecentOnly(!showRecentOnly)}
                    className="h-9 w-9 p-0"
                  >
                    <Clock className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recent ({recentlyUsed.length})</p>
                </TooltipContent>
              </Tooltip>

              {hasActiveFilters && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="h-9 w-9 p-0"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear filters</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Quick Access - Compact */}
          {!hasActiveFilters &&
            (quickAccessEmojis.recent.length > 0 ||
              quickAccessEmojis.favorites.length > 0) && (
              <div className="space-y-3">
                {quickAccessEmojis.recent.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground min-w-[60px]">
                      <Clock className="h-3.5 w-3.5" />
                      Recent
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {quickAccessEmojis.recent.map((emoji) => (
                        <Tooltip key={emoji.emoji}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEmojiClick(emoji)}
                              className="text-2xl h-10 w-10 p-0 hover:bg-muted/60 rounded-md transition-colors"
                            >
                              {emoji.emoji}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{emoji.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}

                {quickAccessEmojis.favorites.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground min-w-[60px]">
                      <Heart className="h-3.5 w-3.5" />
                      Favorites
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {quickAccessEmojis.favorites.map((emoji) => (
                        <Tooltip key={emoji.emoji}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEmojiClick(emoji)}
                              className="text-2xl h-10 w-10 p-0 hover:bg-muted/60 rounded-md transition-colors"
                            >
                              {emoji.emoji}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{emoji.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Main Emoji Grid - Full Width */}
          <div className="space-y-3">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">
                  {filteredEmojis.length} emojis
                </h2>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedCategoryInfo?.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Emoji Grid */}
            <div className="border rounded-lg">
              <ScrollArea className="h-[500px] lg:h-[600px]">
                {filteredEmojis.length > 0 ? (
                  <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-18 xl:grid-cols-20 gap-1 p-3">
                    {filteredEmojis.map((emoji) => (
                      <div key={emoji.unicode} className="relative group">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEmojiClick(emoji)}
                              className="text-3xl h-12 w-12 p-0 hover:bg-muted/80 transition-all duration-150 hover:scale-110 relative rounded-md"
                            >
                              {emoji.emoji}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-center">
                              <p className="font-medium">{emoji.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Click to copy
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>

                        {/* Favorite button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleToggleFavorite(emoji.emoji, e)}
                          className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-full"
                        >
                          <Heart
                            className={`h-3 w-3 ${
                              engine.isFavorite(emoji.emoji)
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground hover:text-red-500"
                            }`}
                          />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? `No emojis found for "${searchQuery}"`
                        : "No emojis match your filters"}
                    </p>
                    <Button variant="outline" size="sm" onClick={clearSearch}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </ToolLayout>
    </TooltipProvider>
  );
}
