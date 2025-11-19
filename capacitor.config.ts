import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gromotion.app',
  appName: 'GroMotion',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: 'android/app/gromotion-release.jks',
      keystorePassword: 'gromotion123',
      keystoreAlias: 'gromotion',
      keystoreAliasPassword: 'gromotion123',
      releaseType: 'APK'
    }
  },
  plugins: {
    AR: {
      worldTracking: true,
      planeDetection: true,
      lightEstimation: true,
      cameraPassthrough: true
    }
  }
};

export default config;
