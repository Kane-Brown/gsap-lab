import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// GitHub Pages 是项目页,线上地址带 /gsap-lab/ 前缀;本地开发仍用根路径。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/gsap-lab/' : '/',
  plugins: [vue()],
}))
