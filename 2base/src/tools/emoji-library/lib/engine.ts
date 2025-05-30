import type { EmojiData, UserPreferences, SearchFilters } from "./types";
import {
  EMOJI_DATA,
  EMOJI_CATEGORIES,
  getEmojisByCategory,
} from "./emoji-data";

const STORAGE_KEYS = {
  RECENT_EMOJIS: "emoji-library-recent",
  FAVORITES: "emoji-library-favorites",
  SEARCH_HISTORY: "emoji-library-search-history",
} as const;

const MAX_RECENT_EMOJIS = 50;
const MAX_SEARCH_HISTORY = 20;

export class EmojiLibraryEngine {
  /**
   * Load all emoji data
   */
  loadEmojiData(): Promise<EmojiData[]> {
    return Promise.resolve(EMOJI_DATA);
  }

  /**
   * Get all emoji categories
   */
  getCategories() {
    return EMOJI_CATEGORIES;
  }

  /**
   * Search emojis based on query and filters
   */
  searchEmojis(query: string, filters: SearchFilters): EmojiData[] {
    let results = EMOJI_DATA;

    // Apply category filter
    if (filters.category && filters.category !== "all") {
      results = getEmojisByCategory(filters.category);
    }

    // Apply text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(
        (emoji) =>
          emoji.name.toLowerCase().includes(searchTerm) ||
          emoji.aliases.some((alias) =>
            alias.toLowerCase().includes(searchTerm)
          ) ||
          emoji.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchTerm)
          )
      );
    }

    // Apply favorites filter
    if (filters.showFavoritesOnly) {
      const favorites = this.getFavorites();
      results = results.filter((emoji) => favorites.includes(emoji.emoji));
    }

    // Apply recent filter
    if (filters.showRecentOnly) {
      const recent = this.getRecentlyUsed();
      results = results.filter((emoji) => recent.includes(emoji.emoji));
    }

    return results;
  }

  /**
   * Get emojis by category
   */
  getEmojisByCategory(categoryId: string): EmojiData[] {
    return getEmojisByCategory(categoryId);
  }

  /**
   * Get emoji details by emoji character
   */
  getEmojiDetails(emoji: string): EmojiData | null {
    return EMOJI_DATA.find((item) => item.emoji === emoji) || null;
  }

  /**
   * Add emoji to recently used list
   */
  addToRecentlyUsed(emoji: string): void {
    try {
      const recent = this.getRecentlyUsed();

      // Remove if already exists to move it to front
      const filtered = recent.filter((item) => item !== emoji);

      // Add to front and limit size
      const updated = [emoji, ...filtered].slice(0, MAX_RECENT_EMOJIS);

      localStorage.setItem(STORAGE_KEYS.RECENT_EMOJIS, JSON.stringify(updated));
    } catch (error) {
      console.warn("Failed to save recently used emoji:", error);
    }
  }

  /**
   * Get recently used emojis
   */
  getRecentlyUsed(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_EMOJIS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to load recently used emojis:", error);
      return [];
    }
  }

  /**
   * Add emoji to favorites
   */
  addToFavorites(emoji: string): void {
    try {
      const favorites = this.getFavorites();

      if (!favorites.includes(emoji)) {
        const updated = [...favorites, emoji];
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      }
    } catch (error) {
      console.warn("Failed to save favorite emoji:", error);
    }
  }

  /**
   * Remove emoji from favorites
   */
  removeFromFavorites(emoji: string): void {
    try {
      const favorites = this.getFavorites();
      const updated = favorites.filter((item) => item !== emoji);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    } catch (error) {
      console.warn("Failed to remove favorite emoji:", error);
    }
  }

  /**
   * Get favorite emojis
   */
  getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to load favorite emojis:", error);
      return [];
    }
  }

  /**
   * Check if emoji is in favorites
   */
  isFavorite(emoji: string): boolean {
    return this.getFavorites().includes(emoji);
  }

  /**
   * Add search term to history
   */
  addToSearchHistory(query: string): void {
    if (!query.trim()) return;

    try {
      const history = this.getSearchHistory();

      // Remove if already exists to move it to front
      const filtered = history.filter((item) => item !== query);

      // Add to front and limit size
      const updated = [query, ...filtered].slice(0, MAX_SEARCH_HISTORY);

      localStorage.setItem(
        STORAGE_KEYS.SEARCH_HISTORY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.warn("Failed to save search history:", error);
    }
  }

  /**
   * Get search history
   */
  getSearchHistory(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to load search history:", error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.warn("Failed to clear search history:", error);
    }
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): UserPreferences {
    return {
      recentlyUsed: this.getRecentlyUsed(),
      favorites: this.getFavorites(),
      preferredCategories: [], // Could be implemented later
      searchHistory: this.getSearchHistory(),
    };
  }

  /**
   * Validate emoji character
   */
  validateEmoji(emoji: string): boolean {
    return EMOJI_DATA.some((item) => item.emoji === emoji);
  }

  /**
   * Get emoji variations (skin tones)
   */
  getEmojiVariations(emoji: string): string[] {
    const emojiData = this.getEmojiDetails(emoji);
    return emojiData?.variations || [];
  }

  /**
   * Copy emoji to clipboard
   */
  async copyToClipboard(emoji: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emoji);
        this.addToRecentlyUsed(emoji);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = emoji;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const result = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (result) {
          this.addToRecentlyUsed(emoji);
        }

        return result;
      }
    } catch (error) {
      console.warn("Failed to copy emoji to clipboard:", error);
      return false;
    }
  }

  /**
   * Get popular emojis (most used)
   */
  getPopularEmojis(limit: number = 20): EmojiData[] {
    const recent = this.getRecentlyUsed();
    const favorites = this.getFavorites();

    // Combine and deduplicate
    const popular = [...new Set([...recent, ...favorites])];

    // Get emoji data for popular emojis
    const popularEmojiData = popular
      .map((emoji) => this.getEmojiDetails(emoji))
      .filter(Boolean) as EmojiData[];

    return popularEmojiData.slice(0, limit);
  }

  /**
   * Clear all user data
   */
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Failed to clear emoji library data:", error);
    }
  }

  /**
   * Get emoji by Unicode codepoint
   */
  getEmojiByUnicode(unicode: string): EmojiData | null {
    return EMOJI_DATA.find((emoji) => emoji.unicode === unicode) || null;
  }

  /**
   * Get random emojis
   */
  getRandomEmojis(count: number = 10): EmojiData[] {
    const shuffled = [...EMOJI_DATA].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
