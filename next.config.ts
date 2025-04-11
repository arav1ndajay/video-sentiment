/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const nextConfig = {
  // Configure external images from YouTube
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  serverExternalPackages: ['@distube/ytdl-core'],
  // Experimental features
  experimental: {
    // These packages will be processed on the server only
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Add necessary Node.js polyfills for browser environment
  webpack: (config: { plugins: any[]; resolve: { fallback: any; alias: any; }; }, { isServer }: any) => {
    if (!isServer) {
      // Apply node polyfills plugin
      config.plugins.push(new NodePolyfillPlugin());
      
      // Provide polyfills for specific modules
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
      
      // Add fallbacks for Node.js core modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Handle node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:assert': 'assert',
        'node:buffer': 'buffer',
        'node:crypto': 'crypto-browserify',
        'node:events': 'events',
        'node:http': 'stream-http',
        'node:https': 'https-browserify',
        'node:os': 'os-browserify/browser',
        'node:path': 'path-browserify',
        'node:querystring': 'querystring-es3',
        'node:stream': 'stream-browserify',
        'node:string_decoder': 'string_decoder',
        'node:url': 'url',
        'node:util': 'util',
        'node:zlib': 'browserify-zlib',
      };
    }
    return config;
  },
};

module.exports = nextConfig;