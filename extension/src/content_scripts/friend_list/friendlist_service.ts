import type { FriendInfo } from '@/common/types';
import {
  showUpdatePopup,
  showProgressPopup,
} from './components/OverlayManager';
import { logger } from '@/common/logger';

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

    // For profile.php URLs, include only the 'id' query parameter
    let slug = pathParts[0];
    if (slug === 'profile.php') {
      const id = url.searchParams.get('id');
      if (id) {
        slug = `profile.php?id=${id}`;
      }
    }

    // Extract name from the span's textContent
    const span = anchorElement.querySelector('span');
    const name = span?.textContent?.trim() || '';

    if (!name || !slug) return null;

    return { slug, name };
  } catch (error) {
    logger.error('Error extracting friend info:', error);
    return null;
  }
};

// Get current count of friend elements
const getFriendElementCount = (): number => {
  const slugs = getFriendElements()
    .map(extractFriendInfo)
    .map((info) => info?.slug)
    .filter(Boolean);

  return new Set(slugs).size;
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

export const getFriendList = async (): Promise<FriendInfo[] | null> => {
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
  const didStart = await showUpdatePopup();
  if (!didStart) return null;

  // Step 3-5: Start collecting friends with progress indicator
  const progressPopup = showProgressPopup();

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
  const seenSlugs = new Set<string>();

  friendElements.forEach((e) => {
    const friendInfo = extractFriendInfo(e);
    if (friendInfo && !seenSlugs.has(friendInfo.slug)) {
      seenSlugs.add(friendInfo.slug);
      allFriends.push(friendInfo);
    }
  });

  return allFriends;
};
