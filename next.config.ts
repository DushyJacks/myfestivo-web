import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
]

const nextConfig: NextConfig = {
  compress: true,
  // These packages use native bindings or ESM internals — let Node.js load them
  // directly instead of having Next.js bundle them through webpack.
  serverExternalPackages: ["firebase-admin"],

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800, // 7 days
    remotePatterns: [
      {
        // Google account profile photos (used when signing in with Google)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // Google user content (alternate Google avatar CDN)
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },

  async headers() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/(.*)",
          headers: [
            ...securityHeaders,
            { key: "Cache-Control", value: "no-store, must-revalidate" },
          ],
        },
      ]
    }

    return [
      {
        source: "/(.*)",
        headers: [
          ...securityHeaders,
          // Cache static assets aggressively in production
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Don't cache HTML pages — let Next.js handle it
        source: "/:path((?!_next/static|_next/image|favicon|logo).*)",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ]
  },
}

export default nextConfig;
