import { create } from 'zustand';
import { FightsMap, Fighter, FighterSlotKey, FightSlot } from '../types';
import { FIGHT_SLOTS, emptyFighter, initFights } from '../constants';
import { loadState, saveState, decodeStateFromUrl } from '../utils/storage';
import { generateRandomCard } from '../utils/randomizer';
import allFighters from '../data/fighters.json';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export interface ModalState {
  fightId: string;
  slot: FighterSlotKey;
}

interface AppState {
  fights: FightsMap;
  slots: FightSlot[];
  noRestrictions: boolean;
  modal: ModalState | null;
  infoModal: Fighter | null;
  taleModal: import('../types').Fight | null;
  historyModalOpen: boolean;
  saveModalOpen: boolean;
  helpModalOpen: boolean;
  toastMessage: string | null;
  eventName: string;
  isDark: boolean;
  pickemMode: boolean;
  picks: Record<string, import('../types').FightPick | FighterSlotKey | null>;
  savedCards: import('../types').SavedCard[];

  setEventName: (name: string) => void;
  setIsDark: (isDark: boolean) => void;
  setNoRestrictions: (noRestrictions: boolean) => void;
  setModal: (modal: ModalState | null) => void;
  setInfoModal: (fighter: Fighter | null) => void;
  setTaleModal: (fight: import('../types').Fight | null) => void;
  setHistoryModalOpen: (open: boolean) => void;
  setSaveModalOpen: (open: boolean) => void;
  setHelpModalOpen: (open: boolean) => void;
  setToastMessage: (msg: string | null) => void;
  setSlots: (slots: FightSlot[]) => void;
  setPickemMode: (mode: boolean) => void;
  setPick: (fightId: string, pick: FighterSlotKey | null) => void;
  setPickDetails: (fightId: string, method?: import('../types').PickMethod, round?: import('../types').PickRound) => void;
  setTitleType: (fightId: string, titleType: import('../types').TitleType | null) => void;

  saveCurrentCard: (name: string) => boolean;
  loadCard: (id: string) => void;
  deleteCard: (id: string) => void;

  handleDragEnd: (event: DragEndEvent) => void;
  handleSelect: (fighter: Fighter) => void;
  handleClear: (fightId: string, slot: FighterSlotKey) => void;
  toggleTitleFight: (fightId: string) => void;
  surpriseMe: () => void;
  clearCard: () => void;
}

const urlState = decodeStateFromUrl();
const localStorageState = loadState();

const initialState = {
  fights: urlState?.fights || localStorageState.fights || initFights(),
  slots: urlState?.slots || FIGHT_SLOTS,
  eventName: urlState?.eventName || localStorageState.eventName || 'UFC 000',
  noRestrictions: urlState?.noRestrictions ?? false,
  pickemMode: urlState?.pickemMode ?? false,
  picks: urlState?.picks ?? {},
  savedCards: localStorageState.savedCards || [],
};

