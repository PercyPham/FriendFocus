import { sendMessage } from '@/common/background_contract/client';
import storage, { KeyType, ValueTypeMap } from '@/common/storage';
import { getTodayDateString } from '@/common/utils';
import { create } from 'zustand';

interface PopupState {
  init: () => Promise<void>;
  initializing: boolean;

  friendCount: number;
  friendListUpdatedAt: number | null;
  buildFriendList: () => Promise<void>;

  isFriendFocus: boolean;
  toggleFriendFocus: () => Promise<void>;
  setFriendFocus: (isFriendFocus: boolean) => Promise<void>;

  isFollowingsEnabled: boolean;
  toggleFollowings: () => Promise<void>;
  followingCount: number;
  buildFollowingsList: (options?: {
    enableWhenDone?: boolean;
  }) => Promise<void>;
  followingListUpdatedAt: number | null;

  isGroupsEnabled: boolean;
  toggleGroups: () => Promise<void>;

  blockedToday: number;
}

export const usePopupStore = create<PopupState>((set, get) => {
  const sync = async <
    KState extends keyof PopupState,
    KStorage extends KeyType
  >(
    stateKey: KState,
    storageKey: KStorage,
    transform?: (
      value: ValueTypeMap[KStorage] | undefined
    ) => PopupState[KState]
  ) => {
    storage.onChange(storageKey, (val) =>
      set({ [stateKey]: transform?.(val) ?? val })
    );
    const val = await storage.get(storageKey);
    set({ [stateKey]: transform?.(val) ?? val });
  };

  return {
    init: async () => {
      set({ initializing: true });

      await Promise.all([
        sync('isFriendFocus', storage.key.isFriendFocus),
        sync('friendCount', storage.key.friendCount),
        sync('friendListUpdatedAt', storage.key.friendListUpdatedAt),
        sync('isFollowingsEnabled', storage.key.isFollowingsEnabled),
        sync('followingCount', storage.key.followingCount),
        sync('followingListUpdatedAt', storage.key.followingListUpdatedAt),
        sync('isGroupsEnabled', storage.key.isGroupsEnabled),
        sync('blockedToday', storage.key.blockedPostsLog, (val) => {
          const today = getTodayDateString();
          return val?.[today] || 0;
        }),
      ]);

      set({ initializing: false });
    },
    initializing: false,

    friendCount: 0,
    friendListUpdatedAt: null,

    isFriendFocus: false,
    toggleFriendFocus: () =>
      sendMessage('SET_FRIEND_FOCUS', !get().isFriendFocus),
    setFriendFocus: (isFriendFocus: boolean) =>
      sendMessage('SET_FRIEND_FOCUS', isFriendFocus),

    buildFriendList: () => sendMessage('START_COLLECTING_FRIEND_LIST'),

    followingCount: 0,
    isFollowingsEnabled: false,
    toggleFollowings: () =>
      sendMessage('SET_FOLLOWINGS_ENABLED', !get().isFollowingsEnabled),
    buildFollowingsList: (options: { enableWhenDone?: boolean } = {}) =>
      sendMessage('START_COLLECTING_FOLLOWING_LIST', options),
    followingListUpdatedAt: null,

    isGroupsEnabled: false,
    toggleGroups: () =>
      sendMessage('SET_GROUPS_ENABLED', !get().isGroupsEnabled),

    blockedToday: 0,
  };
});
