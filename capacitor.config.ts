import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tech.elevatefit.app',
  appName: 'Elevate',
  webDir: 'dist',
  server: {
    // In production, serve from bundled assets
    // For dev, uncomment the url below and run `npm run dev`
    // url: 'http://192.168.0.96:8081',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      // Handoff invisible: la capa web (SplashScreen.tsx) llama a hide() apenas
      // monta, para pasar sin costura del splash nativo a la animación. El
      // auto-hide a 2.5s es sólo una red de seguridad por si la web no llegara
      // a ocultarlo (nunca debería quedar pegado el splash nativo).
      launchAutoHide: true,
      launchShowDuration: 2500,
      backgroundColor: '#09090b', // gray-950 to match app theme
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#09090b',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
