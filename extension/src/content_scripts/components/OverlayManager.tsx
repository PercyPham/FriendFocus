import { createRoot, Root } from 'react-dom/client';
import overlayStyles from '../styles/overlay.css?inline';
import UpdateFriendListPopup from './UpdateFriendListPopup';
import ProgressPopup from './ProgressPopup';
import UpdateFollowingListPopup from './UpdateFollowingListPopup';
import FollowingProgressPopup from './FollowingProgressPopup';
import ModeSelectionPopup from './ModeSelectionPopup';
import ManualSelectionUI from './ManualSelectionUI';
import type { FollowingInfo } from '@/common/types';

interface ShadowRootContext {
  shadowRoot: ShadowRoot;
  container: HTMLDivElement;
  reactRoot: Root;
}

let currentContext: ShadowRootContext | null = null;

const createShadowRoot = (): ShadowRootContext => {
  // Create container element
  const container = document.createElement('div');
  container.id = 'friendfocus-overlay-root';
  container.style.cssText =
    'all: initial; position: fixed; z-index: 2147483647;';
  document.body.appendChild(container);

  // Attach Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Inject Tailwind styles into Shadow DOM
  const styleSheet = document.createElement('style');
  styleSheet.textContent = overlayStyles;
  shadowRoot.appendChild(styleSheet);

  // Create mount point for React
  const mountPoint = document.createElement('div');
  shadowRoot.appendChild(mountPoint);

  // Create React root
  const reactRoot = createRoot(mountPoint);

  return { shadowRoot, container, reactRoot };
};

const ensureShadowRoot = (): ShadowRootContext => {
  if (!currentContext) {
    currentContext = createShadowRoot();
  }
  return currentContext;
};

const cleanupShadowRoot = () => {
  if (currentContext) {
    currentContext.reactRoot.unmount();
    currentContext.container.remove();
    currentContext = null;
  }
};

// Update Friend List Popup
export const showUpdatePopup = (): Promise<void> => {
  return new Promise((resolve) => {
    const context = ensureShadowRoot();

    const handleStart = () => {
      resolve();
    };

    context.reactRoot.render(<UpdateFriendListPopup onStart={handleStart} />);
  });
};

// Progress Popup
interface ProgressPopupControls {
  updateCount: (count: number) => void;
  close: () => void;
}

export const showProgressPopup = (): ProgressPopupControls => {
  const context = ensureShadowRoot();

  let currentCount = 0;

  const updateCount = (count: number) => {
    currentCount = count;
    context.reactRoot.render(<ProgressPopup count={currentCount} />);
  };

  const close = () => {
    cleanupShadowRoot();
  };

  // Initial render
  context.reactRoot.render(<ProgressPopup count={currentCount} />);

  return { updateCount, close };
};

// Mode Selection Popup
export const showModeSelectionPopup = (): Promise<'auto' | 'manual'> => {
  return new Promise((resolve) => {
    const context = ensureShadowRoot();

    const handleSelectMode = (mode: 'auto' | 'manual') => {
      cleanupShadowRoot();
      resolve(mode);
    };

    context.reactRoot.render(
      <ModeSelectionPopup onSelectMode={handleSelectMode} />
    );
  });
};

// Manual Selection UI
export const showManualSelectionUI = (
  getSelectedProfiles: () => FollowingInfo[],
  getSelectedCount: () => number
): Promise<FollowingInfo[]> => {
  return new Promise((resolve) => {
    const context = ensureShadowRoot();

    const handleConfirm = () => {
      const selectedFollowings = getSelectedProfiles();
      cleanupShadowRoot();
      resolve(selectedFollowings);
    };

    context.reactRoot.render(
      <ManualSelectionUI
        onConfirm={handleConfirm}
        getSelectedCount={getSelectedCount}
      />
    );
  });
};

// Update Following List Popup
export const showUpdateFollowingPopup = (): Promise<void> => {
  return new Promise((resolve) => {
    const context = ensureShadowRoot();

    const handleStart = () => {
      resolve();
    };

    context.reactRoot.render(
      <UpdateFollowingListPopup onStart={handleStart} />
    );
  });
};

// Following Progress Popup
interface FollowingProgressPopupControls {
  updateCount: (count: number) => void;
  close: () => void;
}

export const showFollowingProgressPopup =
  (): FollowingProgressPopupControls => {
    const context = ensureShadowRoot();

    let currentCount = 0;

    const updateCount = (count: number) => {
      currentCount = count;
      context.reactRoot.render(<FollowingProgressPopup count={currentCount} />);
    };

    const close = () => {
      cleanupShadowRoot();
    };

    // Initial render
    context.reactRoot.render(<FollowingProgressPopup count={currentCount} />);

    return { updateCount, close };
  };
