import storage from '@/common/storage';
import { storageWriter } from './storage-writer';
import { onMessage, setupMessageListener } from './server';
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

onMessage('SET_FRIEND_FOCUS', async (isFocus, sender) => {
  console.log('Received SET_FRIEND_FOCUS request from tab:', sender);

  // Save to storage - storage change events will propagate to content scripts
  await storageWriter.set(storage.key.isFriendFocus, isFocus);

  console.log('Friend focus set to:', isFocus);
});

onMessage('SAVE_FRIEND_LIST', async (friendList, sender) => {
  console.log('Received friend list from tab:', sender);
  try {
    await storageWriter.set(storage.key.friendList, friendList);
    await storageWriter.set(storage.key.friendCount, friendList.length);
    await storageWriter.set(storage.key.hasFriendList, true);
    console.log(
      'Friend list saved successfully:',
      friendList.length,
      'friends'
    );

    // Close the tab
    if (sender.tab?.id) {
      await chrome.tabs.remove(sender.tab.id);
    }
  } catch (error) {
    console.error('Error saving friend list:', error);
  }
});

onMessage('CLOSE_TAB', async (_req, sender) => {
  console.log('Received request from tab:', sender);
  if (!sender.tab?.id) return;
  await chrome.tabs.remove(sender.tab.id);
});

setupMessageListener();
