import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 1. Mandatory for Amplify SSR to package the server code
    output: 'standalone',

    // 2. Optional: If your /recipes page uses <Image /> components,
    // adding this can prevent 404s/500s related to image optimization
    // if the server environment is missing dependencies like 'sharp'.
    images: {
        unoptimized: true,
    },
    env: {
        DATABASE_URL: process.env.DATABASE_URL,
    },
};

export default nextConfig;
