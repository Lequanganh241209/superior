/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Explicitly pass the token to the runtime
    VERCEL_ACCESS_TOKEN: process.env.VERCEL_ACCESS_TOKEN,
  },
};

export default nextConfig;