export const useStore = create<AppState>((set, get) => ({
  fights: initialState.fights,
  slots: initialState.slots,
  noRestrictions: initialState.noRestrictions,
  savedCards: initialState.savedCards,
  modal: null,
  infoModal: null,
  taleModal: null,
  historyModalOpen: false,
  saveModalOpen: false,
  helpModalOpen: false,
  toastMessage: null,
  eventName: initialState.eventName,
  isDark: false,
  pickemMode: initialState.pickemMode,
  picks: initialState.picks,

  setEventName: (name: string) => set({ eventName: name }),
  setIsDark: (isDark: boolean) => set({ isDark }),
  setNoRestrictions: (noRestrictions: boolean) => set({ noRestrictions }),
  setModal: (modal: ModalState | null) => set({ modal }),
  setInfoModal: (fighter: Fighter | null) => set({ infoModal: fighter }),
  setTaleModal: (fight: import('../types').Fight | null) => set({ taleModal: fight }),
  setHistoryModalOpen: (open: boolean) => set({ historyModalOpen: open }),
  setSaveModalOpen: (open: boolean) => set({ saveModalOpen: open }),
  setHelpModalOpen: (open: boolean) => set({ helpModalOpen: open }),
  setToastMessage: (msg: string | null) => set({ toastMessage: msg }),
  setSlots: (slots: FightSlot[]) => set({ slots }),
  setPickemMode: (mode: boolean) => set({ pickemMode: mode }),
  setPick: (fightId: string, winner: FighterSlotKey | null) => {
    set((state) => {
      if (!winner) {
        const newPicks = { ...state.picks };
        delete newPicks[fightId];
        return { picks: newPicks };
      }
      const existing = state.picks[fightId];
      const existingWinner = typeof existing === 'string' ? existing : existing?.winner;

      if (existingWinner === winner) {
        const newPicks = { ...state.picks };
        delete newPicks[fightId];
        return { picks: newPicks };
      }

      return {
        picks: {
          ...state.picks,
          [fightId]: { winner },
        },
      };
    });
  },
  setPickDetails: (fightId: string, method?: import('../types').PickMethod, round?: import('../types').PickRound) => {
    set((state) => {
      const existing = state.picks[fightId];
      if (!existing) return state;
      const winner = typeof existing === 'string' ? existing : existing.winner;
      return {
        picks: {
          ...state.picks,
          [fightId]: {
            winner,
            method,
            round,
          },
        },
      };
    });
  },
  setTitleType: (fightId: string, titleType: import('../types').TitleType | null) => {
    const { fights } = get();
    const current = fights[fightId];
    if (!current) return;
    const isTitle = !!titleType;
    set({
      fights: {
        ...fights,
        [fightId]: {
          ...current,
          isTitleFight: isTitle,
          titleType,
          rounds: (isTitle ? 5 : 3) as 3 | 5,
        },
      },
    });
  },

  saveCurrentCard: (name: string) => {
    const state = get();
    if (state.savedCards.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return false; // Name already exists
    }
    
    const newCard: import('../types').SavedCard = {
      id: Date.now().toString(),
      name,
      dateSaved: Date.now(),
      fights: state.fights,
      slots: state.slots,
      noRestrictions: state.noRestrictions,
    };
    set({ savedCards: [newCard, ...state.savedCards] });
    return true;
  },

  loadCard: (id: string) => {
    const state = get();
    const card = state.savedCards.find(c => c.id === id);
    if (card) {
      set({
        fights: card.fights,
        slots: card.slots,
        eventName: card.name,
        noRestrictions: card.noRestrictions,
        historyModalOpen: false,
      });
    }
  },

  deleteCard: (id: string) => {
    const state = get();
    set({ savedCards: state.savedCards.filter(c => c.id !== id) });
  },

  handleDragEnd: (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      set((state) => {
        const oldIndex = state.slots.findIndex((i) => i.id === active.id);
        const newIndex = state.slots.findIndex((i) => i.id === over.id);
        return { slots: arrayMove(state.slots, oldIndex, newIndex) };
      });
    }
  },

  handleSelect: (fighter: Fighter) => {
    const { modal, noRestrictions, fights } = get();
    if (!modal) return;

    const { fightId, slot } = modal;

    const newFight = {
      ...fights[fightId],
      f1: { ...fights[fightId].f1 },
      f2: { ...fights[fightId].f2 },
    };
    newFight[slot] = {
      ...fighter,
      rank: fighter.rank ?? '',
    };

    if (!noRestrictions) {
      const other = slot === 'f1' ? newFight.f2 : newFight.f1;
      if (!other.name) newFight.lockedDiv = fighter.division;
    }

    set({
      fights: { ...fights, [fightId]: newFight },
      modal: null,
    });
  },

  handleClear: (fightId: string, slot: FighterSlotKey) => {
    const { fights } = get();
    const newFight = {
      ...fights[fightId],
      f1: { ...fights[fightId].f1 },
      f2: { ...fights[fightId].f2 },
    };
    newFight[slot] = emptyFighter();
    if (!newFight.f1.name && !newFight.f2.name) newFight.lockedDiv = null;

    set({
      fights: { ...fights, [fightId]: newFight },
    });
  },

  toggleTitleFight: (fightId: string) => {
    const { fights } = get();
    const current = fights[fightId];
    if (!current) return;

    let nextTitleType: import('../types').TitleType | null = null;
    let isTitle = false;

    if (!current.isTitleFight || !current.titleType) {
      nextTitleType = 'undisputed';
      isTitle = true;
    } else if (current.titleType === 'undisputed') {
      nextTitleType = 'interim';
      isTitle = true;
    } else if (current.titleType === 'interim') {
      nextTitleType = 'bmf';
      isTitle = true;
    } else {
      nextTitleType = null;
      isTitle = false;
    }

    set({
      fights: {
        ...fights,
        [fightId]: {
          ...current,
          isTitleFight: isTitle,
          titleType: nextTitleType,
          rounds: (isTitle ? 5 : 3) as 3 | 5,
        },
      },
    });
  },

  surpriseMe: () => {
    const { slots, noRestrictions } = get();
    set({
      fights: generateRandomCard(slots, allFighters as Fighter[], noRestrictions),
    });
  },

  clearCard: () => {
    set({ fights: initFights() });
  },
}));

// Subscribe to store changes to save state automatically
useStore.subscribe((state) => {
  saveState(state.fights, state.eventName, state.savedCards);
});
