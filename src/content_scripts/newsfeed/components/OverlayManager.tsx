import { createRoot, Root } from 'react-dom/client';
import overlayStyles from '../../shared/styles/overlay.css?inline';
import FloatingStatusBar from './FloatingStatusBar';

interface ShadowRootContext {
  shadowRoot: ShadowRoot;
  container: HTMLDivElement;
  reactRoot: Root;
}

let currentContext: ShadowRootContext | null = null;

const createShadowRoot = (): ShadowRootContext => {
  // Create container element
  const container = document.createElement('div');
  container.id = 'friendfocus-floating-bar-root';
  container.style.cssText =
    'all: initial; position: fixed; z-index: 2147483647; pointer-events: none;';
  document.body.appendChild(container);

  // Attach Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Inject Tailwind styles into Shadow DOM
  const styleSheet = document.createElement('style');
  styleSheet.textContent = overlayStyles;
  shadowRoot.appendChild(styleSheet);

  // Create mount point for React
  const mountPoint = document.createElement('div');
  mountPoint.style.cssText = 'pointer-events: auto;';
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

// Show Floating Status Bar
export const showFloatingBar = (): void => {
  const context = ensureShadowRoot();
  context.reactRoot.render(<FloatingStatusBar />);
};

// Hide Floating Status Bar
export const hideFloatingBar = (): void => {
  cleanupShadowRoot();
};
