import { sendMessage } from '@/common/background_contract/client';
import storage from '@/common/storage';
import { create } from 'zustand';

interface PopupState {
  init: () => Promise<void>;
  initializing: boolean;

  hasFriendList: boolean;
  friendCount: number;
  buildFriendList: () => Promise<void>;

  isFriendFocus: boolean;
  setFriendFocus: (isFriendFocus: boolean) => Promise<void>;

  blockedToday: number;
}

export const usePopupStore = create<PopupState>((set) => {
  storage.onChange(storage.key.isFriendFocus, (isFriendFocus) => {
    set({ isFriendFocus });
  });

  storage.onChange(storage.key.hasFriendList, (hasFriendList) => {
    set({ hasFriendList });
  });

  storage.onChange(storage.key.friendCount, (friendCount) => {
    set({ friendCount });
  });

  return {
    init: async () => {
      set({ initializing: true });

      const hasFriendList = await storage.get(storage.key.hasFriendList);
      const friendCount = await storage.get(storage.key.friendCount);
      const isFriendFocus = await storage.get(storage.key.isFriendFocus);

      set({ hasFriendList, friendCount, isFriendFocus, initializing: false });
    },
    initializing: false,

    hasFriendList: false,
    friendCount: 0,

    isFriendFocus: false,
    setFriendFocus: async (isFriendFocus: boolean) => {
      sendMessage('SET_FRIEND_FOCUS', isFriendFocus);
    },

    buildFriendList: async () => {
      sendMessage('START_COLLECTING_FRIEND_LIST');
    },

    blockedToday: 100,
  };
});
