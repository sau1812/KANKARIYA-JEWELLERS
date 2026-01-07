/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io", // Sanity Images
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Banner Images
      },
    ],
  },
  // TypeScript errors ignore karne ke liye (Ye abhi bhi valid hai)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;