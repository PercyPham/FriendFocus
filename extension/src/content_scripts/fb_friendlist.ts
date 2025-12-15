import { getFriendList } from './services/friendlist_service';
import { BUILDING_FRIENDFOCUS_FRIENDLIST_QUERY_KEY } from '@/common/constants';
import { sendMessage } from '@/common/background_contract/client';

console.debug('> Loaded: fb_friendlist.ts');

const collectFriendListIfNeeded = async () => {
  const url = new URL(window.location.href);
  const isBuildingFriendList = url.searchParams.get(
    BUILDING_FRIENDFOCUS_FRIENDLIST_QUERY_KEY
  );
  if (!isBuildingFriendList) return;

  const friendList = await getFriendList();

  // Send friend list to background for storage
  await sendMessage('SAVE_FRIEND_LIST', friendList);
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
