import 'dotenv/config';

export default {
  expo: {
    name: 'Party',
    slug: 'party',
    privacy: 'unlisted',
    platforms: ['ios', 'android'],
    
    plugins: [
      [
        "expo-ads-admob",
        {
          userTrackingPermission: "This identifier will be used to deliver personalized ads to you."
        }
      ],
      [
        "expo-tracking-transparency",
        {
          userTrackingPermission: "This identifier will be used to deliver personalized ads to you."
        }
      ]
    ],
    version: '1.0.1',
    sdkVersion: "43.0.0",
    orientation: 'portrait',
    icon: './assets/PNY.png',
    splash: {
      image: './assets/PNY.png',
      resizeMode: 'contain',
      backgroundColor: '#1c1c1e'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    android: {
      config: {
        googleMobileAdsAppId: "ca-app-pub-3940256099942544~1458002511" // sample id, replace with your own
      }
    },
    ios: {
      supportsTablet: false,
      buildNumber: "25",
      bundleIdentifier: "com.partynearyou.app",
      config: {
        googleMobileAdsAppId: "ca-app-pub-5790083206239403~2410650773" // sample id, replace with your own
      }
    },
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID
    }
  }
};
