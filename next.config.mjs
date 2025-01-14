/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
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
