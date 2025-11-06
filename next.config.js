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
  async redirects() {
    return [
      // Redirect removed AI Voiceover tool to Speech Generation
      {
        source: '/dashboard/speech',
        has: [
          {
            type: 'query',
            key: 'toolId',
            value: 'video-voiceover',
          },
        ],
        destination: '/dashboard/speech?toolId=speech-generation',
        permanent: true,
      },
      // Redirect removed Melody Maker tool to Speech Generation
      {
        source: '/dashboard/speech',
        has: [
          {
            type: 'query',
            key: 'toolId',
            value: 'voice-melody',
          },
        ],
        destination: '/dashboard/speech?toolId=speech-generation',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
