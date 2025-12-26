import storage from '@/common/storage';
import {
  findFeedPosts,
  findStoriesElements,
  isFriendPost,
  isGroupPost,
} from './newsfeed_utils';
import { sendMessage } from '@/common/background_contract/client';

const NOT_ALLOWED_STORY = 'friendfocus-not-allowed-story';

const hideStoryIfNeeded = (story: Element): boolean => {
  const isAlreadyHidden = story.getAttribute(NOT_ALLOWED_STORY) === 'true';
  if (isAlreadyHidden) return false;

  story.setAttribute(NOT_ALLOWED_STORY, 'true');
  story.setAttribute('style', 'display: none !important;');
  return true;
};

const unhideStory = (story: Element) => {
  story.removeAttribute('style');
};

const unhideHiddenStories = () => {
  const hiddenStories = document.querySelectorAll(`[${NOT_ALLOWED_STORY}]`);
  hiddenStories.forEach((story) => {
    unhideStory(story);
  });
};

const hideStories = (allowedNameSet: Set<string>): number => {
  const storiesElements = findStoriesElements();
  if (!storiesElements?.length) return 0;

  const isAllowedStory = (story: Element) => {
    if (story.querySelector('a[href="/stories/create/"]')) return true;
    const spans = story.querySelectorAll('span');
    const spanTexts = Array.from(spans).map((span) => span.textContent?.trim());
    return spanTexts.some((text) => !!text && allowedNameSet.has(text));
  };

  const notAllowedStories = Array.from(storiesElements).filter(
    (story) => !isAllowedStory(story)
  );

  let newlyHiddenCount = 0;

  notAllowedStories.forEach((story) => {
    if (hideStoryIfNeeded(story)) newlyHiddenCount++;
  });

  return newlyHiddenCount;
};

const NOT_ALLOWED_POST = 'friendfocus-not-allowed-post';

const hidePostIfNeeded = (post: Element): boolean => {
  const isAlreadyHidden = post.getAttribute(NOT_ALLOWED_POST) === 'true';
  if (isAlreadyHidden) return false;

  post.setAttribute(NOT_ALLOWED_POST, 'true');
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
  const hiddenPosts = document.querySelectorAll(`[${NOT_ALLOWED_POST}]`);
  hiddenPosts.forEach((post) => {
    unhidePost(post);
  });
};

let friendSlugSet: Set<string> | null = null;
let friendNameSet: Set<string> | null = null;

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

const getFriendNameSet = async () => {
  if (friendNameSet) return friendNameSet;

  const friendList = await storage.get(storage.key.friendList);
  if (!friendList) {
    friendNameSet = new Set<string>();
  } else {
    friendNameSet = new Set(friendList.map((friend) => friend.name));
  }
  return friendNameSet;
};

const hideNewsfeedPosts = async (
  feedPosts: Element[],
  friendSlugsSet: Set<string>
): Promise<number> => {
  const isGroupsEnabled = await storage.get(storage.key.isGroupsEnabled);
  const isAllowedPost = (post: Element) =>
    (isGroupsEnabled && isGroupPost(post)) ||
    isFriendPost(post, friendSlugsSet);

  const notAllowedPosts = feedPosts.filter((post) => !isAllowedPost(post));

  let newlyHiddenCount = 0;

  notAllowedPosts.forEach((post) => {
    if (hidePostIfNeeded(post)) newlyHiddenCount++;
  });

  return newlyHiddenCount;
};

export const updateFriendFocus = async () => {
  const isFriendFocus = await storage.get(storage.key.isFriendFocus);
  if (!isFriendFocus) {
    unhideHiddenStories();
    unhideHiddenPosts();
    return;
  }

  const feedPosts = findFeedPosts();
  if (!feedPosts?.length) {
    return;
  }

  const friendSlugsSet = await getFriendSlugSet();
  const friendNameSet = await getFriendNameSet();

  let newlyHiddenCount = 0;

  newlyHiddenCount += await hideStories(friendNameSet);
  newlyHiddenCount += await hideNewsfeedPosts(feedPosts, friendSlugsSet);

  // Update the blocked count via background service worker
  if (newlyHiddenCount > 0) {
    sendMessage('INCREMENT_TODAY_BLOCKED_POSTS_COUNT', newlyHiddenCount);
  }
  console.debug('> isFriendFocus:', isFriendFocus);
};
