export default {
  expo: {
    name: "OrgShift Quiz",
    slug: "orgshift-quiz",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#4f46e5"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4f46e5"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      supabaseUrl: "https://fvdofdqzfxccbutsyjxh.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZG9mZHF6ZnhjY2J1dHN5anhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTEwMTgsImV4cCI6MjA3MDQyNzAxOH0.xhPmLLweqsRwV25WmFxvtu6KUkXFH_8pOtGQ-rvXbAI"
    }
  }
};
