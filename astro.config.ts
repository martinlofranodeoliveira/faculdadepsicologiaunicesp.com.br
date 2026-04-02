import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import react from '@astrojs/react'

function repairPotentialMojibake(value: string): string {
  const decoded = Buffer.from(value, 'latin1').toString('utf8')
  return decoded.includes('\uFFFD') ? value : decoded
}

function encodeHeaderAsUtf8Bytes(value: string): string {
  return Buffer.from(value, 'utf8').toString('latin1')
}

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  site: process.env.SITE_URL || 'https://faculdadepsicologia.com.br',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [react()],
  devToolbar: {
    enabled: false,
  },
  server: {
    host: true,
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
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
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const authHeader = req.headers.authorization
              if (typeof authHeader !== 'string' || !authHeader) return

              const repaired = repairPotentialMojibake(authHeader)
              const encoded = encodeHeaderAsUtf8Bytes(repaired)
              proxyReq.setHeader('Authorization', encoded)
            })
          },
        },
        '/fasul-courses-api': {
          target: 'https://www.fasuleducacional.edu.br',
          changeOrigin: true,
          secure: true,
          rewrite: (requestPath) => requestPath.replace(/^\/fasul-courses-api/, ''),
        },
      },
    },
  },
})
