import type { NextConfig } from "next";
import dupeRedirects from './data/redirect-map-dupes.json' with { type: 'json' };

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
  // CSP is handled by middleware with per-request nonce — do NOT set static CSP here
  // (static CSP without nonce blocks Next.js inline scripts)
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "givukaorkjkksslrzuum.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Old site: numeric recipe IDs → homepage
      {
        source: '/recipe/:id(\\d+)',
        destination: '/',
        permanent: true, // 301
      },
      // Old site: www → non-www (Vercel handles this, but explicit for clarity)
      // Common old slugs → new slugs (most impactful 404s from GSC)
      {
        source: '/recipe/koobideh',
        destination: '/recipe/kabab-koobideh-kebab',
        permanent: true,
      },
      {
        source: '/recipe/ash-reshteh',
        destination: '/recipe/ash-reshteh-soup',
        permanent: true,
      },
      {
        source: '/recipe/kuku-ye-shevid',
        destination: '/recipe/kuku-shevid-persian-dill-frittata',
        permanent: true,
      },
      {
        source: '/recipe/soup-e-balal-corn-soup',
        destination: '/recipe/soup-e-balal-creamy-corn-soup',
        permanent: true,
      },
      {
        source: '/recipe/qalieh-kadu-halvaee',
        destination: '/recipe/qalieh-kadu-halvaee-pumpkin-stew',
        permanent: true,
      },
      {
        source: '/recipe/luqmeh-goushti-lavash-meat-morsels',
        destination: '/recipe/luqmeh-goushti-persian-meat-morsels',
        permanent: true,
      },
      // Auto-generated duplicate redirects
      ...dupeRedirects.map((r: { from: string; to: string }) => ({
        source: r.from,
        destination: r.to,
        permanent: true as const,
      })),
    ];
  },
};

export default nextConfig;
