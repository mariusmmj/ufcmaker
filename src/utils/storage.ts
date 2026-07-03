import { FightsMap } from "../types";

const STORAGE_KEY_FIGHTS = "ufc_card_fights";
const STORAGE_KEY_EVENT_NAME = "ufc_card_event_name";

export function saveState(fights: FightsMap, eventName: string) {
  try {
    localStorage.setItem(STORAGE_KEY_FIGHTS, JSON.stringify(fights));
    localStorage.setItem(STORAGE_KEY_EVENT_NAME, eventName);
  } catch (err) {
    console.error("Failed to save state to localStorage", err);
  }
}

export function loadState(): { fights: FightsMap | null; eventName: string | null } {
  try {
    const savedFights = localStorage.getItem(STORAGE_KEY_FIGHTS);
    const savedEventName = localStorage.getItem(STORAGE_KEY_EVENT_NAME);
    
    return {
      fights: savedFights ? JSON.parse(savedFights) : null,
      eventName: savedEventName,
    };
  } catch (err) {
    console.error("Failed to load state from localStorage", err);
    return { fights: null, eventName: null };
  }
}
