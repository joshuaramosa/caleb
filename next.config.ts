import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Las fotos de comprobante Yape desde teléfono superan el 1MB por defecto.
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vrcdyfbuhphelwebxdbz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "restopolloybrostercaleb1.apiworking.co",
        pathname: "/archivos/**",
      },
    ],
  },
};

export default nextConfig;