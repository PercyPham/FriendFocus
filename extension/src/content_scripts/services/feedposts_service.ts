import { findFeedPosts, isFriendPost } from './utils';

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

    nonFriendPosts.forEach((post) => {
      post.setAttribute(NON_FRIEND, 'true');
      const firstChild = post.firstChild as HTMLElement;
      if (firstChild) {
        firstChild.setAttribute('style', 'display: none !important;');
      }
    });
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
