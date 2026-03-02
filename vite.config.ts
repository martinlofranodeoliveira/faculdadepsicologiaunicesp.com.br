import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2018',
    sourcemap: false,
    minify: 'terser',
    cssMinify: 'lightningcss',
    terserOptions: {
      compress: {
        passes: 2,
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
  },
  server: {
    proxy: {
      '/crm-api': {
        target: 'https://crmfasul.com.br',
        changeOrigin: true,
        secure: true,
        rewrite: (requestPath) => requestPath.replace(/^\/crm-api/, '/api'),
      },
      '/fasul-courses-api': {
        target: 'https://www.fasuleducacional.edu.br',
        changeOrigin: true,
        secure: true,
        rewrite: (requestPath) => requestPath.replace(/^\/fasul-courses-api/, ''),
      },
    },
  },
})
