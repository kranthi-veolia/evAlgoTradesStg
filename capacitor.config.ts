import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.matheval.trades',
  appName: 'Ev-Algo Trades',
  webDir: 'dist',
  android: {
  },
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // FirebaseAuthentication: {
    //   skipNativeAuth: false,
    //   providers: ["google.com"],
    //   webClientId: '703086075500-1kmjmfnan0f2c3j6j68590j59i6bta2s.apps.googleusercontent.com',
    //   serverClientId: '703086075500-1kmjmfnan0f2c3j6j68590j59i6bta2s.apps.googleusercontent.com'
    // },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      androidClientId: '703086075500-ecml6mfktm4dcr8162rva6pti4el8os9.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
  // platforms: ['android', 'ios'] // Add this line
};

export default config;
