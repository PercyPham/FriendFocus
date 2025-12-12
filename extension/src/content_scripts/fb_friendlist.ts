import { getFriendList } from './services/friendlist_service';
import { BUILDING_FRIENDFOCUS_FRIENDLIST_QUERY_KEY } from '@/common/constants';
import { sendMessage } from '@/common/messaging/client';
import storage from '@/common/storage';

console.log('> Loaded: fb_friendlist.ts');

const collectFriendListIfNeeded = async () => {
  const url = new URL(window.location.href);
  const isBuildingFriendList = url.searchParams.get(
    BUILDING_FRIENDFOCUS_FRIENDLIST_QUERY_KEY
  );
  if (!isBuildingFriendList) return;

  const friendList = await getFriendList();

  await storage.set(storage.key.friendList, friendList);

  sendMessage('CLOSE_TAB');
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
