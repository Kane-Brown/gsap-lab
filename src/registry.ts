// 自动扫描 demos/ 目录:加新效果 = 在 demos/ 下丢一个文件夹(含 index.vue),
// 首页与路由会自动出现,无需在任何地方手动注册。
import type { Component } from 'vue'

export type DemoStatus = 'done' | 'todo'

export interface DemoMeta {
  /** 卡片标题,如 "九宫格抽奖" */
  title: string
  /** 一句话说明 */
  desc?: string
  /** done = 已实现可玩;todo = 占位骨架 */
  status?: DemoStatus
  /** emoji 图标,纯装饰 */
  icon?: string
}

export interface DemoEntry extends DemoMeta {
  /** 路由名 / 路径片段,来自文件夹名,如 "grid-lottery" */
  name: string
  /** 异步加载的 demo 组件 */
  component: () => Promise<Component>
}

// 懒加载每个 demo 的 index.vue
const components = import.meta.glob('./demos/*/index.vue') as Record<
  string,
  () => Promise<{ default: Component }>
>

// 立即加载每个 demo 的 meta.ts(可选)
const metas = import.meta.glob('./demos/*/meta.ts', { eager: true }) as Record<
  string,
  { default?: DemoMeta } & DemoMeta
>

function folderName(path: string): string {
  // './demos/grid-lottery/index.vue' -> 'grid-lottery'
  return path.split('/')[2]
}

function humanize(name: string): string {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export const demos: DemoEntry[] = Object.keys(components)
  .map((path) => {
    const name = folderName(path)
    const metaMod = metas[`./demos/${name}/meta.ts`]
    const meta: DemoMeta = (metaMod?.default ?? metaMod ?? {}) as DemoMeta
    return {
      name,
      title: meta.title ?? humanize(name),
      desc: meta.desc,
      status: meta.status ?? 'todo',
      icon: meta.icon ?? '✨',
      component: () => components[path]().then((m) => m.default),
    }
  })
  // 已实现的排前面,其余按名称稳定排序
  .sort((a, b) => {
    if (a.status !== b.status) return a.status === 'done' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

export function findDemo(name: string): DemoEntry | undefined {
  return demos.find((d) => d.name === name)
}
