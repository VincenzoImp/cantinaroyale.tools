/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.elrond.com",
      },
      {
        protocol: "https",
        hostname: "tools.multiversx.com",
      },
    ],
  },
};

export default nextConfig;
