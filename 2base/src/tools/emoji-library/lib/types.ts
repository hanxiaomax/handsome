export interface EmojiData {
  emoji: string;
  name: string;
  unicode: string;
  category: EmojiCategory;
  aliases: string[];
  keywords: string[];
  skinToneSupport: boolean;
  variations?: string[];
}

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface UserPreferences {
  recentlyUsed: string[];
  favorites: string[];
  preferredCategories: string[];
  searchHistory: string[];
}

export interface EmojiLibraryState {
  emojis: EmojiData[];
  categories: EmojiCategory[];
  filteredEmojis: EmojiData[];
  selectedEmoji: EmojiData | null;
  searchQuery: string;
  selectedCategory: string | null;
  userPreferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
  showEmojiDetails: boolean;
}

export interface SearchFilters {
  query: string;
  category: string | null;
  showFavoritesOnly: boolean;
  showRecentOnly: boolean;
}

export type EmojiCategoryId =
  | "all"
  | "smileys"
  | "people"
  | "animals"
  | "food"
  | "activities"
  | "travel"
  | "objects"
  | "symbols"
  | "flags";
