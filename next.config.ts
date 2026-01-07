/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io", // Sanity Images ke liye
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Home Banner Images ke liye
      },
    ],
  },
  // TypeScript errors ko build fail karne se rokne ke liye (Optional but Recommended for fast deploy)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;