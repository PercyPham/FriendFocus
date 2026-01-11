import storage from '@/common/storage';
import {
  findFeedPosts,
  findStoriesElements,
  isFriendPost,
  isFollowingPost,
  isGroupPost,
  isMemoryPost,
} from './newsfeed_utils';
import { sendMessage } from '@/common/background_contract/client';
import { logger } from '@/common/logger';

const NOT_ALLOWED_STORY = 'friendfocus-not-allowed-story';

const hideStoryIfNeeded = (story: Element): boolean => {
  const isAlreadyHidden = story.getAttribute(NOT_ALLOWED_STORY) === 'true';
  if (isAlreadyHidden) return false;

  story.setAttribute(NOT_ALLOWED_STORY, 'true');
  story.setAttribute('style', 'width: 0px !important;');
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

const hideStories = (
  allowedNameSet: Set<string>,
  followingNameSet: Set<string>,
  isFollowingsEnabled: boolean
): number => {
  const storiesElements = findStoriesElements();
  if (!storiesElements?.length) return 0;

  const isAllowedStory = (story: Element) => {
    if (story.querySelector('a[href="/stories/create/"]')) return true;
    const spans = story.querySelectorAll('span');
    const spanTexts = Array.from(spans).map((span) => span.textContent?.trim());
    return spanTexts.some((text) => {
      if (!text) return false;
      return (
        allowedNameSet.has(text) ||
        (isFollowingsEnabled && followingNameSet.has(text))
      );
    });
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

// Profile data type for consolidated loading
type ProfileData = {
  slugSet: Set<string>;
  nameSet: Set<string>;
};

// Cache for profile data
const profileDataCache: { [key: string]: ProfileData } = {};

// Generic profile data loader
const getProfileData = async (
  storageKey:
    | typeof storage.key.friendList
    | typeof storage.key.followingList
    | typeof storage.key.groupList
): Promise<ProfileData> => {
  if (profileDataCache[storageKey]) {
    return profileDataCache[storageKey];
  }

  const list = await storage.get(storageKey);
  const data: ProfileData = {
    slugSet: new Set(list?.map((p) => p.slug) || []),
    nameSet: new Set(list?.map((p) => p.name) || []),
  };

  profileDataCache[storageKey] = data;
  return data;
};

storage.onChange(storage.key.friendListUpdatedAt, () => {
  delete profileDataCache[storage.key.friendList];
});

storage.onChange(storage.key.followingListUpdatedAt, () => {
  delete profileDataCache[storage.key.followingList];
});

storage.onChange(storage.key.groupListUpdatedAt, () => {
  delete profileDataCache[storage.key.groupList];
});

const hideNewsfeedPosts = (
  feedPosts: Element[],
  friendSlugSet: Set<string>,
  isFollowingsEnabled: boolean,
  followingSlugSet: Set<string>,
  isGroupsEnabled: boolean,
  groupSlugSet: Set<string>,
  groupNameSet: Set<string>
): number => {
  const isAllowedPost = (post: Element) =>
    isMemoryPost(post) ||
    isFriendPost(post, friendSlugSet) ||
    (isFollowingsEnabled && isFollowingPost(post, followingSlugSet)) ||
    (isGroupsEnabled && isGroupPost(post, groupSlugSet, groupNameSet));

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

  const isFollowingsEnabled = !!(await storage.get(
    storage.key.isFollowingsEnabled
  ));
  const isGroupsEnabled = !!(await storage.get(storage.key.isGroupsEnabled));

  const resolveEmpties = () =>
    Promise.resolve({ slugSet: new Set<string>(), nameSet: new Set<string>() });

  // Load profile data once per type (single storage call)
  const [friendProfileData, followingProfileData, groupProfileData] =
    await Promise.all([
      getProfileData(storage.key.friendList),
      isFollowingsEnabled
        ? getProfileData(storage.key.followingList)
        : resolveEmpties(),
      isGroupsEnabled
        ? getProfileData(storage.key.groupList)
        : resolveEmpties(),
    ]);

  let newlyHiddenCount = 0;

  newlyHiddenCount += hideStories(
    friendProfileData.nameSet,
    followingProfileData.nameSet,
    isFollowingsEnabled
  );

  const feedPosts = findFeedPosts();
  newlyHiddenCount += hideNewsfeedPosts(
    feedPosts || [],
    friendProfileData.slugSet,
    isFollowingsEnabled,
    followingProfileData.slugSet,
    isGroupsEnabled,
    groupProfileData.slugSet,
    groupProfileData.nameSet
  );

  // Update the blocked count via background service worker
  if (newlyHiddenCount > 0) {
    sendMessage('INCREMENT_TODAY_BLOCKED_POSTS_COUNT', newlyHiddenCount);
  }
  logger.debug('newlyHiddenCount:', newlyHiddenCount);
};
