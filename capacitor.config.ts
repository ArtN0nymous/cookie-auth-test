import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cookie.auth.test',
  appName: 'cookie-auth-test',
  webDir: 'www',
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
