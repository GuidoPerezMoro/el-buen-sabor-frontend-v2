import type {NextConfig} from 'next'
import {NextConfig as BaseNextConfig} from 'next'
import {Configuration} from 'webpack'

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  webpack(config: Configuration) {
    config.module?.rules?.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

export default nextConfig as BaseNextConfig
