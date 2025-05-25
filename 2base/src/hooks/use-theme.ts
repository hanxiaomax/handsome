import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";
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
      return (localStorage.getItem("ui-theme") as Theme) || "system";
    }
    return "system";
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

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
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
