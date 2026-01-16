/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // DISABLED FOR VERCEL
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
