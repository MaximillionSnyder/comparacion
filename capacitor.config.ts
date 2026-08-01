import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.umapedigree.app',
  appName: 'Uma Pedigree',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
