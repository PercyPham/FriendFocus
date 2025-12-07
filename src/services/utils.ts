export const findFeedPosts = () => {
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

  const feedPosts = Array.from(feedPostsDiv.children);
  return feedPosts;
};

export const isPeoplePost = (post: Element) => {
  // Every post will have 3 parts:
  // 1. Header: avatar, post owner info
  // 2. Content
  // 3. Actions: like, comment, share, etc

  // We focus on the People Posts (not page, group, sponsored posts)
  // People post examples:
  // - Friend post on his own profile
  // - Friend post on some group
  // - Friend is tagged in a post

  //  Friend posts exclude:
  // - People posts but have word "Follow" after profile name

  // Steps to find people posts:
  // 1. Find profile_name (data-ad-rendering-role="profile_name")
  // 2. Find Like button
  // 3. Find shared parent element
  // 4. from that, identify the Header part.
  // 5. Check header for element with href attribute contains "facebook.com/profile_name"
  // 6. Exclude if it has "Follow" after profile name

  const profileNameDiv = post.querySelector(
    'div[data-ad-rendering-role="profile_name"]'
  );
  if (!profileNameDiv) return false;

  const likeButton = post.querySelector('div[aria-label="Like"]');
  if (!likeButton) return false;

  // let commonParent: Element | null = null;
  // let headerDiv: Element | null = null;
  // let actionDiv: Element | null = null;

  // let headerEle = profileNameDiv;
  // const headerEleSet = new Set<Element>();
  // const headerChildMap: Map<Element, Element> = new Map();
  // while (headerEle.parentElement !== post) {
  //   headerChildMap.set(headerEle.parentElement!, headerEle);
  //   headerEleSet.add(headerEle.parentElement!);
  //   headerEle = headerEle.parentElement!;
  // }

  // let actionEle = likeButton;
  // const actionPath: Element[] = [];
  // while (actionEle !== post) {
  //   actionPath.push(actionEle);
  //   if (headerEleSet.has(actionEle.parentElement!)) {
  //     commonParent = actionEle.parentElement!;
  //     headerDiv = headerChildMap.get(commonParent)!;
  //     actionDiv = actionEle;
  //     break;
  //   }
  //   actionEle = actionEle.parentElement!;
  // }

  // if (!commonParent || !headerDiv || !actionDiv) return false;

  let hasProfileLink = false;
  {
    // const aElements = headerDiv.querySelectorAll(
    const aElements = profileNameDiv.querySelectorAll(
      'a[href*="https://www.facebook.com"]'
    );

    const profileOrPageLinkElements = Array.from(aElements).filter(
      (a: Element) => {
        const href = a.getAttribute('href');
        const url = new URL(href!);
        const pathname = url.pathname;
        return pathname.startsWith('/') && pathname.split('/').length === 2;
      }
    );

    hasProfileLink = profileOrPageLinkElements.length > 0;
  }
  if (!hasProfileLink) return false;

  const hasSpanWithTextFollow = Array.from(
    profileNameDiv.querySelectorAll('span')
  ).find((span) => span.textContent.includes('Follow'));
  if (hasSpanWithTextFollow) return false;

  return true;
};

export const findPeoplePosts = () => {
  const feedPosts = findFeedPosts();
  if (!feedPosts?.length) return undefined;

  const peoplePosts = feedPosts.filter((post: Element) => isPeoplePost(post));
  return peoplePosts;
};
