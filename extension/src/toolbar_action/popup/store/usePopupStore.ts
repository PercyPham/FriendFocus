import { auth } from '@/common/firebaseConfig';
import { sendMessage } from '@/common/messaging/client';
import storage from '@/common/storage';
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from 'firebase/auth';
import { create } from 'zustand';

interface PopupState {
  initialize: () => Promise<void>;

  isInitializing: boolean;

  hasFriendList: boolean;
  buildFriendList: () => Promise<void>;
  isBuildingFriendList: boolean;

  isFriendFocus: boolean;
  setIsFriendFocus: (isFriendFocus: boolean) => Promise<void>;

  user: User | null;

  loginWithGoogle: () => Promise<void>;
  logoutWithGoogle: () => Promise<void>;

  subscription: {
    status: 'trial' | 'active' | 'expired';
    daysLeft: number;
  } | null;

  friendCount: number;
  blockedToday: number;

  upgrade: () => Promise<void>;
}

export const usePopupStore = create<PopupState>((set) => {
  storage.onChange(storage.key.isFriendFocus, (isFriendFocus) => {
    set({ isFriendFocus });
  });

  storage.onChange(storage.key.friendList, (friendList) => {
    set({ friendCount: friendList?.length ?? 0 });
  });

  onAuthStateChanged(auth, (user) => set({ user }));

  return {
    isInitializing: true,
    hasFriendList: false,

    initialize: async () => {
      set({ isInitializing: true });

      const isFriendFocus = await storage.get(storage.key.isFriendFocus);
      const friendList = await storage.get(storage.key.friendList);
      const friendCount = friendList?.length ?? 0;
      const hasFriendList = friendCount > 0;

      await auth.authStateReady();

      set({
        isInitializing: false,
        isFriendFocus: isFriendFocus,
        friendCount: friendList?.length ?? 0,
        hasFriendList: hasFriendList,
      });
    },

    isFriendFocus: false,
    setIsFriendFocus: async (isFriendFocus: boolean) => {
      console.log('> setIsFriendFocus:', isFriendFocus);
      await storage.set(storage.key.isFriendFocus, isFriendFocus);
      set({ isFriendFocus });
    },

    isBuildingFriendList: false,
    buildFriendList: async () => {
      sendMessage('START_COLLECTING_FRIEND_LIST');
      // chrome.windows.create({
      //   url: `https://www.facebook.com/me/friends?${BUILDING_FRIENDFOCUS_FRIENDLIST_QUERY_KEY}=true`,
      //   type: 'popup',
      // });
    },

    user: null,

    loginWithGoogle: async () => {
      // 1. Get the Google Auth Token via Chrome Identity API
      const token = await chrome.identity.getAuthToken({ interactive: true });
      if (chrome.runtime.lastError || !token.token) {
        console.error('Login failed:', chrome.runtime.lastError);
        return;
      }

      // 2. Create a Firebase Credential using the Google Token
      const credential = GoogleAuthProvider.credential(null, token.token);

      try {
        // 3. Sign in to Firebase with that credential
        await signInWithCredential(auth, credential);
        console.log('Firebase login success!');
      } catch (error) {
        console.error('Firebase Auth Error:', error);
      }
    },

    logoutWithGoogle: async () => {
      // 1. Get the current token first
      const token = await chrome.identity.getAuthToken({ interactive: false });

      // 2. Remove the cached token from Chrome's storage
      if (token && token.token) {
        await chrome.identity.removeCachedAuthToken({ token: token.token });
      }
      // 3. Sign out from Firebase
      await signOut(auth);
      set({ user: null });
    },

    subscription: null,

    friendCount: 0,
    blockedToday: 0,

    upgrade: async () => {
      console.log('> onUpgrade');
    },
  };
});
