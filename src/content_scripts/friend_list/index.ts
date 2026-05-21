import { getFriendListAutoCrawl, extractFriendInfo } from './friendlist_service';
import { QUERY_KEYS, PROFILE_ADD_BUTTON_CLASS } from '@/common/constants';
import { sendMessage } from '@/common/background_contract/client';
import {
  showFriendModeSelectionPopup,
  showManualFriendSelectionUI,
} from './components/OverlayManager';
import type { FriendInfo } from '@/common/types';
import storage from '@/common/storage';
import { logger } from '@/common/logger';

logger.info('Loaded: friend_list/index.ts');

const selectedFriends = new Map<string, FriendInfo>();

const initializeManualMode = (existingFriends: FriendInfo[]): MutationObserver => {
  const addedButtons = new WeakSet<Element>();

  existingFriends.forEach((friend) => {
    selectedFriends.set(friend.slug, friend);
  });

  const addButtonToFriend = (anchorElement: Element) => {
    if (addedButtons.has(anchorElement)) return;

    const friendInfo = extractFriendInfo(anchorElement);
    if (!friendInfo) return;

    const container =
      anchorElement.closest('div[role="article"]') ||
      anchorElement.closest('div[class*="x1"]') ||
      anchorElement.parentElement;

    if (!container) return;

    const isAlreadySelected = selectedFriends.has(friendInfo.slug);

    if (isAlreadySelected) {
      const existing = selectedFriends.get(friendInfo.slug);
      if (friendInfo.name && friendInfo.name.trim() !== '') {
        selectedFriends.set(friendInfo.slug, friendInfo);
      } else if (existing && existing.name && existing.name.trim() !== '') {
        selectedFriends.set(friendInfo.slug, { ...friendInfo, name: existing.name });
      } else {
        selectedFriends.set(friendInfo.slug, friendInfo);
      }
    }

    const finalFriendInfo = selectedFriends.get(friendInfo.slug) || friendInfo;
    const nameToUse = finalFriendInfo.name || friendInfo.name || '';

    const button = document.createElement('button');
    button.className = PROFILE_ADD_BUTTON_CLASS;
    button.setAttribute('friendfocus-data-slug', friendInfo.slug);
    button.setAttribute('friendfocus-data-name', nameToUse);
    button.setAttribute('friendfocus-data-selected', String(isAlreadySelected));

    button.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 10;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: white;
      border: 2px solid #1877f2;
      color: #1877f2;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `;

    const iconUrl = chrome.runtime.getURL('public/icon-16.png');

    const checkedSvg = `
      <img src="${iconUrl}" alt="FF" style="position: absolute; top: -4px; left: -4px; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); z-index: 1;" />
      <svg style="width: 20px; height: 20px; display: block;" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 10L8.5 13.5L15 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    const plusSvg = `
      <img src="${iconUrl}" alt="FF" style="position: absolute; top: -4px; left: -4px; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); z-index: 1;" />
      <svg style="width: 20px; height: 20px; display: block;" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    if (isAlreadySelected) {
      button.style.background = '#1877f2';
      button.style.color = 'white';
      button.innerHTML = checkedSvg;
    } else {
      button.innerHTML = plusSvg;
    }

    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isSelected = button.getAttribute('friendfocus-data-selected') === 'true';
      const newSelected = !isSelected;
      button.setAttribute('friendfocus-data-selected', String(newSelected));

      if (newSelected) {
        const existing = selectedFriends.get(friendInfo.slug);
        let name = friendInfo.name;
        if (!name || name.trim() === '') {
          const nameFromButton = button.getAttribute('friendfocus-data-name');
          if (nameFromButton && nameFromButton.trim() !== '') {
            name = nameFromButton;
          } else if (existing && existing.name && existing.name.trim() !== '') {
            name = existing.name;
          }
        }
        selectedFriends.set(friendInfo.slug, { ...friendInfo, name });
        button.style.background = '#1877f2';
        button.style.color = 'white';
        button.innerHTML = checkedSvg;
      } else {
        selectedFriends.delete(friendInfo.slug);
        button.style.background = 'white';
        button.style.color = '#1877f2';
        button.innerHTML = plusSvg;
      }

      window.dispatchEvent(new CustomEvent('friendfocus-selection-changed'));
    };

    button.onmouseenter = () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      if (button.getAttribute('friendfocus-data-selected') === 'false') {
        button.style.background = '#f0f2f5';
      }
    };

    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      if (button.getAttribute('friendfocus-data-selected') === 'false') {
        button.style.background = 'white';
      }
    };

    if (container instanceof HTMLElement) {
      if (window.getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }
    }

    container.appendChild(button);
    addedButtons.add(anchorElement);
  };

  const addButtonsToVisibleFriends = () => {
    document
      .querySelectorAll('a[href^="https://www.facebook.com"]')
      .forEach((element) => {
        const href = element.getAttribute('href');
        if (!href) return;
        try {
          const url = new URL(href);
          if (url.pathname.split('/').filter(Boolean).length === 1) {
            addButtonToFriend(element);
          }
        } catch {
          // invalid URL, skip
        }
      });
  };

  addButtonsToVisibleFriends();

  const observer = new MutationObserver(() => {
    addButtonsToVisibleFriends();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return observer;
};

const collectFriendListIfNeeded = async () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.get(QUERY_KEYS.FRIENDLIST_BUILDING)) return;

  const selectedMode = await showFriendModeSelectionPopup();
  let friendList: FriendInfo[] = [];

  if (selectedMode === 'auto') {
    friendList = await getFriendListAutoCrawl();
  } else {
    const existingFriends = (await storage.get(storage.key.friendList)) || [];
    const observer = initializeManualMode(existingFriends);

    const result = await showManualFriendSelectionUI(
      () => Array.from(selectedFriends.values()),
      () => selectedFriends.size,
      () => {
        selectedFriends.clear();
        document
          .querySelectorAll(`.${PROFILE_ADD_BUTTON_CLASS}`)
          .forEach((btn) => {
            if (btn.getAttribute('friendfocus-data-selected') === 'true') {
              (btn as HTMLButtonElement).click();
            }
          });
      }
    );

    observer.disconnect();
    document
      .querySelectorAll(`.${PROFILE_ADD_BUTTON_CLASS}`)
      .forEach((btn) => btn.remove());

    if (result === null) {
      selectedFriends.clear();
      await sendMessage('CLOSE_TAB', undefined);
      return;
    }

    friendList = result;
  }

  await sendMessage('SAVE_FRIEND_LIST', friendList);
  selectedFriends.clear();
  await sendMessage('CLOSE_TAB', undefined);
};

if (document.readyState === 'complete') {
  collectFriendListIfNeeded();
} else {
  window.addEventListener('load', () => {
    collectFriendListIfNeeded();
  });
}
