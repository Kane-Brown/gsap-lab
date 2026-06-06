import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import DemoView from './pages/DemoView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Home },
  { path: '/demo/:name', name: 'demo', component: DemoView, props: true },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
