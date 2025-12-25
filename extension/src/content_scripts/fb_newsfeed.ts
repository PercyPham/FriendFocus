import storage from '@/common/storage';
import { updateFriendFocus } from './services/newsfeed_service';
import { findFeedPostsDirectParent } from './services/newsfeed_utils';

console.debug('> Loaded: fb_newsfeed.ts');

const isFbNewsfeedPage = (() => {
  const url = new URL(window.location.href);
  return url.hostname === 'www.facebook.com' && url.pathname === '/';
})();

console.debug('> isFbNewsfeedPage:', isFbNewsfeedPage);

/**
 * Detects changes in the number of direct children of a target element.
 * @param {HTMLElement} targetElement - The element to observe.
 */
function observeChildChanges(targetElement: Element, callback: () => void) {
  if (!targetElement) {
    console.error('Target element not found.');
    return;
  }

  let previousChildCount = targetElement.children.length;

  // 2. Create an instance of the observer with the callback
  const observer = new MutationObserver((mutationsList, _observer) => {
    // We only care about mutations that affect the child list
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const currentChildCount = targetElement.children.length;

        if (currentChildCount !== previousChildCount) {
          console.debug(
            `✅ Child count changed! ${previousChildCount} -> ${currentChildCount}`
          );

          // You can put your specific action here (e.g., re-run a function)
          callback();

          // Update the count for the next change
          previousChildCount = currentChildCount;
        }
      }
    }
  });

  // 3. Define the configuration for the observer
  const config = {
    childList: true, // required to detect addition/removal of nodes
    subtree: false, // set to true if you want to detect changes in children of children
  };

  // 4. Start observing the target element
  observer.observe(targetElement, config);
  console.debug('MutationObserver started on the target element.');

  // Optional: Return the observer instance so it can be stopped later
  return observer;
}

// Observer lifecycle management
let observer: MutationObserver | undefined = undefined;

function startTask() {
  if (!isFbNewsfeedPage) return;
  if (observer) return; // Already running

  const div = findFeedPostsDirectParent();
  if (div) {
    console.debug('> found parent div and started observing');
    observer = observeChildChanges(div, updateFriendFocus);
    updateFriendFocus();
  }
}

function stopTask() {
  if (observer) {
    observer.disconnect();
    observer = undefined;
    console.debug('> Observer stopped');
  }
}

// Listen to storage changes for isFriendFocus
storage.onChange(storage.key.isFriendFocus, (isFriendFocus) => {
  console.debug('> isFriendFocus changed:', isFriendFocus);
  if (isFriendFocus && !observer) {
    startTask();
  } else if (!isFriendFocus && observer) {
    stopTask();
  }
});

// Initialize based on current state
const initializeTask = async () => {
  if (!isFbNewsfeedPage) return;

  const isFriendFocus = await storage.get(storage.key.isFriendFocus);
  console.debug('> Initial isFriendFocus state:', isFriendFocus);

  if (isFriendFocus) {
    startTask();
  }
};

// Listen for visibility changes
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    // Tab is hidden - stop observer to save resources
    stopTask();
  } else {
    // Tab is visible again - restart if feature is enabled
    const isFriendFocus = await storage.get(storage.key.isFriendFocus);
    if (isFriendFocus) {
      startTask();
    }
  }
});

// Single initialization point
if (document.readyState === 'complete') {
  initializeTask();
} else {
  window.addEventListener('load', initializeTask);
}

// Cleanup on unload
window.addEventListener('unload', () => {
  stopTask();
});
