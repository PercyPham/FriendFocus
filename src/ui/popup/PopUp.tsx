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

export default function App() {
  const [isStoriesShown, setShowStories] = useState(true);
  const [isReelsShown, setShowReels] = useState(true);
  const [isNonFriendPostsShown, setShowNonFriendPosts] = useState(true);

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
  };

  return (
    <div className='flex flex-col items-center justify-center h-50 w-50 gap-2 p-4'>
      <Button onClick={toggleStories}>
        {isStoriesShown ? 'Hide Stories' : 'Show Stories'}
      </Button>
      <Button onClick={toggleReels}>
        {isReelsShown ? 'Hide Reels' : 'Show Reels'}
      </Button>
      <Button onClick={toggleNonFriendPosts}>Toggle Non Friend Posts</Button>
    </div>
  );
}
