import { createRoot, Root } from 'react-dom/client';
import overlayStyles from '../../shared/styles/overlay.css?inline';
import GroupProgressPopup from './GroupProgressPopup';
import ModeSelectionPopup from './ModeSelectionPopup';
import ManualSelectionUI from './ManualSelectionUI';
import type { GroupInfo } from '@/common/types';

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

// Group Progress Popup
interface GroupProgressPopupControls {
  updateCount: (count: number) => void;
  close: () => void;
}

export const showGroupProgressPopup = (): GroupProgressPopupControls => {
  const context = ensureShadowRoot();

  let currentCount = 0;

  const updateCount = (count: number) => {
    currentCount = count;
    context.reactRoot.render(<GroupProgressPopup count={currentCount} />);
  };

  const close = () => {
    cleanupShadowRoot();
  };

  // Initial render
  context.reactRoot.render(<GroupProgressPopup count={currentCount} />);

  return { updateCount, close };
};

// Manual Selection UI for Groups
export const showManualGroupSelectionUI = (
  getSelectedGroups: () => GroupInfo[],
  getSelectedCount: () => number,
  clearAllSelections: () => void
): Promise<GroupInfo[]> => {
  return new Promise((resolve) => {
    const context = ensureShadowRoot();

    const handleConfirm = () => {
      const selectedGroups = getSelectedGroups();
      cleanupShadowRoot();
      resolve(selectedGroups);
    };

    context.reactRoot.render(
      <ManualSelectionUI
        onConfirm={handleConfirm}
        getSelectedCount={getSelectedCount}
        clearAllSelections={clearAllSelections}
      />
    );
  });
};

// Mode Selection Popup for Groups
export const showGroupModeSelectionPopup = (): Promise<'auto' | 'manual'> => {
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

