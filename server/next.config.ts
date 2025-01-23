// filepath: /Users/jtwellspring/repos/Streamline-app/server/next.config.ts
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../server/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../server/server.crt')),
    },
  },
};

export default nextConfig;