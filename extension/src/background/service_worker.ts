import storage, { BlockedPostsLog } from '@/common/storage';
import { storageWriter } from './storage-writer';
import { onMessage, setupMessageListener } from './server';
import { QUERY_KEYS } from '@/common/constants';
import { getTodayDateString } from '@/common/utils';

onMessage('START_COLLECTING_FRIEND_LIST', async (_req, sender) => {
  console.log('Received request from tab:', sender);
  try {
    await chrome.windows.create({
      url: `https://www.facebook.com/me/friends?${QUERY_KEYS.FRIENDLIST_BUILDING}=true`,
      type: 'popup',
    });
    console.log('Friend list collection initiated in new tab');
  } catch (error) {
    console.error('Error opening friend list tab:', error);
  }
});

onMessage('SET_FRIEND_FOCUS', async (isFocus, sender) => {
  console.log(
    `Received SET_FRIEND_FOCUS request from tab: ${sender.tab?.id} isFocus: ${isFocus}`
  );
  await storageWriter.set(storage.key.isFriendFocus, isFocus);
});

onMessage('SAVE_FRIEND_LIST', async (friendList, sender) => {
  console.log('Received friend list from tab:', sender);
  try {
    await storageWriter.set(storage.key.friendList, friendList);
    await storageWriter.set(storage.key.friendCount, friendList.length);
    await storageWriter.set(storage.key.friendListUpdatedAt, Date.now());
    console.log(`Friend list saved successfully: ${friendList.length} friends`);

    // Close the tab
    if (sender.tab?.id) {
      await chrome.tabs.remove(sender.tab.id);
    }
  } catch (error) {
    console.error('Error saving friend list:', error);
  }
});

onMessage('CLOSE_TAB', async (_req, sender) => {
  console.log(`Received CLOSE_TAB request from tab: ${sender.tab?.id}`);
  if (!sender.tab?.id) return;
  await chrome.tabs.remove(sender.tab.id);
});

onMessage('INCREMENT_TODAY_BLOCKED_POSTS_COUNT', async (count, sender) => {
  console.log(
    'Received INCREMENT_TODAY_BLOCKED_POSTS_COUNT request:',
    count,
    sender
  );

  if (count === 0) return;

  const today = getTodayDateString();
  const log = (await storage.get(storage.key.blockedPostsLog)) || {};

  const cleanedLog: BlockedPostsLog = { [today]: (log[today] || 0) + count };

  await storageWriter.set(storage.key.blockedPostsLog, cleanedLog);
});

onMessage('SET_FOLLOWINGS_ENABLED', async (isEnabled, sender) => {
  console.log(
    `Received SET_FOLLOWINGS_ENABLED request from tab: ${sender.tab?.id} isEnabled: ${isEnabled}`
  );
  await storageWriter.set(storage.key.isFollowingsEnabled, isEnabled);
});

onMessage('SET_GROUPS_ENABLED', async (isEnabled, sender) => {
  console.log(
    `Received SET_GROUPS_ENABLED request from tab: ${sender.tab?.id} isEnabled: ${isEnabled}`
  );
  await storageWriter.set(storage.key.isGroupsEnabled, isEnabled);
});

onMessage('START_COLLECTING_FOLLOWING_LIST', async (req, sender) => {
  const enableWhenDone = !!req?.enableWhenDone;
  console.log('Received request from tab:', sender, { enableWhenDone });
  try {
    await chrome.windows.create({
      url:
        `https://www.facebook.com/me/following` +
        `?${QUERY_KEYS.FOLLOWINGLIST_BUILDING}=true` +
        `${
          enableWhenDone
            ? `&${QUERY_KEYS.FOLLOWINGLIST_ENABLE_WHEN_DONE}=true`
            : ''
        }`,
      type: 'popup',
    });
  } catch (error) {
    console.error('Error opening following list tab:', error);
  }
});

onMessage('SAVE_FOLLOWING_LIST', async (followingList, sender) => {
  console.log('Received following list from tab:', sender);
  try {
    await storageWriter.set(storage.key.followingList, followingList);
    await storageWriter.set(storage.key.followingCount, followingList.length);
    await storageWriter.set(storage.key.followingListUpdatedAt, Date.now());
    console.log(
      `Following list saved successfully: ${followingList.length} following`
    );
  } catch (error) {
    console.error('Error saving following list:', error);
  }
});

setupMessageListener();
