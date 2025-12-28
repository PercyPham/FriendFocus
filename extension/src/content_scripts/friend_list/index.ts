import { getFriendList } from './friendlist_service';
import { QUERY_KEYS } from '@/common/constants';
import { sendMessage } from '@/common/background_contract/client';

console.debug('> Loaded: friend_list/index.ts');

const collectFriendListIfNeeded = async () => {
  const url = new URL(window.location.href);
  const isBuildingFriendList = url.searchParams.get(
    QUERY_KEYS.FRIENDLIST_BUILDING
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

