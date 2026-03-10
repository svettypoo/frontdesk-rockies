import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rockies.frontdesk',
  appName: 'Front Desk Rockies',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
  server: {
    // During development, point to dev server. Remove for production APK.
    // url: 'http://192.168.x.x:5173',
    cleartext: true,
  },
};

export default config;
