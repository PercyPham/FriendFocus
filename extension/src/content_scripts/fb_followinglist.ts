import {
  getFollowingListAutoCrawl,
  extractFollowingInfo,
} from './services/followinglist_service';
import {
  BUILDING_FRIENDFOCUS_FOLLOWINGLIST_QUERY_KEY,
  PROFILE_ADD_BUTTON_CLASS,
} from '@/common/constants';
import { sendMessage } from '@/common/background_contract/client';
import {
  showModeSelectionPopup,
  showManualSelectionUI,
} from './components/OverlayManager';
import type { FollowingInfo } from '@/common/types';
import storage from '@/common/storage';

console.debug('> Loaded: fb_followinglist.ts');

// Global state to track all selected profiles (persists across DOM changes)
const selectedProfiles = new Map<string, FollowingInfo>();

// Manual mode: Add buttons to profile elements
const initializeManualMode = (existingSlugs: Set<string>) => {
  // Track added buttons to avoid duplicates
  const addedButtons = new WeakSet<Element>();

  // Initialize selectedProfiles with existing saved profiles
  existingSlugs.forEach((slug) => {
    // We'll add the full info when we encounter the profile
    selectedProfiles.set(slug, { slug, name: '', type: 'person' });
  });

  // Function to add button to a profile element
  const addButtonToProfile = (profileElement: Element) => {
    if (addedButtons.has(profileElement)) return;

    const followingInfo = extractFollowingInfo(profileElement);
    if (!followingInfo) return;

    // Find a suitable parent container to add the button
    // We want to add it to the right side of the profile card
    const container =
      profileElement.closest('div[role="article"]') ||
      profileElement.closest('div[class*="x1"]') ||
      profileElement.parentElement;

    if (!container) return;

    // Check if this profile is already selected (either from saved list or newly selected)
    const isAlreadySelected = selectedProfiles.has(followingInfo.slug);

    // If selected but we don't have full info yet, update it
    if (isAlreadySelected) {
      selectedProfiles.set(followingInfo.slug, followingInfo);
    }

    // Create button with inline styles (since it's injected into FB page, not Shadow DOM)
    const button = document.createElement('button');
    button.className = PROFILE_ADD_BUTTON_CLASS; // Keep class for selector
    button.setAttribute('data-slug', followingInfo.slug);
    button.setAttribute('data-name', followingInfo.name);
    button.setAttribute('data-type', followingInfo.type);
    button.setAttribute('data-selected', String(isAlreadySelected));

    // Base button styles
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

    // Get icon URL
    const iconUrl = chrome.runtime.getURL('public/icon-16.png');

    // Set initial appearance based on whether it's already selected
    if (isAlreadySelected) {
      button.style.background = '#1877f2';
      button.style.color = 'white';
      button.innerHTML = `
        <img src="${iconUrl}" 
             alt="FF" 
             style="position: absolute; top: -4px; left: -4px; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); z-index: 1;" />
        <svg style="width: 20px; height: 20px; display: block;" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 10L8.5 13.5L15 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    } else {
      button.innerHTML = `
        <img src="${iconUrl}" 
             alt="FF" 
             style="position: absolute; top: -4px; left: -4px; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); z-index: 1;" />
        <svg style="width: 20px; height: 20px; display: block;" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    // Toggle selection on click
    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isSelected = button.getAttribute('data-selected') === 'true';
      const newSelected = !isSelected;
      button.setAttribute('data-selected', String(newSelected));

      // Update global state
      if (newSelected) {
        selectedProfiles.set(followingInfo.slug, followingInfo);
      } else {
        selectedProfiles.delete(followingInfo.slug);
      }

      // Update button appearance
      if (newSelected) {
        button.style.background = '#1877f2';
        button.style.color = 'white';
        button.innerHTML = `
          <img src="${iconUrl}" 
               alt="FF" 
               style="position: absolute; top: -4px; left: -4px; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); z-index: 1;" />
          <svg style="width: 20px; height: 20px; display: block;" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10L8.5 13.5L15 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      } else {
        button.style.background = 'white';
        button.style.color = '#1877f2';
        button.innerHTML = `
          <img src="${iconUrl}" 
               alt="FF" 
               style="position: absolute; top: -4px; left: -4px; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); z-index: 1;" />
          <svg style="width: 20px; height: 20px; display: block;" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;
      }

      // Dispatch custom event to update the count in ManualSelectionUI
      window.dispatchEvent(new CustomEvent('ff-selection-changed'));
    };

    // Hover effect
    button.onmouseenter = () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      if (button.getAttribute('data-selected') === 'false') {
        button.style.background = '#f0f2f5';
      }
    };

    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      if (button.getAttribute('data-selected') === 'false') {
        button.style.background = 'white';
      }
    };

    // Position the button on the right side
    if (container instanceof HTMLElement) {
      const containerStyle = window.getComputedStyle(container);
      if (containerStyle.position === 'static') {
        container.style.position = 'relative';
      }
    }

    container.appendChild(button);
    addedButtons.add(profileElement);
  };

  // Add buttons to all visible profiles
  const addButtonsToVisibleProfiles = () => {
    const profileElements = document.querySelectorAll(
      'a[href^="https://www.facebook.com"]'
    );
    profileElements.forEach((element) => {
      // Check if this is a valid profile link
      const href = element.getAttribute('href');
      if (!href) return;

      try {
        const url = new URL(href);
        const pathname = url.pathname;
        if (pathname.split('/').filter(Boolean).length === 1) {
          addButtonToProfile(element);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });
  };

  // Initial pass
  addButtonsToVisibleProfiles();

  // Set up MutationObserver to handle dynamically loaded profiles
  const observer = new MutationObserver(() => {
    addButtonsToVisibleProfiles();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
};

const collectFollowingListIfNeeded = async () => {
  const url = new URL(window.location.href);
  const isBuildingFollowingList = url.searchParams.get(
    BUILDING_FRIENDFOCUS_FOLLOWINGLIST_QUERY_KEY
  );
  if (!isBuildingFollowingList) return;

  // Step 1: Show mode selection popup
  const selectedMode = await showModeSelectionPopup();

  let followingList: FollowingInfo[] = [];

  if (selectedMode === 'auto') {
    // Auto-crawl mode
    followingList = await getFollowingListAutoCrawl();
  } else {
    // Manual mode - load existing following list first
    const existingFollowings =
      (await storage.get(storage.key.followingList)) || [];
    const existingSlugs = new Set(existingFollowings.map((f) => f.slug));

    const observer = initializeManualMode(existingSlugs);

    // Show manual selection UI and wait for user to confirm
    // Pass functions that retrieve selected profiles, count, and clear from the global state
    followingList = await showManualSelectionUI(
      () => Array.from(selectedProfiles.values()),
      () => selectedProfiles.size,
      () => {
        selectedProfiles.clear();
        // Update all visible buttons to reflect the cleared state
        document
          .querySelectorAll(`.${PROFILE_ADD_BUTTON_CLASS}`)
          .forEach((button) => {
            const isSelected = button.getAttribute('data-selected') === 'true';
            if (isSelected) {
              // Simulate click to update appearance
              (button as HTMLButtonElement).click();
            }
          });
      }
    );

    // Clean up observer
    observer.disconnect();

    // Remove all buttons
    document
      .querySelectorAll(`.${PROFILE_ADD_BUTTON_CLASS}`)
      .forEach((btn) => btn.remove());
  }

  // Step 3: Send following list to background for storage
  await sendMessage('SAVE_FOLLOWING_LIST', followingList);

  // Step 4: Clear selected profiles state
  selectedProfiles.clear();

  // Step 5: Close the tab
  await sendMessage('CLOSE_TAB', undefined);
};

// Wait for the page to be fully loaded before running
if (document.readyState === 'complete') {
  // Page is already loaded
  collectFollowingListIfNeeded();
} else {
  // Wait for the page to finish loading
  window.addEventListener('load', () => {
    collectFollowingListIfNeeded();
  });
}
