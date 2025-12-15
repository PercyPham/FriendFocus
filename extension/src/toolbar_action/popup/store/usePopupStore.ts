import { sendMessage } from '@/common/background_contract/client';
import storage from '@/common/storage';
import { getTodayDateString } from '@/common/utils';
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

  storage.onChange(storage.key.blockedPostsLog, (blockedPostsLog) => {
    const today = getTodayDateString();
    const blockedToday = blockedPostsLog?.[today] || 0;
    set({ blockedToday });
  });

  return {
    init: async () => {
      set({ initializing: true });

      const hasFriendList = await storage.get(storage.key.hasFriendList);
      const friendCount = await storage.get(storage.key.friendCount);
      const isFriendFocus = await storage.get(storage.key.isFriendFocus);
      const blockedPostsLog = await storage.get(storage.key.blockedPostsLog);
      
      const today = getTodayDateString();
      const blockedToday = blockedPostsLog?.[today] || 0;

      set({ hasFriendList, friendCount, isFriendFocus, blockedToday, initializing: false });
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

    blockedToday: 0,
  };
});
