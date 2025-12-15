# FriendFocus GEMINI.md

## Project Overview

FriendFocus is a Chrome extension that enhances the user's Facebook experience by filtering their newsfeed to display posts only from their friends. It's built using modern web technologies, including React for the user interface, TypeScript for type safety, and Vite for a fast development and build process. The extension consists of a popup for user interaction, a background service worker for core logic, and content scripts for interacting with Facebook pages.

**Key Technologies:**

*   **React:** For building the user interface of the popup.
*   **TypeScript:** For static typing and improved code quality.
*   **Vite:** As the build tool and development server.
*   **@crxjs/vite-plugin:** For seamless Chrome extension development with Vite.
*   **Zustand:** For state management in the popup.
*   **Tailwind CSS:** For styling the popup.

**Architecture:**

*   **Popup:** The user interface of the extension, allowing users to enable/disable the "friend focus" mode and initiate the friend list collection. It's built with React and located in `src/toolbar_action/popup`.
*   **Background Script:** The core logic of the extension, running as a service worker. It handles tasks like opening tabs, managing storage, and communicating with other parts of the extension. The main background script is `src/background/service_worker.ts`.
*   **Content Scripts:** These scripts are injected into Facebook pages to interact with the DOM.
    *   `src/content_scripts/fb_newsfeed.ts`: Filters the newsfeed based on the user's friend list.
    *   `src/content_scripts/fb_friendlist.ts`: Collects the user's friend list from their profile.
*   **Storage:** The extension uses `chrome.storage` to persist the friend list and the "friend focus" state.

## Building and Running

### Prerequisites

*   Node.js and pnpm

### Development

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Start the development server:**

    ```bash
    pnpm run dev
    ```

3.  **Load the extension in Chrome:**
    *   Open Chrome and navigate to `chrome://extensions/`.
    *   Enable "Developer mode".
    *   Click "Load unpacked" and select the `dist` directory.

### Production Build

1.  **Build the extension:**

    ```bash
    pnpm run build
    ```

    This will create a production-ready build in the `dist` directory and a zip file in the `release` directory.

## Development Conventions

*   **Code Style:** The project uses Prettier and ESLint for code formatting and linting. (This is an assumption based on common practices, but not explicitly confirmed from the files).
*   **File Structure:** The project follows a feature-based file structure, with separate directories for the background script, content scripts, and popup.
*   **State Management:** The popup uses Zustand for state management, as seen in `src/toolbar_action/popup/store/usePopupStore.ts`.
*   **Communication:** The different parts of the extension (background, content scripts, popup) communicate using `chrome.runtime.sendMessage` and `chrome.runtime.onMessage`. A contract for these messages is defined in `src/common/background_contract/contract.ts`.
