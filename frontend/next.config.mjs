/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  devIndicators: false,
  allowedDevOrigins: [
    '192.168.20.2',
    '*.loca.lt',
    '*.ngrok-free.app',
    '*.ngrok.io',
    '*.trycloudflare.com',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
