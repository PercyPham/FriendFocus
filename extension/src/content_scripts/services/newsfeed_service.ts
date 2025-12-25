import storage from '@/common/storage';
import { findFeedPosts, isFriendPost, isGroupPost } from './newsfeed_utils';
import { sendMessage } from '@/common/background_contract/client';

const NOT_ALLOWED = 'friendfocus-not-allowed';

const hidePostIfNeeded = (post: Element): boolean => {
  const isAlreadyHidden = post.getAttribute(NOT_ALLOWED) === 'true';
  if (isAlreadyHidden) return false;

  post.setAttribute(NOT_ALLOWED, 'true');
  const firstChild = post.firstChild as HTMLElement;
  if (firstChild) {
    firstChild.setAttribute('style', 'display: none !important;');
  }
  return true;
};

const unhidePost = (post: Element) => {
  const firstChild = post.firstChild as HTMLElement;
  if (firstChild) {
    firstChild.removeAttribute('style');
  }
};

const unhideHiddenPosts = () => {
  const hiddenPosts = document.querySelectorAll(`[${NOT_ALLOWED}]`);
  hiddenPosts.forEach((post) => {
    unhidePost(post);
  });
};

let friendSlugSet: Set<string> | null = null;

const getFriendSlugSet = async () => {
  if (friendSlugSet) return friendSlugSet;

  const friendList = await storage.get(storage.key.friendList);
  if (!friendList) {
    friendSlugSet = new Set<string>();
  } else {
    friendSlugSet = new Set(friendList.map((friend) => friend.slug));
  }
  return friendSlugSet;
};

export const updateFriendFocus = async () => {
  const isFriendFocus = await storage.get(storage.key.isFriendFocus);
  if (!isFriendFocus) {
    unhideHiddenPosts();
    return;
  }

  const feedPosts = findFeedPosts();
  if (!feedPosts?.length) return;

  const isGroupsEnabled = await storage.get(storage.key.isGroupsEnabled);
  const friendSlugsSet = await getFriendSlugSet();

  const isAllowedPost = (post: Element) =>
    (isGroupsEnabled && isGroupPost(post)) ||
    isFriendPost(post, friendSlugsSet);

  const notAllowedPosts = feedPosts.filter((post) => !isAllowedPost(post));

  // Count only newly hidden posts (not already marked)
  let newlyHiddenCount = 0;

  notAllowedPosts.forEach((post) => {
    if (hidePostIfNeeded(post)) {
      newlyHiddenCount++;
    }
  });

  // Update the blocked count via background service worker
  if (newlyHiddenCount > 0) {
    sendMessage('INCREMENT_TODAY_BLOCKED_POSTS_COUNT', newlyHiddenCount);
  }
  console.debug('> isFriendFocus:', isFriendFocus);
};
