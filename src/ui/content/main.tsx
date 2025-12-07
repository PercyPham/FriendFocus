import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { hideStories, showStories } from '../../services/stories_service';
import { hideReels, showReels } from '../../services/reels_service';
import { setNonFriendPosts } from '@/services/feedposts_service';

console.log('[CRXJS] Hello world from content script!');

// Message Listener
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.action === 'HIDE_STORIES') {
    hideStories();
    sendResponse({ status: 'hidden' });
  } else if (request.action === 'SHOW_STORIES') {
    showStories();
    sendResponse({ status: 'shown' });
  } else if (request.action === 'HIDE_REELS') {
    hideReels();
    sendResponse({ status: 'reels_hidden' });
  } else if (request.action === 'SHOW_REELS') {
    showReels();
    sendResponse({ status: 'reels_shown' });
  } else if (request.action === 'HIDE_NON_FRIEND_POSTS') {
    setNonFriendPosts(true);
    sendResponse({ status: 'non_friend_posts_hidden' });
  } else if (request.action === 'SHOW_NON_FRIEND_POSTS') {
    setNonFriendPosts(false);
    sendResponse({ status: 'non_friend_posts_shown' });
  }
  return true;
});

const container = document.createElement('div');
container.id = 'crxjs-app';
document.body.appendChild(container);
createRoot(container).render(
  <StrictMode>
    <div />
  </StrictMode>
);
