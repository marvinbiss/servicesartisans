import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.servicesartisans.app',
  appName: 'Services Artisans',
  webDir: 'public', // Fichiers statiques de base

  // Pointer vers le serveur (dev ou production)
  server: {
    // URL du serveur - changer en production
    url: 'http://10.0.2.2:3000',
    cleartext: true,
    // Pour la production, utilisez:
    // url: 'https://servicesartisans.fr',
  },

  // Plugins configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2563eb',
      showSpinner: true,
      spinnerColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#2563eb',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },

  // Configuration Android
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#ffffff',
  },

  // Configuration iOS
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
    backgroundColor: '#ffffff',
  },
};

export default config;
