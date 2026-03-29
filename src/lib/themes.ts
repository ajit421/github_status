// src/lib/themes.ts

export interface Theme {
  bg: string;
  text: string;
  icon: string;
  border: string;
  ring: string;
  fire: string;
  currStreak: string;
  side: string;
  bar: string;
  title: string;
}

export const THEMES = {
  default: {
    bg: "#ffffff",
    text: "#333333",
    icon: "#4c71f2",
    border: "#e4e2e2",
    ring: "#4c71f2",
    fire: "#fb8c00",
    currStreak: "#333333",
    side: "#333333",
    bar: "#4c71f2",
    title: "#333333",
  },
  dark: {
    bg: "#0d1117",
    text: "#ffffff",
    icon: "#2f81f7",
    border: "#e4e2e2",
    ring: "#2f81f7",
    fire: "#fb8c00",
    currStreak: "#ffffff",
    side: "#ffffff",
    bar: "#2f81f7",
    title: "#ffffff",
  },
  tokyonight: {
    bg: "#1a1b26",
    text: "#7aa2f7",
    icon: "#bb9af7",
    border: "#1a1b26",
    ring: "#7aa2f7",
    fire: "#ff9e64",
    currStreak: "#7aa2f7",
    side: "#7aa2f7",
    bar: "#bb9af7",
    title: "#7aa2f7",
  },
  radical: {
    bg: "#141321",
    text: "#a9fef7",
    icon: "#fe428e",
    border: "#141321",
    ring: "#fe428e",
    fire: "#fe428e",
    currStreak: "#a9fef7",
    side: "#a9fef7",
    bar: "#fe428e",
    title: "#fe428e",
  },
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;
