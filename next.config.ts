import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* ============================================
     NEXT.JS CONFIGURATION
     ============================================ */


  // Keep workspace resolution local when parent directories have lockfiles.
  turbopack: {
    root: __dirname,
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      // Allow loading images from Supabase Storage (game assets, product images, avatars)
      {
        protocol: "https",
        hostname: "pcbxvswjcjdmelwznarp.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Performance optimizations
  productionBrowserSourceMaps: false,

  experimental: {
    // optimizeCss: true — disabled: critters doesn't work with React 19 data-precedence stylesheets
    // (confirmed: no critical CSS is being inlined despite the flag being active)

    // Enable optimized package imports to reduce barrel-file bundle bloat
    optimizePackageImports: [
      "react-icons",
      "lucide-react",
      "motion",
      "gsap",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-tabs",
    ],
  },

  // Compiler options - SWC configuration for modern browsers
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Webpack configuration to COMPLETELY exclude legacy polyfills
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Alias all polyfill packages to false (exclude them completely)
      config.resolve.alias = {
        ...config.resolve.alias,
        // Core polyfills
        "core-js": false,
        "core-js-pure": false,
        "regenerator-runtime": false,
        "@babel/runtime": false,
        "@babel/runtime-corejs3": false,
        // Next.js internal polyfills
        "next/dist/compiled/@babel/runtime": false,
        "next/dist/compiled/regenerator-runtime": false,
      };

      // Remove polyfill plugins from webpack
      config.plugins = config.plugins?.filter((plugin: any) => {
        return plugin.constructor.name !== "ProvidePlugin";
      });
    }
    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
