# gsap-lab

GSAP 动画沙盒 —— 试手感、攒移动端 H5 效果(抽奖 / 红包 / 里程碑…)。

## 开发

```bash
pnpm install
pnpm dev            # 本机预览
pnpm dev --host     # 手机扫码真机调试(抽奖/红包真机手感才准)
pnpm build          # 类型检查 + 构建
```

## 加一个新效果

在 `src/demos/` 下新建文件夹即可,**首页和路由自动出现**,无需手动注册:

```
src/demos/my-effect/
├─ index.vue      # 效果组件(必需)
└─ meta.ts        # 标题/说明/状态/图标(可选)
```

`meta.ts` 示例:

```ts
import type { DemoMeta } from '../../registry'
export default {
  title: '我的效果',
  desc: '一句话说明',
  status: 'done', // 'done' 已实现 | 'todo' 占位
  icon: '✨',
} satisfies DemoMeta
```

## 现有效果

- ✅ `grid-lottery` 九宫格抽奖(完整,可参考其 GSAP 写法)
- 🚧 `wheel-lottery` 转盘抽奖(占位)
- 🚧 `red-packet` 抢/拆红包(占位)
- 🚧 `milestone` 里程碑进度(占位)

> 想实现哪个占位效果,直接对我说「做 xxx」即可。

## GSAP Skills(可选,提升 AI 写动画的质量)

让 Claude Code 写 GSAP 时更准:

```
/plugin marketplace add greensock/gsap-skills
```

设计文档见 `docs/2026-06-06-gsap-lab-design.md`。
