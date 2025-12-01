import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme: (theme) => set({ theme }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
