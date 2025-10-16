import type {Config} from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9f9f9', // app background (dominant)
        text: '#0f0f0f', // default text
        primary: '#0000ff', // CTA / brand highlight
        primaryHover: '#0000cc',
        muted: '#c6c6cd', // disabled/inactive background
        danger: '#ff0000', // errors / danger zone
        dangerHover: '#cc0000',
        success: '#5cb85c', // success
        warning: '#eed202', // warnings
        surface: '#e5e7eb', // secondary buttons
        surfaceHover: '#d1d5db',
      },
    },
  },
  plugins: [],
}

export default config
