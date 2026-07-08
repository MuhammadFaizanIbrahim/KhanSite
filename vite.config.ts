import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Extensions the preloader knows how to wait on, mapped to how it should be loaded
const ASSET_EXT: Record<string, 'image' | 'video'> = {
  '.png': 'image', '.jpg': 'image', '.jpeg': 'image', '.webp': 'image', '.avif': 'image', '.gif': 'image',
  '.mp4': 'video', '.webm': 'video', '.mov': 'video',
}

// Recursively walks public/images and public/videos so the preloader's asset
// list always matches whatever files actually exist — no manual list to update.
function scanPublicAssets(publicDir: string): { url: string; type: 'image' | 'video' }[] {
  const assets: { url: string; type: 'image' | 'video' }[] = []

  const walk = (dir: string, urlPrefix: string) => {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath, `${urlPrefix}/${entry.name}`)
      } else {
        const type = ASSET_EXT[path.extname(entry.name).toLowerCase()]
        if (type) {
          const url = `${urlPrefix}/${entry.name}`.split('/').map(encodeURIComponent).join('/')
          assets.push({ url, type })
        }
      }
    }
  }

  walk(path.join(publicDir, 'images'), '/images')
  walk(path.join(publicDir, 'videos'), '/videos')
  return assets
}

// Serves/emits asset-manifest.json listing every image & video under public/,
// so the preloader can discover and wait on all of them automatically.
function assetManifestPlugin(): Plugin {
  const publicDir = path.resolve(__dirname, 'public')
  return {
    name: 'asset-manifest',
    configureServer(server) {
      server.middlewares.use('/asset-manifest.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(scanPublicAssets(publicDir)))
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'asset-manifest.json',
        source: JSON.stringify(scanPublicAssets(publicDir)),
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), assetManifestPlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
