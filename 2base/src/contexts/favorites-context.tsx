import React, { createContext, useContext, useState, useEffect } from "react";

const FAVORITES_STORAGE_KEY = "tool-suite-favorites";

interface FavoritesContextType {
  favorites: string[];
  addToFavorites: (toolId: string) => void;
  removeFromFavorites: (toolId: string) => void;
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      console.log("Loading favorites from localStorage:", stored);
      if (stored) {
        const parsedFavorites = JSON.parse(stored);
        console.log("Parsed favorites:", parsedFavorites);
        setFavorites(parsedFavorites);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setIsLoaded(true);
    }
  }, []);

  // Save favorites to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load

    try {
      console.log("Saving favorites to localStorage:", favorites);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, [favorites, isLoaded]);

  const addToFavorites = (toolId: string) => {
    setFavorites((prev) => {
      if (!prev.includes(toolId)) {
        return [...prev, toolId];
      }
      return prev;
    });
  };

  const removeFromFavorites = (toolId: string) => {
    setFavorites((prev) => {
      return prev.filter((id) => id !== toolId);
    });
  };

  const toggleFavorite = (toolId: string) => {
    console.log("toggleFavorite called for:", toolId);
    setFavorites((prev) => {
      console.log("Current favorites before toggle:", prev);
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

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
