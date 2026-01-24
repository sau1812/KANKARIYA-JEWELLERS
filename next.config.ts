/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Ye development me images fast load karega (bina optimize kiye)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com", // ✅ Ye zaroori hai Unsplash ke liye
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;