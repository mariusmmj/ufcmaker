export interface Fighter {
  name: string;
  division: string | null;
  record: string;
  rank: string;
  image?: string;
  fullBodyImage?: string;
  age?: number;
  winMethods?: {
    ko: number;
    sub: number;
    dec: number;
  };
}

export type TitleType = 'undisputed' | 'interim' | 'bmf';

export type PickMethod = 'KO/TKO' | 'SUB' | 'DEC';
export type PickRound = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'DEC';

export interface FightPick {
  winner: FighterSlotKey;
  method?: PickMethod;
  round?: PickRound;
}

export interface Fight {
  f1: Fighter;
  f2: Fighter;
  lockedDiv: string | null;
  isTitleFight?: boolean;
  titleType?: TitleType | null;
  rounds?: 3 | 5;
}

export interface FightSlot {
  id: string;
  label: string;
  section: 'main' | 'prelim';
}

export type FighterSlotKey = 'f1' | 'f2';
export type FightsMap = Record<string, Fight>;

export interface SavedCard {
  id: string;
  name: string;
  dateSaved: number;
  fights: FightsMap;
  slots: FightSlot[];
  noRestrictions: boolean;
}
