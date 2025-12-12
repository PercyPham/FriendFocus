import storage from '@/common/storage';
import { onMessage, setupMessageListener } from '../common/messaging/server';
import { BUILDING_FRIENDFOCUS_FRIENDLIST_QUERY_KEY } from '@/common/constants';

onMessage('START_COLLECTING_FRIEND_LIST', async (_req, sender) => {
  console.log('Received request from tab:', sender);
  try {
    await chrome.windows.create({
      url: `https://www.facebook.com/me/friends?${BUILDING_FRIENDFOCUS_FRIENDLIST_QUERY_KEY}=true`,
      type: 'popup',
    });
    console.log('Friend list collection initiated in new tab');
  } catch (error) {
    console.error('Error opening friend list tab:', error);
  }
});

onMessage('SET_FRIEND_FOCUS', async (isHidden, sender) => {
  console.log('Received request from tab:', sender);
  await storage.set(storage.key.isFriendFocus, isHidden);
});

onMessage('CLOSE_TAB', async (_req, sender) => {
  console.log('Received request from tab:', sender);
  if (!sender.tab?.id) return;
  await chrome.tabs.remove(sender.tab.id);
});

setupMessageListener();
