/** @type {import('next').NextConfig} */

// GitHub Pages serves project sites from /<repo>. The deploy workflow sets
// NEXT_PUBLIC_BASE_PATH automatically; locally it stays empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
