import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: __dirname,
  base: '/causal-loop-analyzer/',
  plugins: [react(), tailwindcss()],
})
