/** @type {import('next').NextConfig} */

const repository = "ValoStore_web";

const nextConfig = {
  basePath: '/ValoStore_web',
  reactStrictMode: true,
  images: {
    domains: ["media.valorant-api.com"],
  },
};

module.exports = nextConfig;
