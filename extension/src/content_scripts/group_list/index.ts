import { getGroupListAutoCrawl, extractGroupInfo } from './grouplist_service';
import { QUERY_KEYS, PROFILE_ADD_BUTTON_CLASS } from '@/common/constants';
import { sendMessage } from '@/common/background_contract/client';
import {
  showGroupModeSelectionPopup,
  showManualGroupSelectionUI,
} from './components/OverlayManager';
import type { GroupInfo } from '@/common/types';
import storage from '@/common/storage';
import { logger } from '@/common/logger';

logger.info('Loaded: group_list/index.ts');

// Global state to track all selected groups (persists across DOM changes)
const selectedGroups = new Map<string, GroupInfo>();

// Manual mode: Add buttons to group elements
const initializeManualMode = (
  existingGroups: GroupInfo[]
): MutationObserver => {
  // Track added buttons to avoid duplicates
  const addedButtons = new WeakSet<Element>();

  // Initialize selectedGroups with existing saved groups (with full info including names)
  existingGroups.forEach((group) => {
    selectedGroups.set(group.slug, group);
  });

  // Function to add button to a group element
  const addButtonToGroup = (groupAnchor: Element) => {
    if (addedButtons.has(groupAnchor)) return;

    const groupInfo = extractGroupInfo(groupAnchor);
    if (!groupInfo) return;

    // Find the list item container
    const listItem = groupAnchor.closest('div[role="listitem"]');
    if (!listItem) return;

    // Check if this group is already selected (either from saved list or newly selected)
    const isAlreadySelected = selectedGroups.has(groupInfo.slug);

    // If selected but we don't have full info yet, update it
    // IMPORTANT: Only update if we have a valid name, to prevent losing names due to DOM virtualization
    if (isAlreadySelected) {
      const existing = selectedGroups.get(groupInfo.slug);
      // Only update if we extracted a valid name, otherwise preserve existing name
      if (groupInfo.name && groupInfo.name.trim() !== '') {
        selectedGroups.set(groupInfo.slug, groupInfo);
      } else if (existing && existing.name && existing.name.trim() !== '') {
        // Preserve existing name if new extraction failed
        selectedGroups.set(groupInfo.slug, {
          ...groupInfo,
          name: existing.name,
        });
      } else {
        // Both are empty, just update with what we have
        selectedGroups.set(groupInfo.slug, groupInfo);
      }
    }

    // Get the final name to use (from selectedGroups if available, otherwise from extraction)
    const finalGroupInfo = selectedGroups.get(groupInfo.slug) || groupInfo;
    const nameToUse = finalGroupInfo.name || groupInfo.name || '';

    if (selectedGroups.has(groupInfo.slug)) {
      logger.debug({
        final: finalGroupInfo.name,
        group: groupInfo.name,
        slug: groupInfo.slug,
      });
    }

    // Create button with inline styles (since it's injected into FB page, not Shadow DOM)
    const button = document.createElement('button');
    button.className = PROFILE_ADD_BUTTON_CLASS; // Keep class for selector
    button.setAttribute('friendfocus-data-slug', groupInfo.slug);
    button.setAttribute('friendfocus-data-name', nameToUse);
    button.setAttribute('friendfocus-data-selected', String(isAlreadySelected));

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

    // Click handler to toggle selection
    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const slug = button.getAttribute('friendfocus-data-slug');
      const name = button.getAttribute('friendfocus-data-name');
      const isSelected =
        button.getAttribute('friendfocus-data-selected') === 'true';

      if (!slug || !name) return;

      // Get icon URL
      const iconUrl = chrome.runtime.getURL('public/icon-16.png');

      if (isSelected) {
        // Deselect
        selectedGroups.delete(slug);
        button.setAttribute('friendfocus-data-selected', 'false');
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
      } else {
        // Select - preserve existing name if current name is empty (due to DOM virtualization)
        const existing = selectedGroups.get(slug);
        let nameToUse = name;

        // If name is empty, try to preserve existing name
        if (!nameToUse || nameToUse.trim() === '') {
          if (existing && existing.name && existing.name.trim() !== '') {
            nameToUse = existing.name;
          }
        }

        selectedGroups.set(slug, { slug, name: nameToUse });
        button.setAttribute('friendfocus-data-selected', 'true');
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
      }

      // Dispatch custom event to update UI count
      window.dispatchEvent(new CustomEvent('friendfocus-selection-changed'));
    };

    // Hover effects
    button.onmouseenter = () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    };

    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    };

    // Position the listItem relatively so the button can be positioned absolutely
    const listItemElement = listItem as HTMLElement;
    if (listItemElement.style.position !== 'relative') {
      listItemElement.style.position = 'relative';
    }

    // Add button to the list item
    listItem.appendChild(button);
    addedButtons.add(groupAnchor);
  };

  // Initial scan: add buttons to all existing groups
  Array.from(
    document.querySelectorAll('div[role="listitem"] a[href*="/groups/"]')
  )
    .filter(
      (anchor: Element) =>
        anchor.children.length === 0 && anchor.textContent?.trim() !== ''
    )
    .forEach((anchor: Element) => addButtonToGroup(anchor));

  // Observe DOM changes to add buttons to newly loaded groups
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const element = node as Element;

        // Check if the added node itself is a list item or contains list items
        const listItems = element.matches('div[role="listitem"]')
          ? [element]
          : Array.from(element.querySelectorAll('div[role="listitem"]'));

        listItems.forEach((listItem) => {
          Array.from(listItem.querySelectorAll('a[href*="/groups/"]'))
            .filter(
              (anchor: Element) =>
                anchor.children.length === 0 &&
                anchor.textContent?.trim() !== ''
            )
            .forEach((anchor: Element) => addButtonToGroup(anchor));
        });
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
};

const collectGroupListIfNeeded = async () => {
  const url = new URL(window.location.href);
  const isBuildingGroupList = url.searchParams.get(
    QUERY_KEYS.GROUPLIST_BUILDING
  );
  if (!isBuildingGroupList) return;

  const enableWhenDone = url.searchParams.get(
    QUERY_KEYS.GROUPLIST_ENABLE_WHEN_DONE
  );

  // Step 1: Show mode selection popup
  const selectedMode = await showGroupModeSelectionPopup();

  let groupList: GroupInfo[] = [];

  if (selectedMode === 'auto') {
    // Auto-crawl mode
    groupList = await getGroupListAutoCrawl();
  } else {
    // Manual mode - load existing group list first
    const existingGroups = (await storage.get(storage.key.groupList)) || [];

    const observer = initializeManualMode(existingGroups);

    // Show manual selection UI and wait for user to confirm
    // Pass functions that retrieve selected groups, count, and clear from the global state
    groupList = await showManualGroupSelectionUI(
      () => Array.from(selectedGroups.values()),
      () => selectedGroups.size,
      () => {
        selectedGroups.clear();
        // Update all visible buttons to reflect the cleared state
        document
          .querySelectorAll(`.${PROFILE_ADD_BUTTON_CLASS}`)
          .forEach((button) => {
            const isSelected =
              button.getAttribute('friendfocus-data-selected') === 'true';
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

  // Step 3: Send group list to background for storage
  await sendMessage('SAVE_GROUP_LIST', groupList);

  if (enableWhenDone) {
    await sendMessage('SET_GROUPS_ENABLED', true);
  }

  // Close the tab
  await sendMessage('CLOSE_TAB');
};

collectGroupListIfNeeded();
