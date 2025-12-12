import {
  findFeedPosts,
  findFeedPostsDirectParent,
  isFriendPost,
} from './utils';

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

    console.log('> feedPosts:', feedPosts.length);
    console.log('> nonFriendPosts:', nonFriendPosts.length);

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

/**
 * Detects changes in the number of direct children of a target element.
 * @param {HTMLElement} targetElement - The element to observe.
 */
function observeChildChanges(targetElement: Element) {
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
          console.log(`✅ Child count changed!`);
          console.log(`  - Old count: ${previousChildCount}`);
          console.log(`  - New count: ${currentChildCount}`);

          // You can put your specific action here (e.g., re-run a function)
          // ...

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
  console.log('MutationObserver started on the target element.');

  // Optional: Return the observer instance so it can be stopped later
  return observer;
}

// Wait for the page to be fully loaded before running
if (document.readyState === 'complete') {
  // Page is already loaded
  const div = findFeedPostsDirectParent();
  if (div) {
    console.log('> found parent div and started observing');
    observeChildChanges(div);
  }
} else {
  // Wait for the page to finish loading
  window.addEventListener('load', () => {
    const div = findFeedPostsDirectParent();
    if (div) {
      console.log('> found parent div and started observing');
      observeChildChanges(div);
    }
  });
}
