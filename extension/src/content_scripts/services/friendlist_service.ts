interface FriendInfo {
  slug: string;
  name: string;
}

// Helper function to wait for a condition
const waitFor = (
  condition: () => boolean,
  timeout = 10000,
  interval = 100
): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      if (condition()) {
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        resolve(false);
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
};

// Helper function to wait for a specific time
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Create and show popup UI
const createUpdatePopup = (): Promise<void> => {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // Create popup container
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 400px;
    `;

    // Create title
    const title = document.createElement('h2');
    title.textContent = 'Update Friend List';
    title.style.cssText = `
      margin: 0 0 15px 0;
      font-size: 24px;
      color: #1877f2;
    `;

    // Keep tab reminder
    const keepTabReminder = document.createElement('p');
    keepTabReminder.textContent =
      'Keep this tab open until the process is complete.';
    keepTabReminder.style.cssText = `
      margin: 0 0 20px 0;
      color: #65676b;
      font-size: 14px;
    `;

    // Create description
    const description = document.createElement('p');
    description.textContent =
      'Click the button below to start collecting your friends list.';
    description.style.cssText = `
      margin: 0 0 20px 0;
      color: #65676b;
      font-size: 14px;
    `;

    // Create button
    const button = document.createElement('button');
    button.textContent = 'Update Friend List';
    button.style.cssText = `
      background-color: #1877f2;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
    `;

    button.onmouseover = () => {
      button.style.backgroundColor = '#166fe5';
    };
    button.onmouseout = () => {
      button.style.backgroundColor = '#1877f2';
    };

    button.onclick = () => {
      document.body.removeChild(overlay);
      resolve();
    };

    // Assemble popup
    popup.appendChild(title);
    popup.appendChild(keepTabReminder);
    popup.appendChild(description);
    popup.appendChild(button);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  });
};

// Create and show progress popup
const createProgressPopup = () => {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 99999;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const popup = document.createElement('div');
  popup.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    text-align: center;
    min-width: 300px;
  `;

  const title = document.createElement('h2');
  title.textContent = 'Collecting Friends...';
  title.style.cssText = `
    margin: 0 0 15px 0;
    font-size: 20px;
    color: #1877f2;
  `;

  const keepTabReminder = document.createElement('p');
  keepTabReminder.style.cssText = `
    margin: 0;
    color: #65676b;
    font-size: 16px;
  `;
  keepTabReminder.textContent =
    'Keep this tab open until the process is complete.';

  const status = document.createElement('p');
  status.style.cssText = `
    margin: 0;
    color: #65676b;
    font-size: 16px;
  `;
  status.textContent = 'Found: 0 friends';

  popup.appendChild(title);
  popup.appendChild(keepTabReminder);
  popup.appendChild(status);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  return {
    updateCount: (count: number) => {
      status.textContent = `Found: ${count} friends`;
    },
    close: () => {
      document.body.removeChild(overlay);
    },
  };
};

const getFriendElements = (): Element[] => {
  const allAElements = document.querySelectorAll(
    'a[href^="https://www.facebook.com"]'
  );

  const friendElements = Array.from(allAElements)
    .filter((a) => {
      // filter out <a/> with href matches `https://www.facebook.com/:friend_slug`
      const href = a.getAttribute('href');
      const url = new URL(href!);
      const pathname = url.pathname;
      return pathname.split('/').length === 2;
    })
    .filter((a) => {
      // filter out <a/> with only one directly span child
      const span = a.querySelector('span');
      return (
        span && span.childElementCount === 0 && span.textContent?.trim() !== ''
      );
    });

  return friendElements;
};

// Extract friend info from friend anchor element
const extractFriendInfo = (anchorElement: Element): FriendInfo | null => {
  try {
    const href = anchorElement.getAttribute('href');
    if (!href) return null;

    // Extract slug from URL
    const url = new URL(href, 'https://www.facebook.com');
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length === 0) return null;

    const slug = pathParts[0];

    // Extract name from the span's textContent
    const span = anchorElement.querySelector('span');
    const name = span?.textContent?.trim() || '';

    if (!name || !slug) return null;

    return { slug, name };
  } catch (error) {
    console.error('Error extracting friend info:', error);
    return null;
  }
};

// Get current count of friend elements
const getFriendElementCount = (): number => {
  return getFriendElements().length;
};

// Scroll to load more friends and wait for new content
const scrollToLoadMore = async (): Promise<boolean> => {
  const initialCount = getFriendElementCount();
  const previousHeight = document.body.scrollHeight;

  // Scroll to bottom
  window.scrollTo(0, document.body.scrollHeight);

  // Wait for new friends to load (check every 200ms, timeout after 5 seconds)
  const didLoadNewFriends = await waitFor(
    () => getFriendElementCount() > initialCount,
    10000,
    200
  );

  // If new friends loaded, wait a bit more for any remaining content
  if (didLoadNewFriends) {
    await sleep(500);
  }

  // Check if page height increased or new friends appeared
  const newHeight = document.body.scrollHeight;
  const newCount = getFriendElementCount();

  return newHeight > previousHeight || newCount > initialCount;
};

export const getFriendList = async (): Promise<FriendInfo[]> => {
  // Step 1: Navigate to friends page
  const currentUrl = window.location.href;

  // Check if we're not on a friends page
  if (!currentUrl.includes('/friends')) {
    window.location.href = 'https://www.facebook.com/me/friends';

    // Wait for redirect to actual friends page (from /me/friends to /username/friends)
    await waitFor(
      () => {
        const url = window.location.href;
        return url.includes('/friends') && !url.includes('/me/friends');
      },
      15000,
      500
    );

    // Wait for friend elements to appear on the page
    await waitFor(() => getFriendElementCount() > 0, 10000, 500);

    // Additional wait for initial content to stabilize
    await sleep(1000);
  }

  // Step 2: Show popup and wait for user to click
  await createUpdatePopup();

  // Step 3-5: Start collecting friends with progress indicator
  const progressPopup = createProgressPopup();

  let hasMoreFriends = true;
  let previousCount = 0;
  let noChangeCount = 0;

  while (hasMoreFriends) {
    // Get current count of friend elements
    const currentCount = getFriendElementCount();

    // Update progress
    progressPopup.updateCount(currentCount);

    // Check if we found new friends
    if (currentCount === previousCount) {
      noChangeCount++;
      // If no new friends found after 3 attempts, we're done
      if (noChangeCount >= 3) {
        hasMoreFriends = false;
      }
    } else {
      noChangeCount = 0;
      previousCount = currentCount;
    }

    // Step 4: Scroll to load more friends
    if (hasMoreFriends) {
      const didScroll = await scrollToLoadMore();
      if (!didScroll) {
        // Reached the end of the page
        hasMoreFriends = false;
      }
    }
  }

  // Close progress popup
  progressPopup.close();

  // Step 6: Collect all friends once at the end
  const friendElements = getFriendElements();
  const allFriends: FriendInfo[] = [];
  // need to exclude profile.php
  const seenSlugs = new Set<string>(['profile.php']);

  friendElements.forEach((e) => {
    const friendInfo = extractFriendInfo(e);
    if (friendInfo && !seenSlugs.has(friendInfo.slug)) {
      seenSlugs.add(friendInfo.slug);
      allFriends.push(friendInfo);
    }
  });

  return allFriends;
};
