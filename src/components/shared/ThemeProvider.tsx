"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setResolvedTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (resolvedTheme: "light" | "dark") => {
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
      setResolvedTheme(resolvedTheme);
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        applyTheme(e.matches ? "dark" : "light");
      };

      // Initial check
      handleChange(mediaQuery);

      // Listen for changes
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      applyTheme(theme);
    }
  }, [theme, setResolvedTheme]);

  return <>{children}</>;
}
