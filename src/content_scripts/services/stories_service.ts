const findStoriesDiv = () => {
  const mainDiv = document.querySelector('div[role="main"]');
  if (!mainDiv) return undefined;

  const storiesDiv = mainDiv.querySelector('div[aria-label="Stories"]');
  return storiesDiv;
};

export const hideStories = () => {
  const storiesDiv = findStoriesDiv();
  if (!storiesDiv) return;

  storiesDiv.setAttribute('style', 'display: none !important;');
};

export const showStories = () => {
  const storiesDiv = findStoriesDiv();
  if (!storiesDiv) return;

  storiesDiv.setAttribute('style', 'display: block !important;');
};
