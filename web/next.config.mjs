import { withSentryConfig } from '@sentry/nextjs'
import withPWAInit from 'next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/todaatividade\.com\.br\/$/,
      handler: 'NetworkFirst',
      options: { cacheName: 'homepage', expiration: { maxEntries: 1, maxAgeSeconds: 86400 } },
    },
    {
      urlPattern: /^https:\/\/todaatividade\.com\.br\/atividades/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'catalog', expiration: { maxEntries: 50, maxAgeSeconds: 3600 } },
    },
    {
      urlPattern: /^https:\/\/todaatividade\.com\.br\/blog/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'blog', expiration: { maxEntries: 30, maxAgeSeconds: 3600 } },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'images', expiration: { maxEntries: 200, maxAgeSeconds: 604800 } },
    },
    {
      urlPattern: /\.(?:js|css|woff|woff2)$/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-assets', expiration: { maxEntries: 100, maxAgeSeconds: 86400 } },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'pub-*.r2.dev' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'graph.facebook.com' },
    ],
  },
}

const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
}

const configWithPWA = withPWA(nextConfig)

export default process.env.SENTRY_ORG
  ? withSentryConfig(configWithPWA, sentryOptions)
  : configWithPWA
