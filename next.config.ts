import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    SECRET_KEY: process.env.SECRET_KEY,
    APP_ID: process.env.APP_ID,
    BASE_URL: process.env.BASE_URL,
  },
};

export default nextConfig;
