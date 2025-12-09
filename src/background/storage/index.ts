// src/_infrastructure/storage/index.ts

export interface SettingsData {
  isHidden: boolean;
  friendSlugs: string[];
}

const KEYS = {
  IS_HIDDEN: 'is_hide_non_friend_posts',
  FRIEND_SLUGS: 'friend_slugs',
};

export const storageRepo = {
  /**
   * Saves the current settings state
   */
  save: async (data: Partial<SettingsData>): Promise<void> => {
    const payload: Record<string, any> = {};

    if (data.isHidden !== undefined) {
      payload[KEYS.IS_HIDDEN] = data.isHidden;
    }

    if (data.friendSlugs !== undefined) {
      payload[KEYS.FRIEND_SLUGS] = data.friendSlugs;
    }

    await chrome.storage.sync.set(payload);
  },

  /**
   * Retrieves the settings state
   */
  get: async (): Promise<SettingsData> => {
    const result = await chrome.storage.sync.get([
      KEYS.IS_HIDDEN,
      KEYS.FRIEND_SLUGS,
    ]);

    return {
      isHidden: (result[KEYS.IS_HIDDEN] as boolean) ?? false,
      friendSlugs: (result[KEYS.FRIEND_SLUGS] as string[]) ?? [],
    };
  },
};
