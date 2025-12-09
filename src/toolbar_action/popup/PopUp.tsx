import { STORAGE } from '@/common/constants';
import { useState } from 'react';

const Button = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button className='bg-blue-500 text-white p-2 rounded-md' onClick={onClick}>
      {children}
    </button>
  );
};

export default function Popup() {
  const [isStoriesShown, setShowStories] = useState(true);
  const [isReelsShown, setShowReels] = useState(true);
  const [isNonFriendPostsShown, setShowNonFriendPosts] = useState(true);

  const setIsCollectingFriendList = (isCollecting: boolean) => {
    chrome.storage.local.set({
      [STORAGE.LOCAL.IS_COLLECTING_FRIEND_LIST]: isCollecting,
    });
  };

  const collectFriendList = async () => {
    try {
      // Set flag before opening tab so the content script knows to run
      setIsCollectingFriendList(true);

      // Open a new tab to Facebook friends page
      // The content script will be automatically injected by the manifest
      // and will check the flag to decide whether to run
      await chrome.tabs.create({
        url: 'https://www.facebook.com/me/friends',
        active: true,
      });

      console.log('Friend list collection initiated in new tab');
    } catch (error) {
      console.error('Error opening friend list tab:', error);
      setIsCollectingFriendList(false);
      alert('Failed to open friend list page. Please try again.');
    }
  };

  const toggleStories = async () => {
    // Query for the active tab in the current window
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id) {
      // Send message to the content script
      const action = isStoriesShown ? 'HIDE_STORIES' : 'SHOW_STORIES';
      chrome.tabs.sendMessage(tab.id, { action }, (response) => {
        // Optional: Handle response if needed
        console.log('Response from content script:', response);
      });
    }

    setShowStories(!isStoriesShown);
  };

  const toggleReels = async () => {
    // Query for the active tab in the current window
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id) {
      // Send message to the content script
      const action = isReelsShown ? 'HIDE_REELS' : 'SHOW_REELS';
      chrome.tabs.sendMessage(tab.id, { action }, (response) => {
        // Optional: Handle response if needed
        console.log('Response from content script:', response);
      });
    }

    setShowReels(!isReelsShown);
  };

  const toggleNonFriendPosts = async () => {
    // Query for the active tab in the current window
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const newIsNonFriendPostsShown = !isNonFriendPostsShown;

    if (tab?.id) {
      // Send message to the content script
      const action = newIsNonFriendPostsShown
        ? 'SHOW_NON_FRIEND_POSTS'
        : 'HIDE_NON_FRIEND_POSTS';
      chrome.tabs.sendMessage(tab.id, { action }, (response) => {
        // Optional: Handle response if needed
        console.log('Response from content script:', response);
      });
    }

    setShowNonFriendPosts(newIsNonFriendPostsShown);
    chrome.storage.sync.set({
      [STORAGE.SYNC.SHOW_NON_FRIEND_POSTS]: newIsNonFriendPostsShown,
    });
  };

  return (
    <div className='flex flex-col items-center justify-center h-50 w-50 gap-2 p-4'>
      <Button onClick={collectFriendList}>Build Friend List Filter</Button>
      <Button onClick={toggleStories}>
        {isStoriesShown ? 'Hide Stories' : 'Show Stories'}
      </Button>
      <Button onClick={toggleReels}>
        {isReelsShown ? 'Hide Reels' : 'Show Reels'}
      </Button>
      <Button onClick={toggleNonFriendPosts}>
        Non Friend Posts: {isNonFriendPostsShown ? 'Show' : 'Hide'}
      </Button>
    </div>
  );
}
