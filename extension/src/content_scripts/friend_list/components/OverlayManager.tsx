import { createRoot, Root } from 'react-dom/client';
import overlayStyles from '../../shared/styles/overlay.css?inline';
import UpdateFriendListPopup from './UpdateFriendListPopup';
import ProgressPopup from './ProgressPopup';
import ModeSelectionPopup from './ModeSelectionPopup';
import ManualSelectionUI from './ManualSelectionUI';
import type { FriendInfo } from '@/common/types';

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

// Mode Selection Popup
export const showFriendModeSelectionPopup = (): Promise<'auto' | 'manual'> => {
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
export const showManualFriendSelectionUI = (
  getSelectedFriends: () => FriendInfo[],
  getSelectedCount: () => number,
  clearAllSelections: () => void
): Promise<FriendInfo[] | null> => {
  return new Promise((resolve) => {
    const context = ensureShadowRoot();

    const handleConfirm = () => {
      const selectedFriends = getSelectedFriends();
      cleanupShadowRoot();
      resolve(selectedFriends);
    };

    const handleCancel = () => {
      cleanupShadowRoot();
      resolve(null);
    };

    context.reactRoot.render(
      <ManualSelectionUI
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        getSelectedCount={getSelectedCount}
        clearAllSelections={clearAllSelections}
      />
    );
  });
};

// Update Friend List Popup
export const showUpdatePopup = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const context = ensureShadowRoot();

    const handleStart = () => {
      cleanupShadowRoot();
      resolve(true);
    };

    const handleCancel = () => {
      cleanupShadowRoot();
      resolve(false);
    };

    context.reactRoot.render(
      <UpdateFriendListPopup onStart={handleStart} onCancel={handleCancel} />
    );
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

