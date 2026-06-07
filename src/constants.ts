import { Fight, FightSlot, Fighter } from "./types";

export const FIGHT_SLOTS: FightSlot[] = [
  { id: "m1", label: "MAIN EVENT",        section: "main" },
  { id: "m2", label: "CO-MAIN EVENT",     section: "main" },
  { id: "m3", label: "MAIN CARD",         section: "main" },
  { id: "m4", label: "MAIN CARD",         section: "main" },
  { id: "m5", label: "MAIN CARD",         section: "main" },
  { id: "m6", label: "MAIN CARD OPENER",  section: "main" },
  { id: "p1", label: "PRELIM",            section: "prelim" },
  { id: "p2", label: "PRELIM",            section: "prelim" },
  { id: "p3", label: "PRELIM",            section: "prelim" },
  { id: "p4", label: "PRELIM",            section: "prelim" },
  { id: "p5", label: "PRELIM",            section: "prelim" },
  { id: "p6", label: "PRELIM OPENER",     section: "prelim" },
];

// Tailwind-safe color maps (used via inline styles for dynamic division colors)
export const DIVISION_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  Strawweight:      { text: "#9d174d", bg: "#fdf2f8", border: "#fbcfe8" },
  Flyweight:        { text: "#5b21b6", bg: "#f5f3ff", border: "#ddd6fe" },
  Bantamweight:     { text: "#1e3a8a", bg: "#eff6ff", border: "#bfdbfe" },
  Featherweight:    { text: "#075985", bg: "#f0f9ff", border: "#bae6fd" },
  Lightweight:      { text: "#155e75", bg: "#ecfeff", border: "#a5f3fc" },
  Welterweight:     { text: "#14532d", bg: "#f0fdf4", border: "#bbf7d0" },
  Middleweight:     { text: "#78350f", bg: "#fffbeb", border: "#fde68a" },
  "Light Heavyweight": { text: "#7c2d12", bg: "#fff7ed", border: "#fed7aa" },
  Heavyweight:      { text: "#7f1d1d", bg: "#fef2f2", border: "#fecaca" },
};

export const emptyFighter = (): Fighter => ({ name: "", division: null, record: "", rank: "" });
export const emptyFight   = (): Fight   => ({ f1: emptyFighter(), f2: emptyFighter(), lockedDiv: null });
export const initFights   = (): FightsMap =>
  Object.fromEntries(FIGHT_SLOTS.map((s) => [s.id, emptyFight()]));

type FightsMap = Record<string, Fight>;
