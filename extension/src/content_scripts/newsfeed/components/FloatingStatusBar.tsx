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
    <>
      <style>{`
        @keyframes lightBeam {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: -100%;
          }
        }

        .light-beam-container {
          position: relative;
          overflow: hidden;
        }

        .light-beam {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.8),
            transparent
          );
          animation: lightBeam 2s ease-in-out infinite;
        }
      `}</style>

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
      >
        {!isHovered ? (
          // Collapsed state: thin blue bar with light beam
          <div
            className='light-beam-container'
            style={{
              width: '30px',
              height: '2px',
              backgroundColor: '#0866FF',
              borderRadius: '1px',
            }}
          >
            <div className='light-beam' />
          </div>
        ) : (
          // Expanded state: logo + blocked count
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 200 200'
              xmlns='http://www.w3.org/2000/svg'
            >
              <circle cx='100' cy='100' r='100' fill='#0866FF' />
              <line
                x1='100'
                y1='100'
                x2='100'
                y2='35'
                stroke='#ffffff'
                strokeWidth='10'
                strokeLinecap='round'
              />
              <line
                x1='100'
                y1='100'
                x2='156.29'
                y2='132.5'
                stroke='#ffffff'
                strokeWidth='10'
                strokeLinecap='round'
              />
              <line
                x1='100'
                y1='100'
                x2='43.71'
                y2='132.5'
                stroke='#ffffff'
                strokeWidth='10'
                strokeLinecap='round'
              />
              <circle cx='100' cy='100' r='32' fill='#ffffff' />
              <circle cx='100' cy='35' r='20' fill='#ffffff' />
              <circle cx='156.29' cy='132.5' r='20' fill='#ffffff' />
              <circle cx='43.71' cy='132.5' r='20' fill='#ffffff' />
            </svg>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  color: '#65676b',
                  fontWeight: 500,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                Blocked Today
              </span>
              <span
                style={{
                  fontSize: '16px',
                  color: '#0866FF',
                  fontWeight: 700,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {blockedToday.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
