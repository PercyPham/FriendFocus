import storage from '@/common/storage';
import { updateFriendFocus } from './newsfeed_service';
import {
  findFeedPostsDirectParent,
  findStoriesParentDiv,
} from './newsfeed_utils';
import { FB_URL_CHANGED_EVENT } from '@/common/constants';

console.debug('> Loaded: newsfeed/index.ts');

const isFbNewsfeedPage = () => {
  const url = new URL(window.location.href);
  return url.hostname === 'www.facebook.com' && url.pathname === '/';
};

console.debug('> isFbNewsfeedPage:', isFbNewsfeedPage());

/**
 * Detects changes in the number of direct children of a target element.
 * @param {HTMLElement} targetElement - The element to observe.
 */
function observeChildChanges(
  targetName: string,
  targetElement: Element,
  callback: () => void
) {
  if (!targetElement) {
    console.error(`[${targetName}] target element not found.`);
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
            `[${targetName}] Child count changed! ${previousChildCount} -> ${currentChildCount}`
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
  console.debug(
    `[FriendFocus] [${targetName}] MutationObserver started on the target element.`
  );

  // Optional: Return the observer instance so it can be stopped later
  return observer;
}

// Observer lifecycle management
let newsfeedObserver: MutationObserver | undefined = undefined;
let storiesObserver: MutationObserver | undefined = undefined;

async function startTask() {
  if (!isFbNewsfeedPage()) return;

  [newsfeedObserver, storiesObserver] = await Promise.all([
    newsfeedObserver || findAndObserve('Newsfeed', findFeedPostsDirectParent),
    storiesObserver || findAndObserve('Stories', findStoriesParentDiv),
  ]);
}

async function findAndObserve(
  targetName: string,
  elementFinder: () => Element | undefined
) {
  const element = await waitTillExists(targetName, elementFinder);
  if (!element) return undefined;
  const observer = observeChildChanges(targetName, element, updateFriendFocus);
  updateFriendFocus();
  return observer;
}

async function waitTillExists(
  targetName: string,
  elementFinder: () => Element | undefined,
  timeout = 5000,
  interval = 100
) {
  const startTime = Date.now();
  let element = elementFinder();
  while (!element) {
    if (Date.now() - startTime > timeout) {
      console.debug(`[FriendFocus] Timeout waiting for ${targetName} element`);
      return undefined;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
    element = elementFinder();
  }
  return element;
}

function stopTask() {
  if (newsfeedObserver) {
    newsfeedObserver.disconnect();
    newsfeedObserver = undefined;
    console.debug('> Newsfeed observer stopped');
  }

  if (storiesObserver) {
    storiesObserver.disconnect();
    storiesObserver = undefined;
    console.debug('> Stories observer stopped');
  }
}

// Listen to storage changes for isFriendFocus
storage.onChange(storage.key.isFriendFocus, (isFriendFocus) => {
  console.debug('> isFriendFocus changed:', isFriendFocus);
  if (isFriendFocus) {
    startTask();
  } else {
    stopTask();
  }
});

// Initialize based on current state
const initializeTask = async () => {
  if (!isFbNewsfeedPage()) return;

  try {
    const isFriendFocus = await storage.get(storage.key.isFriendFocus);
    console.debug('> Initial isFriendFocus state:', isFriendFocus);

    if (isFriendFocus) {
      await startTask();
    }
  } catch (error) {
    console.error('> Error initializing task:', error);
  }
};

// Listen for visibility changes
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    // Tab is hidden - stop observer to save resources
    stopTask();
  } else {
    initializeTask();
  }
});

// Single initialization point
if (document.readyState === 'complete') {
  initializeTask();
} else {
  window.addEventListener('load', initializeTask);
}

// Listen for URL changes
// This is used to listen for URL changes by user action on browser and notify the content script
(function () {
  const notifyUrlChange = () => {
    if (isFbNewsfeedPage()) {
      initializeTask();
    } else {
      stopTask();
    }
  };

  // Hook pushState
  const pushState = history.pushState;
  history.pushState = function (...args) {
    pushState.apply(history, args);
    notifyUrlChange();
  };

  // Hook replaceState
  const replaceState = history.replaceState;
  history.replaceState = function (...args) {
    replaceState.apply(history, args);
    notifyUrlChange();
  };

  // Back / forward buttons
  window.addEventListener('popstate', notifyUrlChange);
})();

// Load page hook script
// This is used to listen for URL changes by Facebook script and notify the content script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/content_scripts/newsfeed/page_hook.js');
script.type = 'text/javascript';
script.onload = () => script.remove();

(document.head || document.documentElement).appendChild(script);

// Listen for URL changes
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.type === FB_URL_CHANGED_EVENT) {
    if (isFbNewsfeedPage()) {
      initializeTask();
    } else {
      stopTask();
    }
  }
});
