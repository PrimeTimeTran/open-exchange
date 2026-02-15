/** @type {import('next').NextConfig} */

const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: `./.env.test` });
}

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, context) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    // Fix for AWS SDK v3 critical dependency warning
    config.resolve.alias = {
      ...config.resolve.alias,
      'aws-crt': false,
    };
    return config;
  },
};

module.exports = nextConfig;
