import storage from '@/common/storage';
import { updateFriendFocus } from './newsfeed_service';
import { findFeedsParent, findStoriesParent } from './newsfeed_utils';
import { FB_CHANGED_EVENT } from '@/common/constants';

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
let newsfeedParent: Element | undefined = undefined;
let newsfeedObserver: MutationObserver | undefined = undefined;
let storiesParent: Element | undefined = undefined;
let storiesObserver: MutationObserver | undefined = undefined;

async function startTask() {
  if (!isFbNewsfeedPage()) return;

  const startNewsfeedObserver = async () => {
    if (!newsfeedObserver) {
      console.log('> starting newsfeedObserver');
      [newsfeedParent, newsfeedObserver] = await findAndObserve(
        'Newsfeed',
        findFeedsParent
      );
      return;
    }

    const isNewsfeedObserverValid =
      newsfeedParent && document.body.contains(newsfeedParent);

    if (isNewsfeedObserverValid) return;

    console.log('> newsfeedObserver is invalid, reseting newsfeedObserver');

    newsfeedObserver?.disconnect();
    newsfeedParent = undefined;
    newsfeedObserver = undefined;

    [newsfeedParent, newsfeedObserver] = await findAndObserve(
      'Newsfeed',
      findFeedsParent
    );
  };

  const startStoriesObserver = async () => {
    if (!storiesObserver) {
      console.log('> starting storiesObserver');
      [storiesParent, storiesObserver] = await findAndObserve(
        'Stories',
        findStoriesParent
      );
      return;
    }

    const isStoriesObserverValid =
      storiesParent && document.body.contains(storiesParent);

    if (isStoriesObserverValid) return;

    console.log('> storiesObserver is invalid, reseting storiesObserver');

    storiesObserver?.disconnect();
    storiesParent = undefined;
    storiesObserver = undefined;

    [storiesParent, storiesObserver] = await findAndObserve(
      'Stories',
      findStoriesParent
    );
  };

  await Promise.all([startNewsfeedObserver(), startStoriesObserver()]);
}

async function findAndObserve(
  targetName: string,
  elementFinder: () => Element | undefined
): Promise<[Element, MutationObserver] | [undefined, undefined]> {
  const element = await waitTillExists(targetName, elementFinder);
  if (!element) return [undefined, undefined];
  const observer = observeChildChanges(targetName, element, updateFriendFocus);
  updateFriendFocus();
  return [element, observer];
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

function stopTasks() {
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

async function orchestrateTasks() {
  try {
    const isNewsfeedPage = isFbNewsfeedPage();
    const isFriendFocus = await storage.get(storage.key.isFriendFocus);
    console.debug(
      `[FriendFocus] orchestrate: newsfeedPage=${isNewsfeedPage}, friendFocus=${isFriendFocus}, visible=${!document.hidden}, newsfeedObserver=${!!newsfeedObserver}, storiesObserver=${!!storiesObserver}`
    );
    if (document.hidden) {
      stopTasks();
    } else if (isNewsfeedPage && isFriendFocus) {
      await startTask();
    } else {
      stopTasks();
    }
  } catch (error) {
    console.error('[FriendFocus] Error orchestrating tasks:', error);
  }
}

storage.onChange(storage.key.isFriendFocus, (isFriendFocus) => {
  console.debug('[FriendFocus] isFriendFocus changed:', isFriendFocus);
  orchestrateTasks();
});

document.addEventListener('visibilitychange', orchestrateTasks);

if (document.readyState === 'complete') {
  orchestrateTasks();
} else {
  window.addEventListener('load', orchestrateTasks);
}

// Listen for URL changes
// This is used to listen for URL changes by user action on browser and notify the content script
(function () {
  const notifyUrlChange = () => {
    console.debug('[FriendFocus] URL changed');
    orchestrateTasks();
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

// Listen for FB changed event
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.type === FB_CHANGED_EVENT) {
    console.debug(
      `[FriendFocus] FB_CHANGED_EVENT received: trigger=${event.data.trigger}`
    );
    orchestrateTasks();
  }
});

// periodic check every 3 seconds
setInterval(async () => {
  console.debug(`[FriendFocus] periodic check`);
  orchestrateTasks();
}, 3000);
