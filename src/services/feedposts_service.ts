import { findFeedPosts, isFriendPost } from './utils';

const HIDDEN_ATTRIBUTE = 'friend-focus';

const setNonFriendPosts = (isShown: boolean) => {
  const feedPosts = findFeedPosts();
  if (!feedPosts?.length) return;

  if (isShown) {
    const hiddenPosts = document.querySelectorAll(`[${HIDDEN_ATTRIBUTE}]`);
    hiddenPosts.forEach((post) => {
      post.removeAttribute('style');
      post.removeAttribute(HIDDEN_ATTRIBUTE);
    });
  } else {
    const nonFriendPosts = feedPosts.filter((post) => !isFriendPost(post));
    // const nonFriendPosts = feedPosts.filter((post) => !isPeoplePost(post));

    nonFriendPosts.forEach((post) => {
      const firstChild = post.firstChild as HTMLElement;
      if (!firstChild) return;
      firstChild.setAttribute('style', 'display: none !important;');
      firstChild.setAttribute(HIDDEN_ATTRIBUTE, 'hidden');
    });
  }
};

let showNonFriendPosts = true;

export const setShowNonFriendPosts = (isShown: boolean) => {
  showNonFriendPosts = isShown;
  setNonFriendPosts(showNonFriendPosts);
};

setInterval(() => {
  console.log('>>>> showNonFriendPosts', showNonFriendPosts);
  setNonFriendPosts(showNonFriendPosts);
}, 1000);
