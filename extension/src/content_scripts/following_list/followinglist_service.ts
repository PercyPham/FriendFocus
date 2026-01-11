import type { FollowingInfo } from '@/common/types';
import { showFollowingProgressPopup } from './components/OverlayManager';
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

// Get following profile elements from the page
const getFollowingElements = (): Element[] => {
  const allAElements = document.querySelectorAll(
    'a[href^="https://www.facebook.com"]'
  );

  const followingElements = Array.from(allAElements)
    .filter((a) => {
      // Filter out <a/> with href matches `https://www.facebook.com/:profile_slug`
      const href = a.getAttribute('href');
      if (!href) return false;
      const url = new URL(href);
      const pathname = url.pathname;
      // Must be a profile link (only one path segment)
      return pathname.split('/').filter(Boolean).length === 1;
    })
    .filter((a) => {
      // Filter for <a/> with a span child containing text (the profile name)
      const span = a.querySelector('span');
      return (
        span && span.childElementCount === 0 && span.textContent?.trim() !== ''
      );
    });

  return followingElements;
};

// Extract following info from profile anchor element
export const extractFollowingInfo = (
  anchorElement: Element
): FollowingInfo | null => {
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
    logger.error('Error extracting following info:', error);
    return null;
  }
};

// Get current count of following elements
const getFollowingElementCount = (): number => {
  const slugs = getFollowingElements()
    .map(extractFollowingInfo)
    .map((info) => info?.slug)
    .filter(Boolean);

  return new Set(slugs).size;
};

// Scroll to load more followings and wait for new content
const scrollToLoadMore = async (): Promise<boolean> => {
  const initialCount = getFollowingElementCount();
  const previousHeight = document.body.scrollHeight;

  // Scroll to bottom
  window.scrollTo(0, document.body.scrollHeight);

  // Wait for new followings to load (check every 200ms, timeout after 10 seconds)
  const didLoadNewFollowings = await waitFor(
    () => getFollowingElementCount() > initialCount,
    10000,
    200
  );

  // If new followings loaded, wait a bit more for any remaining content
  if (didLoadNewFollowings) {
    await sleep(500);
  }

  // Check if page height increased or new followings appeared
  const newHeight = document.body.scrollHeight;
  const newCount = getFollowingElementCount();

  return newHeight > previousHeight || newCount > initialCount;
};

// Auto-crawl mode: collect all followings by scrolling
export const getFollowingListAutoCrawl = async (): Promise<FollowingInfo[]> => {
  // Step 1: Navigate to following page if needed
  const currentUrl = window.location.href;

  if (!currentUrl.includes('/following')) {
    window.location.href = 'https://www.facebook.com/me/following';

    // Wait for redirect to actual following page
    await waitFor(
      () => {
        const url = window.location.href;
        return url.includes('/following') && !url.includes('/me/following');
      },
      15000,
      500
    );

    // Wait for content to load
    await sleep(2000);
  }

  // Step 2: Show progress popup and start collecting
  const progressPopup = showFollowingProgressPopup();

  let hasMoreFollowings = true;
  let previousCount = 0;
  let noChangeCount = 0;

  while (hasMoreFollowings) {
    // Get current count of following elements
    const currentCount = getFollowingElementCount();

    // Update progress
    progressPopup.updateCount(currentCount);

    // Check if we found new followings
    if (currentCount === previousCount) {
      noChangeCount++;
      // If no new followings found after 3 attempts, we're done
      if (noChangeCount >= 3) {
        hasMoreFollowings = false;
      }
    } else {
      noChangeCount = 0;
      previousCount = currentCount;
    }

    // Scroll to load more followings
    if (hasMoreFollowings) {
      const didScroll = await scrollToLoadMore();
      if (!didScroll) {
        // Reached the end of the page
        hasMoreFollowings = false;
      }
    }
  }

  // Close progress popup
  progressPopup.close();

  // Collect all followings once at the end
  const followingElements = getFollowingElements();
  const allFollowings: FollowingInfo[] = [];
  const seenSlugs = new Set<string>();

  followingElements.forEach((e) => {
    const followingInfo = extractFollowingInfo(e);
    if (followingInfo && !seenSlugs.has(followingInfo.slug)) {
      seenSlugs.add(followingInfo.slug);
      allFollowings.push(followingInfo);
    }
  });

  return allFollowings;
};

// Manual mode: returns empty array (collection is handled by the manual UI)
export const getFollowingListManual = async (): Promise<FollowingInfo[]> => {
  return [];
};
