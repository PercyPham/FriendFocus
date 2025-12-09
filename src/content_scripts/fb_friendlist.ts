import { STORAGE } from '@/common/constants';
import { getFriendList } from './services/friendlist_service';

console.log('> Loaded: fb_friendlist.ts');

const collectFriendListIfNeeded = async () => {
  const { isCollectingFriendList } = await chrome.storage.local.get(
    STORAGE.LOCAL.IS_COLLECTING_FRIEND_LIST
  );
  if (!isCollectingFriendList) return;

  await chrome.storage.local.set({
    [STORAGE.LOCAL.IS_COLLECTING_FRIEND_LIST]: false,
  });

  await getFriendList();
};

// Wait for the page to be fully loaded before running
if (document.readyState === 'complete') {
  // Page is already loaded
  collectFriendListIfNeeded();
} else {
  // Wait for the page to finish loading
  window.addEventListener('load', () => {
    collectFriendListIfNeeded();
  });
}
