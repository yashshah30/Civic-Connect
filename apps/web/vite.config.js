import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

  // Determine API base URL based on environment:
  // - Production (Vercel build): Always use Render backend URL
  //   (safeguards against accidental localhost URLs in build environment)
  // - Development (local `npm run dev`): Defaults to http://localhost:5000
  let apiUrl = env.VITE_API_URL

  if (isProduction) {
    if (!apiUrl || apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
      apiUrl = 'https://civic-connect-backend-6i78.onrender.com'
    }
  } else {
    if (!apiUrl) {
      apiUrl = 'http://localhost:5000'
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  }
})
