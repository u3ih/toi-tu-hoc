/** @type {import('next').NextConfig} */

// GitHub Pages serves project sites from /<repo>. The deploy workflow sets
// NEXT_PUBLIC_BASE_PATH automatically; locally it stays empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    // Tailwind output is small (~13 KiB), so shipping it in a <style> tag beats
    // a render-blocking <link> round trip. Production builds only.
    inlineCss: true,
  },
}

export default nextConfig
