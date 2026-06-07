export interface Fighter {
  name: string;
  division: string | null;
  record: string;
  rank: string;
}

export interface Fight {
  f1: Fighter;
  f2: Fighter;
  lockedDiv: string | null;
}

export interface FightSlot {
  id: string;
  label: string;
  section: "main" | "prelim";
}

export type FighterSlotKey = "f1" | "f2";
export type FightsMap = Record<string, Fight>;
