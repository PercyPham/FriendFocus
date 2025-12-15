import { findFeedPosts, isFriendPost } from './utils';
import { sendMessage } from '@/common/background_contract/client';

const NON_FRIEND = 'non-friend';

export const setOnlyFriendPosts = (
  isFriendFocus: boolean,
  friendSlugsSet: Set<string>
) => {
  const feedPosts = findFeedPosts();
  if (!feedPosts?.length) return;

  if (isFriendFocus) {
    const nonFriendPosts = feedPosts.filter(
      (post) => !isFriendPost(post, friendSlugsSet)
    );

    // Count only newly hidden posts (not already marked)
    let newlyHiddenCount = 0;

    nonFriendPosts.forEach((post) => {
      const isAlreadyHidden = post.getAttribute(NON_FRIEND) === 'true';

      if (!isAlreadyHidden) {
        newlyHiddenCount++;
      }

      post.setAttribute(NON_FRIEND, 'true');
      const firstChild = post.firstChild as HTMLElement;
      if (firstChild) {
        firstChild.setAttribute('style', 'display: none !important;');
      }
    });

    // Update the blocked count via background service worker
    if (newlyHiddenCount > 0) {
      sendMessage('INCREMENT_TODAY_BLOCKED_POSTS_COUNT', newlyHiddenCount);
    }
  } else {
    const hiddenPosts = document.querySelectorAll(`[${NON_FRIEND}]`);
    hiddenPosts.forEach((post) => {
      const firstChild = post.firstChild as HTMLElement;
      if (firstChild) {
        firstChild.removeAttribute('style');
      }
    });
  }
};
