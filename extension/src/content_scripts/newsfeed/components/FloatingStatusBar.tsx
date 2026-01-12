import { useEffect, useState } from 'react';
import storage from '@/common/storage';
import { getTodayDateString } from '@/common/utils';
import { sendMessage } from '@/common/background_contract/client';

export default function FloatingStatusBar() {
  const [blockedToday, setBlockedToday] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Initial load
    const loadBlockedCount = async () => {
      const log = await storage.get(storage.key.blockedPostsLog);
      const today = getTodayDateString();
      setBlockedToday(log?.[today] || 0);
    };

    loadBlockedCount();

    // Listen for changes
    storage.onChange(storage.key.blockedPostsLog, (log) => {
      const today = getTodayDateString();
      setBlockedToday(log?.[today] || 0);
    });
  }, []);

  const handleClick = () => {
    if (isHovered) {
      sendMessage('OPEN_EXTENSION_POPUP');
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className='fixed bottom-5 left-0 right-0 mx-auto w-fit z-2147483647 cursor-pointer pointer-events-auto'
    >
      {!isHovered ? (
        // Collapsed state: thin blue bar with light beam back and forth
        <div className='relative overflow-hidden w-[30px] h-[2px] bg-[#0866FF] rounded-[1px] shadow-sm'>
          <div className='absolute top-0 bottom-0 w-1/2 animate-shimmer-beam' />
        </div>
      ) : (
        // Expanded state: logo + blocked count
        <div className='flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#242526] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-transparent dark:border-[#393a3b] animate-in fade-in zoom-in duration-200'>
          <img
            src={chrome.runtime.getURL('icon.svg')}
            className='w-6 h-6'
            alt='FriendFocus Logo'
          />
          <div className='flex flex-col items-start'>
            <span className='text-[10px] text-[#65676b] dark:text-[#b0b3b8] font-medium font-sans leading-tight'>
              Blocked Today
            </span>
            <span className='text-base text-[#0866FF] dark:text-[#4599ff] font-bold font-sans leading-tight'>
              {blockedToday.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}