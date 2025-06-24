import { useState, useEffect } from "react";

export type Theme = "light" | "dark";
export type ColorScheme =
  | "default"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("ui-theme") as Theme;
      // If saved theme is valid, use it; otherwise default to light
      return savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : "light";
    }
    return "light";
  });

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("ui-color-scheme") as ColorScheme) || "default"
      );
    }
    return "default";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(
      "theme-default",
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-orange",
      "theme-red"
    );
    root.classList.add(`theme-${colorScheme}`);
  }, [colorScheme]);

  const updateTheme = (newTheme: Theme) => {
    localStorage.setItem("ui-theme", newTheme);
    setTheme(newTheme);
  };

  const updateColorScheme = (newColorScheme: ColorScheme) => {
    localStorage.setItem("ui-color-scheme", newColorScheme);
    setColorScheme(newColorScheme);
  };

  return {
    theme,
    colorScheme,
    setTheme: updateTheme,
    setColorScheme: updateColorScheme,
  };
}
