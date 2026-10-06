
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function inlineCssPlugin() {
  return {
    name: 'inline-css-plugin',
    apply: 'build',
    enforce: 'post',
    generateBundle(options, bundle) {
      let cssContent = '';
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && asset.type === 'asset') {
          cssContent += asset.source + '\n';
          delete bundle[fileName];
        }
      }
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (fileName === 'index.html' && asset.type === 'asset') {
          asset.source = asset.source.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '');
          asset.source = asset.source.replace('</head>', `<style>${cssContent}</style></head>`);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production';
  return {
    plugins: [react(), tailwindcss(), inlineCssPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      DELCOM_BASEURL: JSON.stringify(env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1'),
    },

    build: {
      target: 'es2020',
      cssCodeSplit: false,
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
      },
    },
  }
})