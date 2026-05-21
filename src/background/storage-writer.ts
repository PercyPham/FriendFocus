import type { KeyType, ValueTypeMap } from '@/common/storage';

// Write access to storage - ONLY for background service worker
export const storageWriter = {
  set: async <K extends KeyType>(key: K, value: ValueTypeMap[K]) => {
    await chrome.storage.local.set({ [key]: value });
  },
};

