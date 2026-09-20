import { FightsMap, FightSlot, SavedCard } from '../types';
import LZString from 'lz-string';

const STORAGE_KEY_FIGHTS = 'ufc_card_fights';
const STORAGE_KEY_EVENT_NAME = 'ufc_card_event_name';
const STORAGE_KEY_SAVED_CARDS = 'ufc_card_saved_cards';

export function saveState(fights: FightsMap, eventName: string, savedCards: SavedCard[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FIGHTS, JSON.stringify(fights));
    localStorage.setItem(STORAGE_KEY_EVENT_NAME, eventName);
    localStorage.setItem(STORAGE_KEY_SAVED_CARDS, JSON.stringify(savedCards));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function loadState(): {
  fights: FightsMap | null;
  eventName: string | null;
  savedCards: SavedCard[];
} {
  try {
    const savedFights = localStorage.getItem(STORAGE_KEY_FIGHTS);
    const savedEventName = localStorage.getItem(STORAGE_KEY_EVENT_NAME);
    const savedCardsStr = localStorage.getItem(STORAGE_KEY_SAVED_CARDS);

    return {
      fights: savedFights ? JSON.parse(savedFights) : null,
      eventName: savedEventName,
      savedCards: savedCardsStr ? JSON.parse(savedCardsStr) : [],
    };
  } catch (err) {
    console.error('Failed to load state from localStorage', err);
    return { fights: null, eventName: null, savedCards: [] };
  }
}

export function encodeStateToUrl(state: { fights: FightsMap; eventName: string; noRestrictions: boolean; slots: FightSlot[] }) {
  try {
    const jsonStr = JSON.stringify(state);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?card=${compressed}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
    return newUrl;
  } catch (err) {
    console.error('Failed to encode state to URL', err);
    return window.location.href;
  }
}

export function decodeStateFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const cardParam = params.get('card');
    if (!cardParam) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(cardParam);
    if (!decompressed) return null;

    return JSON.parse(decompressed);
  } catch (err) {
    console.error('Failed to decode state from URL', err);
    return null;
  }
}
