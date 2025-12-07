import { findFeedPosts, isPeoplePost } from './utils';

export const setNonFriendPosts = (isShown: boolean) => {
  const feedPosts = findFeedPosts();
  if (!feedPosts?.length) return;

  const nonFriendPosts = feedPosts.filter((post) => !isPeoplePost(post));

  if (isShown) {
    nonFriendPosts.forEach((post) => {
      (post.firstChild as HTMLElement)?.setAttribute(
        'style',
        'display: none !important;'
      );
    });
  } else {
    nonFriendPosts.forEach((post) => {
      (post.firstChild as HTMLElement)?.removeAttribute('style');
    });
  }
};
