import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/interdimensional-ecology-observatory/',
  // 允許本次 Google Colab 預覽主機
  server: {
    allowedHosts: ['m-s-ase1a7-3iup0frp6mrqc.asia-east1-a.c.codatalab-user-runtimes.internal'],
  },
  plugins: [react()],
})
