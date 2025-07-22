/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["mcoamsifdvhsrkubniax.supabase.co"],
  },
};

module.exports = nextConfig;
