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
  eventName: string;
  isDark: boolean;

  setEventName: (name: string) => void;
  setIsDark: (isDark: boolean) => void;
  setNoRestrictions: (noRestrictions: boolean) => void;
  setModal: (modal: ModalState | null) => void;
  setSlots: (slots: FightSlot[]) => void;

  handleDragEnd: (event: DragEndEvent) => void;
  handleSelect: (fighter: Fighter) => void;
  handleClear: (fightId: string, slot: FighterSlotKey) => void;
  toggleTitleFight: (fightId: string) => void;
  surpriseMe: () => void;
}

const urlState = decodeStateFromUrl();
const localStorageState = loadState();

const initialState = {
  fights: urlState?.fights || localStorageState.fights || initFights(),
  slots: urlState?.slots || FIGHT_SLOTS,
  eventName: urlState?.eventName || localStorageState.eventName || 'UFC 000',
  noRestrictions: urlState?.noRestrictions ?? false,
};

export const useStore = create<AppState>((set, get) => ({
  fights: initialState.fights,
  slots: initialState.slots,
  noRestrictions: initialState.noRestrictions,
  modal: null,
  eventName: initialState.eventName,
  isDark: false,

  setEventName: (name: string) => set({ eventName: name }),
  setIsDark: (isDark: boolean) => set({ isDark }),
  setNoRestrictions: (noRestrictions: boolean) => set({ noRestrictions }),
  setModal: (modal: ModalState | null) => set({ modal }),
  setSlots: (slots: FightSlot[]) => set({ slots }),

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
      name: fighter.name,
      division: fighter.division,
      record: fighter.record,
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
    const { slots } = get();
    const randomCard = generateRandomCard(slots, allFighters as Fighter[]);
    set({ fights: randomCard });
  },
}));

// Subscribe to store changes to save state automatically
useStore.subscribe((state) => {
  saveState(state.fights, state.eventName);
});
