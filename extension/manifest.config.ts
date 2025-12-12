import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    16: 'public/icon-16.png',
    32: 'public/icon-32.png',
    48: 'public/icon-48.png',
    128: 'public/icon-128.png',
  },
  action: {
    default_icon: {
      16: 'public/icon-16.png',
      32: 'public/icon-32.png',
      48: 'public/icon-48.png',
      128: 'public/icon-128.png',
    },
    default_popup: 'src/toolbar_action/popup/index.html',
  },
  permissions: ['storage', 'tabs', 'identity'],
  host_permissions: [
    'https://www.facebook.com/*',
    'https://*.firebaseio.com/',
    'https://*.googleapis.com/',
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
  oauth2: {
    client_id:
      '990643947962-0tapn6q6upkm2dgrapi25oj0s52rd6k5.apps.googleusercontent.com',
    scopes: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  },
  background: {
    service_worker: 'src/background/service_worker.ts',
    type: 'module',
  },
  content_scripts: [
    {
      js: ['src/content_scripts/fb_newsfeed.ts'],
      matches: ['https://www.facebook.com/*'],
    },
    {
      js: ['src/content_scripts/fb_friendlist.ts'],
      matches: ['https://www.facebook.com/*/friends*'],
      run_at: 'document_idle',
    },
  ],
});
