# FriendFocus

This template helps you quickly start developing Chrome extensions with React, TypeScript and Vite. It includes the CRXJS Vite plugin for seamless Chrome extension development.

## Structure

<!-- TODO: fix -->

```
root/
├── src/
│   ├── manifest.json
│   │
│   ├── _shared/                # (The Shared Kernel)
│   │   ├── types/              # Domain models (User, Settings)
│   │   ├── utils/              # Pure utility functions
│   │   └── constants.ts
│   │
│   ├── _infrastructure/        # (The Communication Layer)
│   │   ├── messaging/
│   │   │   ├── contract.ts     # <--- THE HOLY GRAIL (Type Definitions)
│   │   │   ├── client.ts       # Wrapper for sending messages
│   │   │   └── server.ts       # Wrapper for handling messages
│   │   └── storage/            # Wrappers for chrome.storage
│   │
│   ├── background/             # (Service Worker Entry Point)
│   │   ├── index.ts            # Entry file
│   │   ├── domain/             # Business logic (State management)
│   │   └── services/           # External API calls
│   │
│   ├── content/                # (Content Script Entry Point)
│   │   ├── index.ts
│   │   └── logic/              # DOM manipulation logic
│   │
│   └── popup/                  # (UI Entry Point)
│       ├── index.tsx
│       ├── components/
│       └── hooks/              # Hooks that use the messaging client
```

## Features

- React with TypeScript
- TypeScript support
- Vite build tool
- CRXJS Vite plugin integration
- Chrome extension manifest configuration

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Start development server:

```bash
pnpm run dev
```

3. Open Chrome and navigate to `chrome://extensions/`, enable "Developer mode", and load the unpacked extension from the `dist` directory.

4. Build for production:

```bash
pnpm run build
```

## Project Structure

- `src/popup/` - Extension popup UI
- `src/content/` - Content scripts
- `manifest.config.ts` - Chrome extension manifest configuration

## Documentation

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin)

## Chrome Extension Development Notes

- Use `manifest.config.ts` to configure your extension
- The CRXJS plugin automatically handles manifest generation
- Content scripts should be placed in `src/content/`
- Popup UI should be placed in `src/popup/`
