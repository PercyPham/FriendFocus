import { findFeedPosts } from './utils';

const findReelsDiv = () => {
  const feedPosts = findFeedPosts();
  if (!feedPosts) return undefined;

  const reelsDiv = feedPosts.find((post) => {
    return post.querySelector('div[aria-label="Reels"]')!!;
  });
  if (!reelsDiv) return undefined;
  console.log('>>> reelsDiv', reelsDiv);

  return reelsDiv;
};

export const hideReels = () => {
  const reelsDiv = findReelsDiv();
  if (!reelsDiv) return;

  reelsDiv.setAttribute('style', 'display: none !important;');
};

export const showReels = () => {
  const reelsDiv = findReelsDiv();
  if (!reelsDiv) return;

  reelsDiv.setAttribute('style', 'display: block !important;');
};
