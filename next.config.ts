import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Cache weather API responses
        urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "weather-api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 30, // 30 minutes
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        // Cache geocoding API responses longer
        urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "geocoding-cache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
          },
        },
      },
      {
        // Cache Google Fonts
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-cache",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      {
        // Cache images
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "image-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        // Cache JS and CSS
        urlPattern: /\.(?:js|css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Add empty turbopack config to silence the warning about webpack config
  // The PWA plugin adds webpack config, but we use Turbopack in dev
  turbopack: {},
};

export default withPWA(nextConfig);
