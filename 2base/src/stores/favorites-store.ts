import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";

interface FavoritesStore {
  favorites: string[];
  addToFavorites: (toolId: string) => void;
  removeFromFavorites: (toolId: string) => void;
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addToFavorites: (toolId: string) => {
        set((state) => {
          if (!state.favorites.includes(toolId)) {
            return { favorites: [...state.favorites, toolId] };
          }
          return state;
        });
      },

      removeFromFavorites: (toolId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== toolId),
        }));
      },

      toggleFavorite: (toolId: string) => {
        set((state) => {
          if (state.favorites.includes(toolId)) {
            return { favorites: state.favorites.filter((id) => id !== toolId) };
          } else {
            return { favorites: [...state.favorites, toolId] };
          }
        });
      },

      isFavorite: (toolId: string) => {
        return get().favorites.includes(toolId);
      },
    }),
    {
      name: "tool-suite-favorites",
    }
  )
);

// 精确订阅的选择器hooks
export const useFavoritesList = () =>
  useFavoritesStore((state) => state.favorites);

export const useIsFavorite = (toolId: string) =>
  useFavoritesStore((state) => state.favorites.includes(toolId));

// 使用 useMemo 缓存 actions 对象，防止无限循环
export const useFavoriteActions = () => {
  const addToFavorites = useFavoritesStore((state) => state.addToFavorites);
  const removeFromFavorites = useFavoritesStore(
    (state) => state.removeFromFavorites
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return useMemo(
    () => ({
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
    }),
    [addToFavorites, removeFromFavorites, toggleFavorite]
  );
};

export const useFavoriteCount = () =>
  useFavoritesStore((state) => state.favorites.length);
