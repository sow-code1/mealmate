import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true,
    },
    env: {
        DATABASE_URL: process.env.DATABASE_URL,
    },
    turbopack: {
        root: __dirname,
    },
};

export default nextConfig;