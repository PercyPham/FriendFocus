export const findStoriesElements = () => {
  const mainDiv = document.querySelector('div[role="main"]');
  if (!mainDiv) return undefined;

  const regionDivs = mainDiv.querySelectorAll('div[role="region"]');
  const storiesAncestor = Array.from(regionDivs).find((region) =>
    region.querySelector('div[role="row"]')
  );
  if (!storiesAncestor) return undefined;

  const storiesElements = storiesAncestor.querySelectorAll(
    'div[data-type="hscroll-child"]'
  );
  if (!storiesElements.length) return undefined;

  return storiesElements;
};

export const findStoriesParentDiv = () => {
  const storiesElements = findStoriesElements();
  if (!storiesElements?.length) return undefined;

  const storiesParentDiv = storiesElements[0].parentElement;
  if (!storiesParentDiv) return undefined;

  return storiesParentDiv;
};

export const findFeedPostsDirectParent = () => {
  const mainDiv = document.querySelector('div[role="main"]');
  if (!mainDiv) return undefined;

  const h3s = mainDiv.querySelectorAll('h3');
  const feedPostsHeader = Array.from(h3s).find((h3) =>
    h3.textContent?.toLowerCase().includes('feed')
  );
  if (!feedPostsHeader) return undefined;

  const feedPostsWrapper = feedPostsHeader.parentElement;
  if (!feedPostsWrapper) return undefined;

  const feedPostsChildren = feedPostsWrapper.children;

  const feedPostsDiv = Array.from(feedPostsChildren).find((div) => {
    if (div.children.length < 2) return false;

    const hasAllDivsInside = Array.from(div.children).every(
      (nestedChild) => nestedChild.tagName === 'DIV'
    );
    return hasAllDivsInside;
  });
  if (!feedPostsDiv) return undefined;

  return feedPostsDiv;
};

export const findFeedPosts = () => {
  const feedPostsDirectParent = findFeedPostsDirectParent();
  if (!feedPostsDirectParent) return undefined;

  const feedPosts = Array.from(feedPostsDirectParent.children);
  return feedPosts;
};

const findAllHeaderAElements = (
  post: Element
): [boolean, HTMLAnchorElement[]] => {
  const profileNameDiv = post.querySelector(
    'div[data-ad-rendering-role="profile_name"]'
  );
  if (!profileNameDiv) return [false, []];

  const likeButton = post.querySelector(
    'div[data-ad-rendering-role="like_button"]'
  );

  if (!likeButton) return [false, []];

  let commonParent: Element | null = null;
  let headerDiv: Element | null = null;
  let actionDiv: Element | null = null;

  let headerEle = profileNameDiv;
  const headerEleSet = new Set<Element>();
  const headerChildMap: Map<Element, Element> = new Map();
  while (headerEle.parentElement !== post) {
    headerChildMap.set(headerEle.parentElement!, headerEle);
    headerEleSet.add(headerEle.parentElement!);
    headerEle = headerEle.parentElement!;
  }

  let actionEle = likeButton;
  const actionPath: Element[] = [];
  while (actionEle !== post) {
    actionPath.push(actionEle);
    if (headerEleSet.has(actionEle.parentElement!)) {
      commonParent = actionEle.parentElement!;
      headerDiv = headerChildMap.get(commonParent)!;
      actionDiv = actionEle;
      break;
    }
    actionEle = actionEle.parentElement!;
  }

  if (!commonParent || !headerDiv || !actionDiv) return [false, []];

  const aElements = headerDiv.querySelectorAll('a');
  return [true, Array.from(aElements)];
};

export const isFriendPost = (post: Element, friendSlugsSet: Set<string>) => {
  const [isSuccess, aElements] = findAllHeaderAElements(post);
  if (!isSuccess) return false;

  const foundFriendSlugElement = aElements.find((a) => {
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('https://www.facebook.com')) return false;
    const url = new URL(href);
    const pathname = url.pathname;
    if (pathname.split('/').length !== 2) return false;

    // Extract slug - for profile.php URLs, include only the 'id' query parameter
    let slug = pathname.split('/')[1];
    if (slug === 'profile.php') {
      const id = url.searchParams.get('id');
      if (id) {
        slug = `profile.php?id=${id}`;
      }
    }

    const isFriendSlug = friendSlugsSet.has(slug);
    return isFriendSlug;
  });

  return !!foundFriendSlugElement;
};

export const isFollowingPost = (
  post: Element,
  followingSlugsSet: Set<string>
) => {
  const [isSuccess, aElements] = findAllHeaderAElements(post);
  if (!isSuccess) return false;

  const foundFollowingSlugElement = aElements.find((a) => {
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('https://www.facebook.com')) return false;
    const url = new URL(href);
    const pathname = url.pathname;
    if (pathname.split('/').length !== 2) return false;

    // Extract slug - for profile.php URLs, include only the 'id' query parameter
    let slug = pathname.split('/')[1];
    if (slug === 'profile.php') {
      const id = url.searchParams.get('id');
      if (id) {
        slug = `profile.php?id=${id}`;
      }
    }

    const isFollowingSlug = followingSlugsSet.has(slug);
    return isFollowingSlug;
  });

  return !!foundFollowingSlugElement;
};

export const isGroupPost = (
  post: Element,
  groupSlugSet: Set<string>,
  groupNameSet: Set<string>
) => {
  const [isSuccess, aElements] = findAllHeaderAElements(post);
  if (!isSuccess) return false;

  const foundGroupElement = aElements.find((a) => {
    const href = a.getAttribute('href');
    if (!href) return false;

    const name = a.textContent?.trim() || '';

    // Check if this is a group link
    const parts = href.split('/');
    if (parts.length < 2) return false;

    // Handle both full URLs (https://www.facebook.com/groups/123) and relative URLs (/groups/123)
    let groupsIndex = parts.findIndex((part) => part === 'groups');
    if (groupsIndex === -1) return false;

    // Extract group ID from URL (e.g., /groups/123456789/)
    const groupId = parts[groupsIndex + 1];
    if (!groupId) return false;

    // Create slug in the same format as stored (groups/123456789)
    const slug = `groups/${groupId}`;

    return groupSlugSet.has(slug) || groupNameSet.has(name);
  });

  return !!foundGroupElement;
};
