import { sendMessage } from '@/common/messaging/client';
import storage from '@/common/storage';
import { create } from 'zustand';

interface PopupState {
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

  storage.onChange(storage.key.friendList, (friendList) => {
    const friendCount = friendList?.length ?? 0;
    set({ friendCount });
  });

  return {
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
