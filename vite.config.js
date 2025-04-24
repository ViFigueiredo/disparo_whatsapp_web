import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const config = defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000
  }
})
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
})
