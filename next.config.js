/** @type {import('next').NextConfig} */

const repository = "ValoStore_web";

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["media.valorant-api.com"],
  },
};

module.exports = nextConfig;
