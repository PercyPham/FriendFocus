import storage, { BlockedPostsLog } from '@/common/storage';
import { storageWriter } from './storage-writer';
import { onMessage, setupMessageListener } from './server';
import { QUERY_KEYS } from '@/common/constants';
import { getTodayDateString } from '@/common/utils';
import { logger } from '@/common/logger';

onMessage('START_COLLECTING_FRIEND_LIST', async (_req, sender) => {
  logger.debug('Received request from tab:', sender);
  try {
    await chrome.windows.create({
      url: `https://www.facebook.com/me/friends?${QUERY_KEYS.FRIENDLIST_BUILDING}=true`,
      type: 'popup',
    });
    logger.debug('Friend list collection initiated in new tab');
  } catch (error) {
    logger.error('Error opening friend list tab:', error);
  }
});

onMessage('SET_FRIEND_FOCUS', async (isFocus, sender) => {
  logger.debug(
    `Received SET_FRIEND_FOCUS request from tab: ${sender.tab?.id} isFocus: ${isFocus}`
  );
  await storageWriter.set(storage.key.isFriendFocus, isFocus);
});

onMessage('SAVE_FRIEND_LIST', async (friendList, sender) => {
  logger.debug('Received friend list from tab:', sender);
  try {
    await storageWriter.set(storage.key.friendList, friendList);
    await storageWriter.set(storage.key.friendCount, friendList.length);
    await storageWriter.set(storage.key.friendListUpdatedAt, Date.now());
    logger.debug(
      `Friend list saved successfully: ${friendList.length} friends`
    );

    // Close the tab
    if (sender.tab?.id) {
      await chrome.tabs.remove(sender.tab.id);
    }
  } catch (error) {
    logger.error('Error saving friend list:', error);
  }
});

onMessage('CLOSE_TAB', async (_req, sender) => {
  logger.debug(`Received CLOSE_TAB request from tab: ${sender.tab?.id}`);
  if (!sender.tab?.id) return;
  await chrome.tabs.remove(sender.tab.id);
});

onMessage('INCREMENT_TODAY_BLOCKED_POSTS_COUNT', async (count, sender) => {
  logger.debug(
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
  logger.debug(
    `Received SET_FOLLOWINGS_ENABLED request from tab: ${sender.tab?.id} isEnabled: ${isEnabled}`
  );
  await storageWriter.set(storage.key.isFollowingsEnabled, isEnabled);
});

onMessage('SET_GROUPS_ENABLED', async (isEnabled, sender) => {
  logger.debug(
    `Received SET_GROUPS_ENABLED request from tab: ${sender.tab?.id} isEnabled: ${isEnabled}`
  );
  await storageWriter.set(storage.key.isGroupsEnabled, isEnabled);
});

onMessage('START_COLLECTING_FOLLOWING_LIST', async (req, sender) => {
  const enableWhenDone = !!req?.enableWhenDone;
  logger.debug('Received request from tab:', sender, { enableWhenDone });
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
    logger.error('Error opening following list tab:', error);
  }
});

onMessage('SAVE_FOLLOWING_LIST', async (followingList, sender) => {
  logger.debug('Received following list from tab:', sender);
  try {
    await storageWriter.set(storage.key.followingList, followingList);
    await storageWriter.set(storage.key.followingCount, followingList.length);
    await storageWriter.set(storage.key.followingListUpdatedAt, Date.now());
    logger.debug(
      `Following list saved successfully: ${followingList.length} following`
    );
  } catch (error) {
    logger.error('Error saving following list:', error);
  }
});

onMessage('START_COLLECTING_GROUP_LIST', async (req, sender) => {
  const enableWhenDone = !!req?.enableWhenDone;
  logger.debug('Received request from tab:', sender, { enableWhenDone });
  try {
    await chrome.windows.create({
      url:
        `https://www.facebook.com/groups/joins` +
        `?${QUERY_KEYS.GROUPLIST_BUILDING}=true` +
        `${
          enableWhenDone ? `&${QUERY_KEYS.GROUPLIST_ENABLE_WHEN_DONE}=true` : ''
        }`,
      type: 'popup',
    });
  } catch (error) {
    logger.error('Error opening group list tab:', error);
  }
});

onMessage('SAVE_GROUP_LIST', async (groupList, sender) => {
  logger.debug('Received group list from tab:', sender);
  try {
    await storageWriter.set(storage.key.groupList, groupList);
    await storageWriter.set(storage.key.groupCount, groupList.length);
    await storageWriter.set(storage.key.groupListUpdatedAt, Date.now());
    logger.debug(`Group list saved successfully: ${groupList.length} groups`);
  } catch (error) {
    logger.error('Error saving group list:', error);
  }
});

setupMessageListener();
