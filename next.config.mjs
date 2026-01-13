/** @type {import('next').NextConfig} */
const nextConfig = {
  // FORCE VERCEL BUILD: Manual Redeploy Trigger 004
  output: "standalone", // REQUIRED FOR DOCKER / GOOGLE CLOUD RUN
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
