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
        primary: '#e66200', // CTA / brand highlight
        muted: '#c6c6cd', // disabled/inactive background
        danger: '#ff0000', // error
        success: '#5cb85c', // success
        warning: '#eed202', // warning
      },
    },
  },
  plugins: [],
}

export default config
