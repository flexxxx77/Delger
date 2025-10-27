// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ESLint алдааг build үед алгасна (lint-ээ дараа нь засна)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript-ийн type error-уудыг build дээр алгасна
  // (DEV үед хэвийн шалгагдсаар байна)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Turbopack default — тусгай тохируулга хэрэггүй.
  // Хэрэв images ашигладаг бол доорхийг нээгээд domains нэмээрэй.
  // images: {
  //   remotePatterns: [
  //     { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
  //   ],
  // },
};

export default nextConfig;
