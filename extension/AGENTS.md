# FriendFocus GEMINI.md

## Project Overview

FriendFocus is a Chrome extension that enhances the user's Facebook experience by filtering their newsfeed to display posts only from their friends. It's built using modern web technologies, including React for the user interface, TypeScript for type safety, and Vite for a fast development and build process. The extension consists of a popup for user interaction, a background service worker for core logic, and content scripts for interacting with Facebook pages.

**Key Technologies:**

- **React:** For building the user interface of the popup.
- **TypeScript:** For static typing and improved code quality.
- **Vite:** As the build tool and development server.
- **@crxjs/vite-plugin:** For seamless Chrome extension development with Vite.
- **Zustand:** For state management in the popup.
- **Tailwind CSS:** For styling the popup and content script overlays; design tokens defined in `src/common/styles/tokens.css`.

**Architecture:**

The extension follows a **modular architecture** with three main modules and a common folder:

### Module Structure

1. **Background Module** (`src/background/`) - Service worker that handles core extension logic, storage operations, and acts as the communication hub
2. **Popup Module** (`src/toolbar_action/popup/`) - React-based UI for user interactions and settings
3. **Content Scripts Module** (`src/content_scripts/`) - Scripts injected into Facebook pages to interact with the DOM
4. **Common Folder** (`src/common/`) - Shared code, types, constants, and contracts used across multiple modules

### Key Principles

- **Shared Code Location:** Any code used by 2+ modules belongs in `src/common/`
- **Module Communication:** Modules communicate via an RPC-style contract pattern (background contract)
  - Background acts as server, popup and content scripts act as clients
  - All communication is type-safe through shared contracts in `src/common/`
- **Storage:** Uses `chrome.storage.local` with type-safe utilities

## Project Structure

```
src/
├── background/              # Background Module (Service Worker)
│   ├── service_worker.ts    # Main entry point
│   ├── server.ts            # RPC server implementation
│   └── storage-writer.ts    # Write to storage
│
├── toolbar_action/          # Popup Module (UI)
│   └── popup/
│       ├── main.tsx         # Entry point
│       ├── Popup.tsx        # Main popup component
│       ├── store/           # Zustand state management
│       └── ...              # Popup related
│
├── content_scripts/         # Content Scripts Module
│   ├── newsfeed/            # Newsfeed filtering logic
│   │   ├── index.ts
│   │   ├── newsfeed_service.ts
│   │   └── ...
│   ├── friend_list/         # Friend list collection logic
│   │   ├── index.ts
│   │   ├── friendlist_service.ts
│   │   └── ...
│   ├── following_list/      # Following list collection logic
│   │   ├── index.ts
│   │   ├── followinglist_service.ts
│   │   └── ...
│   ├── group_list/          # Group list collection logic
│   │   ├── index.ts
│   │   ├── grouplist_service.ts
│   │   └── ...
│   └── ...                  # Content script related
│
└── common/                  # Shared Code (used by 2+ modules)
    ├── background_contract/ # RPC contract for inter-module communication
    │   ├── contract.ts      # Type-safe contract definitions
    │   └── client.ts        # Client for calling background methods
    ├── styles/              # Shared CSS design tokens
    │   └── tokens.css       # Tailwind @theme tokens (colors, brand palette)
    ├── constants.ts         # Shared constants
    └── storage.ts           # Storage utilities and types, only have functions for Read ONLY
```

## Building and Running

### Prerequisites

- Node.js and pnpm

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
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable "Developer mode".
    - Click "Load unpacked" and select the `dist` directory.

### Production Build

1.  **Build the extension:**

    ```bash
    pnpm run build
    ```

    This will create a production-ready build in the `dist` directory and a zip file in the `release` directory.

## Development Conventions

- **Module Boundaries:** Keep code within its respective module unless it needs to be shared across modules
- **Common Folder:** Place code in `src/common/` when it's used by 2+ modules (types, constants, contracts, utilities)
- **Type Safety:** Use TypeScript for all code; maintain type-safe contracts for inter-module communication
- **State Management:** Zustand for popup state, chrome.storage for persistence
- **Communication Pattern:** RPC-style background contract for all cross-module communication
- **Clean Code:** Write self-documenting code that explains itself through clear naming and structure; avoid redundant, lengthy, or unnecessary comments
- **Styling Tokens:** All custom colors are defined as Tailwind v4 `@theme` tokens in `src/common/styles/tokens.css`; use named utility classes (e.g. `bg-fb-blue`, `text-fb-gray`) — never hardcode hex values with arbitrary syntax `[#hex]` in components
- **Import/Export Consistency:** Whenever a new persistent data field is added to storage, update `ExportData` in `src/common/types.ts`, the `exportData()` reader in `src/toolbar_action/popup/utils/data-transfer.ts`, and the `IMPORT_DATA` handler in `src/background/service_worker.ts` to include that field