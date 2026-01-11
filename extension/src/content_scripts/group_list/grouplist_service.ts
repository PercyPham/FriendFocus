import type { GroupInfo } from '@/common/types';
import { showGroupProgressPopup } from './components/OverlayManager';
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

// Get group elements from the page
const getGroupElements = (): Element[] => {
  const listItems = document.querySelectorAll('div[role="listitem"]');

  const groupElements: Element[] = [];

  listItems.forEach((listItem) => {
    // Find <a> tags within this list item that match the groups pattern AND have text content
    const anchors = listItem.querySelectorAll('a[href*="/groups/"]');
    anchors.forEach((anchor) => {
      const href = anchor.getAttribute('href');
      if (!href || !/\/groups\/[^/?#]+/.test(href)) return;

      if (anchor.children.length > 0) return;

      // Check if this anchor has actual text content (the group name)
      const textContent = anchor.textContent?.trim();
      if (textContent && textContent.length > 0) {
        groupElements.push(anchor);
      }
    });
  });

  return groupElements;
};

// Extract group info from anchor element
export const extractGroupInfo = (anchorElement: Element): GroupInfo | null => {
  try {
    const href = anchorElement.getAttribute('href');
    if (!href) return null;

    // Extract slug from URL - looking for /groups/{id}/
    // Group IDs can be numeric or alphanumeric, so we match any non-slash characters
    const groupMatch = href.match(/\/groups\/([^/?#]+)/);
    if (!groupMatch) return null;

    const groupId = groupMatch[1];
    const slug = `groups/${groupId}`;

    // Extract name from the anchor's text content
    // The group name should be directly in the anchor (not in nested elements)
    const name = anchorElement.textContent?.trim() || '';

    if (!name || !slug) return null;

    return { slug, name };
  } catch (error) {
    logger.error('Error extracting group info:', error);
    return null;
  }
};

// Get current count of group elements
const getGroupElementCount = (): number => {
  const slugs = getGroupElements()
    .map(extractGroupInfo)
    .map((info) => info?.slug)
    .filter(Boolean);

  return new Set(slugs).size;
};

// Scroll to load more groups and wait for new content
const scrollToLoadMore = async (): Promise<boolean> => {
  const initialCount = getGroupElementCount();
  const previousHeight = document.body.scrollHeight;

  // Scroll to bottom
  window.scrollTo(0, document.body.scrollHeight);

  // Wait for new groups to load (check every 200ms, timeout after 10 seconds)
  const didLoadNewGroups = await waitFor(
    () => getGroupElementCount() > initialCount,
    10000,
    200
  );

  // If new groups loaded, wait a bit more for any remaining content
  if (didLoadNewGroups) {
    await sleep(500);
  }

  // Check if page height increased or new groups appeared
  const newHeight = document.body.scrollHeight;
  const newCount = getGroupElementCount();

  return newHeight > previousHeight || newCount > initialCount;
};

// Auto-crawl mode: collect all groups by scrolling
export const getGroupListAutoCrawl = async (): Promise<GroupInfo[]> => {
  // Step 1: Navigate to groups/joins page if needed
  const currentUrl = window.location.href;

  if (!currentUrl.includes('/groups/joins')) {
    window.location.href = 'https://www.facebook.com/groups/joins';

    // Wait for page to load
    await waitFor(
      () => {
        const url = window.location.href;
        return url.includes('/groups/joins');
      },
      15000,
      500
    );

    // Wait for content to load
    await sleep(2000);
  }

  // Step 2: Show progress popup and start collecting
  const progressPopup = showGroupProgressPopup();

  let hasMoreGroups = true;
  let previousCount = 0;
  let noChangeCount = 0;

  while (hasMoreGroups) {
    // Get current count of group elements
    const currentCount = getGroupElementCount();

    // Update progress
    progressPopup.updateCount(currentCount);

    // Check if we found new groups
    if (currentCount === previousCount) {
      noChangeCount++;
      // If no new groups found after 3 attempts, we're done
      if (noChangeCount >= 3) {
        hasMoreGroups = false;
      }
    } else {
      noChangeCount = 0;
      previousCount = currentCount;
    }

    // Scroll to load more groups
    if (hasMoreGroups) {
      const didScroll = await scrollToLoadMore();
      if (!didScroll) {
        // Reached the end of the page
        hasMoreGroups = false;
      }
    }
  }

  // Close progress popup
  progressPopup.close();

  // Collect all groups once at the end
  const groupElements = getGroupElements();
  const allGroups: GroupInfo[] = [];
  const seenSlugs = new Set<string>();

  logger.debug('groupElements:', groupElements);

  groupElements.forEach((e) => {
    const groupInfo = extractGroupInfo(e);
    if (groupInfo && !seenSlugs.has(groupInfo.slug)) {
      seenSlugs.add(groupInfo.slug);
      allGroups.push(groupInfo);
    }
  });

  return allGroups;
};

// Manual mode: returns empty array (collection is handled by the manual UI)
export const getGroupListManual = async (): Promise<GroupInfo[]> => {
  return [];
};
