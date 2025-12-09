import {
  hideStories,
  showStories,
} from '@/content_scripts/services/stories_service';
import { hideReels, showReels } from '@/content_scripts/services/reels_service';
import { setShowNonFriendPosts } from '@/content_scripts/services/feedposts_service';

console.log('> Loaded: fb_newsfeed.ts');

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
    setShowNonFriendPosts(false);
    sendResponse({ status: 'non_friend_posts_hidden' });
  } else if (request.action === 'SHOW_NON_FRIEND_POSTS') {
    setShowNonFriendPosts(true);
    sendResponse({ status: 'non_friend_posts_shown' });
  }
  return true;
});
