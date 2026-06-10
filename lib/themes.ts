"use client";

import {
  Sun,
  Moon,
  Monitor,
  Zap,
  Snowflake,
  Palette,
  Terminal,
  BookOpen,
  Leaf,
  Contrast,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * All supported theme identifiers.
 * "system" is special (resolved at runtime by next-themes).
 */
export type ThemeId =
  | "light"
  | "dark"
  | "midnight"
  | "nord"
  | "dracula"
  | "cyberpunk"
  | "solarized"
  | "monokai"
  | "sepia"
  | "emerald"
  | "system";

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  Icon: LucideIcon;
  isDark: boolean;
  description?: string;
}

/**
 * Source of truth for the theme selector.
 * Order here controls menu order (System first for discoverability).
 */
export const THEMES: ThemeConfig[] = [
  {
    id: "system",
    label: "System",
    Icon: Monitor,
    isDark: false, // resolved dynamically
    description: "Follows your OS / browser preference",
  },
  {
    id: "light",
    label: "Light",
    Icon: Sun,
    isDark: false,
    description: "Clean zinc light — daytime & bright rooms",
  },
  {
    id: "dark",
    label: "Dark (Classic)",
    Icon: Moon,
    isDark: true,
    description: "Zinc dark — the original crypto terminal look",
  },
  {
    id: "midnight",
    label: "Midnight (OLED)",
    Icon: Contrast,
    isDark: true,
    description: "Near-black, minimal blue light, great for OLED",
  },
  {
    id: "nord",
    label: "Nord",
    Icon: Snowflake,
    isDark: true,
    description: "Cool Arctic palette — calm & focused",
  },
  {
    id: "dracula",
    label: "Dracula",
    Icon: Palette,
    isDark: true,
    description: "Purple & pink neon on dark — vibrant classic",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    Icon: Zap,
    isDark: true,
    description: "Magenta + cyan neon — high-energy futuristic",
  },
  {
    id: "solarized",
    label: "Solarized Dark",
    Icon: BookOpen,
    isDark: true,
    description: "Low-contrast warm/cool balance — long sessions",
  },
  {
    id: "monokai",
    label: "Monokai",
    Icon: Terminal,
    isDark: true,
    description: "Rich dark with bright orange/yellow pops",
  },
  {
    id: "sepia",
    label: "Sepia",
    Icon: BookOpen,
    isDark: false,
    description: "Warm paper-like light — reduced eye strain",
  },
  {
    id: "emerald",
    label: "Emerald",
    Icon: Leaf,
    isDark: true,
    description: "Dark with strong finance-green accent",
  },
];

/** Explicit (non-system) theme ids — used for next-themes `themes` prop. */
export const EXPLICIT_THEME_IDS = THEMES.filter((t) => t.id !== "system").map(
  (t) => t.id
) as Exclude<ThemeId, "system">[];

export function getThemeConfig(id: string | undefined): ThemeConfig {
  if (!id) return THEMES[2]; // default to classic dark
  return THEMES.find((t) => t.id === id) ?? THEMES[2];
}

// ---------------------------------------------------------------------------
// Chart colors (JS mirror of the visual intent per theme)
// These are fed to lightweight-charts at creation time.
// ---------------------------------------------------------------------------

export type ChartColorSet = {
  textColor: string;
  gridColor: string;
  liveLineColor: string;
  upColor?: string; // optional override of the conventional green
  downColor?: string;
};

const defaultDark: ChartColorSet = {
  textColor: "hsl(0 0% 70%)",
  gridColor: "hsl(240 3.7% 15.9%)",
  liveLineColor: "hsl(200 80% 60%)",
};

const defaultLight: ChartColorSet = {
  textColor: "hsl(240 5% 35%)",
  gridColor: "hsl(240 6% 90%)",
  liveLineColor: "hsl(200 70% 45%)",
};

export const CHART_COLORS: Record<Exclude<ThemeId, "system">, ChartColorSet> = {
  light: defaultLight,
  dark: defaultDark,
  midnight: {
    ...defaultDark,
    gridColor: "hsl(0 0% 10%)",
    liveLineColor: "hsl(180 70% 55%)",
  },
  nord: {
    textColor: "hsl(220 10% 75%)",
    gridColor: "hsl(220 16% 30%)",
    liveLineColor: "hsl(195 80% 65%)",
  },
  dracula: {
    ...defaultDark,
    liveLineColor: "hsl(265 80% 70%)",
  },
  cyberpunk: {
    textColor: "hsl(0 0% 82%)",
    gridColor: "hsl(240 6% 11%)",
    liveLineColor: "hsl(180 100% 65%)",
  },
  solarized: {
    textColor: "hsl(42 15% 65%)",
    gridColor: "hsl(42 10% 25%)",
    liveLineColor: "hsl(200 70% 55%)",
  },
  monokai: {
    ...defaultDark,
    liveLineColor: "hsl(45 90% 65%)",
  },
  sepia: {
    ...defaultLight,
    textColor: "hsl(30 15% 32%)",
    gridColor: "hsl(30 12% 82%)",
  },
  emerald: {
    ...defaultDark,
    liveLineColor: "hsl(145 70% 55%)",
  },
};

export function getChartColors(theme: string | undefined): ChartColorSet {
  if (!theme || theme === "system") {
    return defaultDark;
  }
  return (
    CHART_COLORS[theme as Exclude<ThemeId, "system">] ?? defaultDark
  );
}
