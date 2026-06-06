import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import DemoView from './pages/DemoView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Home },
  { path: '/demo/:name', name: 'demo', component: DemoView, props: true },
]

export const router = createRouter({
  // 用 Vite 的 BASE_URL,本地是 '/',线上 Pages 是 '/gsap-lab/'
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
