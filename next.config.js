const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Handle Edge Runtime specific configurations
    if (nextRuntime === 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Polyfill crypto for Edge Runtime
        crypto: false,
      };
      
      // Ignore problematic modules in Edge Runtime
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(@clerk\/shared\/devBrowser|punycode)$/,
        })
      );
    }
    
    return config;
  },
};

module.exports = nextConfig;
