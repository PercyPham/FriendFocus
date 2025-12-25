export const findFeedPostsDirectParent = () => {
  const mainDiv = document.querySelector('div[role="main"]');
  if (!mainDiv) return undefined;

  const h3s = mainDiv.querySelectorAll('h3');
  const feedPostsHeader = Array.from(h3s).find((h3) =>
    h3.textContent?.includes('Feed posts')
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

  const likeButton = post.querySelector('div[aria-label="Like"]');
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
    const slug = pathname.split('/')[1];
    const isFriendSlug = friendSlugsSet.has(slug);
    return isFriendSlug;
  });

  return !!foundFriendSlugElement;
};

export const isGroupPost = (post: Element) => {
  const [isSuccess, aElements] = findAllHeaderAElements(post);
  if (!isSuccess) return false;

  const foundGroupElement = aElements.find((a) => {
    const href = a.getAttribute('href');
    const parts = href?.split('/');
    if (!parts) return false;
    if (parts.length < 2) return false;
    if (parts[1] !== 'groups') return false;
    return true;
  });

  return !!foundGroupElement;
};
