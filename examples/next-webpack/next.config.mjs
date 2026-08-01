// import { withStyleThis } from '@style-this/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return config;
  },
};

// Temporarily disable style-this due to transformer issues
// export default withStyleThis(nextConfig);
export default nextConfig;
