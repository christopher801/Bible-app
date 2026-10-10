import { useSyncExternalStore } from 'react';
import { storage } from '../services/storageService.js';
import { pwa } from '../services/pwaService.js';

/** Subscribes a component to a validated localStorage key. */
export function useStored(key) {
  return useSyncExternalStore(storage.subscribe, () => storage.get(key));
}

export function usePwa() {
  return useSyncExternalStore(pwa.subscribe, pwa.getState);
}
