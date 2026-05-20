import { useEffect, useState, useRef } from 'react';
import storage, { BlockedPostsLog } from '@/common/storage';
import { getTodayDateString } from '@/common/utils';
import { sendMessage } from '@/common/background_contract/client';

export default function FloatingStatusBar() {
  const [blockedToday, setBlockedToday] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  const lastBlockedCount = useRef(0);
  const isInitialized = useRef(false);

  useEffect(() => {
    const handleUpdate = (val: boolean | undefined) => {
      setIsEnabled(val ?? true);
    };
    // Initial load
    storage.get(storage.key.isStatusIndicatorVisible).then(handleUpdate);
    // Listen for changes
    storage.onChange(storage.key.isStatusIndicatorVisible, handleUpdate);
  }, []);

  useEffect(() => {
    const handleUpdate = (log: BlockedPostsLog | undefined) => {
      const today = getTodayDateString();
      const count = log?.[today] || 0;

      if (!isInitialized.current) {
        setBlockedToday(count);
        lastBlockedCount.current = count;
        isInitialized.current = true;
        return;
      }

      if (count > lastBlockedCount.current) {
        setIsVisible(true);
      }

      setBlockedToday(count);
      lastBlockedCount.current = count;
    };

    // Initial load
    storage.get(storage.key.blockedPostsLog).then(handleUpdate);

    // Listen for changes
    storage.onChange(storage.key.blockedPostsLog, handleUpdate);
  }, []);

  // Auto-hide timer
  useEffect(() => {
    if (isVisible && !isHovered) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isHovered, blockedToday]);

  const handleClick = () => {
    if (isHovered) {
      sendMessage('OPEN_EXTENSION_POPUP');
    }
  };

  if (!isEnabled) return <></>;
  if (!isVisible && !isHovered) return <></>;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className='fixed bottom-5 left-0 right-0 mx-auto w-fit z-2147483647 cursor-pointer pointer-events-auto'
    >
      {!isHovered ? (
        // Collapsed state: thin blue bar with light beam back and forth
        <div className='relative overflow-hidden w-[30px] h-[2px] bg-fb-blue-alt rounded-[1px] shadow-sm'>
          <div className='absolute top-0 bottom-0 w-1/2 animate-shimmer-beam' />
        </div>
      ) : (
        // Expanded state: logo + blocked count
        <div className='flex items-center gap-3 px-4 py-2 bg-white dark:bg-fb-dark-bg rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-transparent dark:border-fb-gray-dark animate-in fade-in zoom-in duration-200'>
          <img
            src={chrome.runtime.getURL('icon.svg')}
            className='w-6 h-6'
            alt='FriendFocus Logo'
          />
          <div className='flex flex-col items-start'>
            <span className='text-[10px] text-fb-gray dark:text-fb-gray-light font-medium font-sans leading-tight'>
              Blocked Today
            </span>
            <span className='text-base text-fb-blue-alt dark:text-fb-blue-light font-bold font-sans leading-tight'>
              {blockedToday.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
