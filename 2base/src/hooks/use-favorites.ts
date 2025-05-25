import { useState, useEffect } from "react";

const FAVORITES_STORAGE_KEY = "tool-suite-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      console.log("Saved favorites to localStorage:", favorites);
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, [favorites]);

  const addToFavorites = (toolId: string) => {
    setFavorites((prev) => {
      if (!prev.includes(toolId)) {
        return [...prev, toolId];
      }
      return prev;
    });
  };

  const removeFromFavorites = (toolId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== toolId));
  };

  const toggleFavorite = (toolId: string) => {
    console.log(
      "toggleFavorite called for:",
      toolId,
      "Current favorites:",
      favorites
    );
    setFavorites((prev) => {
      if (prev.includes(toolId)) {
        console.log("Removing from favorites:", toolId);
        return prev.filter((id) => id !== toolId);
      } else {
        console.log("Adding to favorites:", toolId);
        return [...prev, toolId];
      }
    });
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
  };
}
