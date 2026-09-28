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
  historyModalOpen: boolean;
  saveModalOpen: boolean;
  toastMessage: string | null;
  eventName: string;
  isDark: boolean;
  savedCards: import('../types').SavedCard[];

  setEventName: (name: string) => void;
  setIsDark: (isDark: boolean) => void;
  setNoRestrictions: (noRestrictions: boolean) => void;
  setModal: (modal: ModalState | null) => void;
  setInfoModal: (fighter: Fighter | null) => void;
  setHistoryModalOpen: (open: boolean) => void;
  setSaveModalOpen: (open: boolean) => void;
  setToastMessage: (msg: string | null) => void;
  setSlots: (slots: FightSlot[]) => void;

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
  savedCards: localStorageState.savedCards || [],
};

export const useStore = create<AppState>((set, get) => ({
  fights: initialState.fights,
  slots: initialState.slots,
  noRestrictions: initialState.noRestrictions,
  savedCards: initialState.savedCards,
  modal: null,
  infoModal: null,
  historyModalOpen: false,
  saveModalOpen: false,
  toastMessage: null,
  eventName: initialState.eventName,
  isDark: false,

  setEventName: (name: string) => set({ eventName: name }),
  setIsDark: (isDark: boolean) => set({ isDark }),
  setNoRestrictions: (noRestrictions: boolean) => set({ noRestrictions }),
  setModal: (modal: ModalState | null) => set({ modal }),
  setInfoModal: (fighter: Fighter | null) => set({ infoModal: fighter }),
  setHistoryModalOpen: (open: boolean) => set({ historyModalOpen: open }),
  setSaveModalOpen: (open: boolean) => set({ saveModalOpen: open }),
  setToastMessage: (msg: string | null) => set({ toastMessage: msg }),
  setSlots: (slots: FightSlot[]) => set({ slots }),

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
    const newFight = { ...fights[fightId] };
    newFight.isTitleFight = !newFight.isTitleFight;
    newFight.rounds = newFight.isTitleFight ? 5 : 3;

    set({
      fights: { ...fights, [fightId]: newFight },
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
