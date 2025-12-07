import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/ui/popup/index.html',
  },
  permissions: ['sidePanel', 'contentSettings', 'activeTab'],
  content_scripts: [
    {
      js: ['src/ui/content/main.tsx'],
      matches: ['https://*.facebook.com/*'],
    },
  ],
  side_panel: {
    default_path: 'src/ui/sidepanel/index.html',
  },
});
