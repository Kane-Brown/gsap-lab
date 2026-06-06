# gsap-lab 设计文档

> 日期:2026-06-06 · 状态:已实现(种子 demo 完成)

## 目标

一个**轻量沙盒**,用来试 GSAP 手感、持续积累移动端 H5 动画效果 demo(抽奖、抢/拆红包、里程碑进度等),调好的效果以后可手动搬进真实业务项目(`vant-nuxt-v1` 等)。不追求复用规范,不含后端/接口。

## 技术栈

- Vite + Vue3 + TypeScript
- vue-router(首页列表 → 单个 demo)
- GSAP 3
- 移动端优先预览(viewport 锁定,`pnpm dev --host` 可真机调试)

## 架构

```
src/
├─ demos/<name>/          每个效果一个文件夹,自包含
│  ├─ index.vue           效果组件(必需)
│  └─ meta.ts             标题/说明/状态/图标(可选)
├─ registry.ts            import.meta.glob 自动扫描 demos/
├─ pages/Home.vue         移动端卡片列表
├─ pages/DemoView.vue     带返回栏的 demo 容器
├─ components/Placeholder.vue  占位骨架(写明计划用到的 GSAP 思路)
├─ router.ts              /  与  /demo/:name
└─ main.ts
```

### 自动注册机制(沙盒的核心)

`registry.ts` 用 `import.meta.glob('./demos/*/index.vue')` 懒加载组件,
`import.meta.glob('./demos/*/meta.ts', { eager: true })` 读取可选元信息。
**加新效果 = 在 `demos/` 下新建文件夹放 `index.vue`,首页和路由自动出现**,
无需改任何注册代码。每个 demo 组件代码分割,互不影响。

## 内容范围

| 效果 | 状态 | 说明 |
| --- | --- | --- |
| 九宫格抽奖 `grid-lottery` | ✅ 完整 | 高亮绕外圈,`power3.out` 减速精准停在中奖项;`gsap.context` 卸载清理 |
| 转盘抽奖 `wheel-lottery` | 🚧 占位 | 计划:旋转减速 + 目标角度计算 |
| 抢/拆红包 `red-packet` | 🚧 占位 | 计划:抖动 + 拆开 timeline + 金币 stagger + MotionPath |
| 里程碑进度 `milestone` | 🚧 占位 | 计划:数字滚动 + 进度条 + ScrollTrigger |

## 关键实现要点(九宫格)

1. 先定结果(`target`),再让高亮多绕几圈停在目标:`finalSteps = rounds*8 + target`。
   真实业务里 `target` 换成后端返回的中奖下标。
2. 用一个数值补间 `{v:0}→finalSteps` 驱动高亮,`onUpdate` 取 `floor(v)%8`,
   `power3.out` 缓动天然"先快后慢"。
3. `onComplete` 把 `activeIndex` 对齐到 `target`,消除浮点误差。
4. 外圈位置 0..7 顺时针映射到 3×3 行优先格 `[0,1,2,5,8,7,6,3]`,中心格为按钮。
5. Vue3 清理:`gsap.context(scope)` + `onUnmounted` 时 `revert()`。

## 非目标(YAGNI)

后端、接口对接、状态管理、构建优化、单元测试框架 —— 沙盒阶段都不做。
