/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to allow dynamic server-side rendering for API calls
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.externals.push({ canvas: 'commonjs canvas' });
    return config;
  },
};

export default nextConfig;
