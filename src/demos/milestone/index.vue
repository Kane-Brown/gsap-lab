<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MAX = 2000
// 阈值与其在进度条上的位置(节点非线性,但视觉上均匀分布,移动端更好看)
const stops = [0, 200, 500, 1000, 2000]
const posOf = [0, 25, 50, 75, 100]
const nodes = [
  { value: 200, pos: 25, label: '新人礼', icon: '🎁' },
  { value: 500, pos: 50, label: '8折券', icon: '🎟️' },
  { value: 1000, pos: 75, label: '会员勋章', icon: '🏅' },
  { value: 2000, pos: 100, label: '专属客服', icon: '💎' },
]

const display = ref(0) // 滚动显示的成长值
const fillPct = ref(0) // 进度条填充百分比
const unlocked = ref(nodes.map(() => false))

const root = ref<HTMLElement>()
const cardEl = ref<HTMLElement>()
const nodeEls = ref<HTMLElement[]>([])
function setNodeRef(el: unknown, i: number) {
  if (el) nodeEls.value[i] = el as HTMLElement
}

let ctx: gsap.Context | undefined
let fillTween: gsap.core.Tween | undefined
let currentVal = 0

// 成长值 -> 进度条百分比(分段线性,落在相邻节点之间)
function valueToPct(v: number) {
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i]) {
      const t = (v - stops[i - 1]) / (stops[i] - stops[i - 1])
      return posOf[i - 1] + t * (posOf[i] - posOf[i - 1])
    }
  }
  return 100
}

function fillTo(target: number) {
  target = Math.min(MAX, Math.max(0, target))
  const obj = { v: currentVal }
  fillTween?.kill()
  fillTween = gsap.to(obj, {
    v: target,
    duration: 1.1,
    ease: 'power2.out',
    onUpdate() {
      display.value = Math.round(obj.v) // 数字滚动
      fillPct.value = valueToPct(obj.v) // 进度条填充
      // 越过阈值的节点逐个点亮
      nodes.forEach((n, i) => {
        if (!unlocked.value[i] && obj.v >= n.value) {
          unlocked.value[i] = true
          popNode(i)
        }
      })
    },
    onComplete() {
      currentVal = target
    },
  })
}

// 节点点亮的庆祝动效:圆点弹一下 + 奖励图标蹦出
function popNode(i: number) {
  const el = nodeEls.value[i]
  if (!el) return
  const dot = el.querySelector('.node__dot')
  const icon = el.querySelector('.node__icon')
  if (dot) gsap.fromTo(dot, { scale: 1 }, { scale: 1.5, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' })
  if (icon)
    gsap.fromTo(
      icon,
      { scale: 0, y: 8, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.45, ease: 'back.out(2.5)' },
    )
}

function addProgress() {
  fillTo(currentVal + 400)
}

function reset() {
  fillTween?.kill()
  currentVal = 0
  display.value = 0
  fillPct.value = 0
  unlocked.value = nodes.map(() => false)
  // 清掉图标上 gsap 留下的内联 transform,交回 CSS(未解锁 -> 隐藏)
  nodeEls.value.forEach((el) => {
    const ic = el?.querySelector('.node__icon')
    if (ic) gsap.set(ic, { clearProps: 'all' })
  })
}

onMounted(() => {
  ctx = gsap.context(() => {
    // 卡片滚动进入视口才开始填充(once:只播一次)
    ScrollTrigger.create({
      trigger: cardEl.value,
      start: 'top 78%',
      once: true,
      onEnter: () => fillTo(650),
    })
    ScrollTrigger.refresh()
  }, root.value)
})

onUnmounted(() => {
  fillTween?.kill()
  ctx?.revert() // 连同 ScrollTrigger 一起清理
})
</script>

<template>
  <div ref="root" class="ms">
    <section class="intro">
      <h2 class="intro__title">会员成长里程碑</h2>
      <p class="intro__sub">累计成长值,解锁专属权益</p>
      <div class="intro__hint">↓ 下滑查看进度</div>
    </section>

    <section ref="cardEl" class="card">
      <div class="head">
        <div class="head__val"><b>{{ display }}</b><span> / {{ MAX }}</span></div>
        <div class="head__label">当前成长值</div>
      </div>

      <div class="track">
        <div class="track__bg"></div>
        <div class="track__fill" :style="{ width: fillPct + '%' }"></div>
        <div class="track__glow" :style="{ left: fillPct + '%' }"></div>

        <div
          v-for="(n, i) in nodes"
          :key="i"
          class="node"
          :class="{ unlocked: unlocked[i] }"
          :style="{ left: n.pos + '%' }"
          :ref="(el) => setNodeRef(el, i)"
        >
          <div class="node__icon">{{ n.icon }}</div>
          <div class="node__dot"></div>
          <div class="node__meta">
            <div class="node__value">{{ n.value }}</div>
            <div class="node__name">{{ n.label }}</div>
          </div>
        </div>
      </div>

      <div class="controls">
        <button class="btn" @click="addProgress">累计 +400</button>
        <button class="btn ghost" @click="reset">重置</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ms {
  flex: 1;
  width: 100%;
}
.intro {
  min-height: 72vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 24px;
}
.intro__title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}
.intro__sub {
  margin: 0;
  color: var(--muted);
}
.intro__hint {
  margin-top: 20px;
  color: var(--muted);
  font-size: 13px;
  animation: bob 1.4s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(6px); opacity: 1; }
}

.card {
  margin: 0 16px 48px;
  padding: 22px 20px 24px;
  border-radius: 20px;
  background: var(--card);
  border: 1px solid var(--border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}
.head {
  text-align: center;
  margin-bottom: 8px;
}
.head__val {
  font-variant-numeric: tabular-nums;
  font-size: 16px;
  color: var(--muted);
}
.head__val b {
  font-size: 34px;
  color: #f59e0b;
  font-weight: 800;
}
.head__label {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

.track {
  position: relative;
  height: 8px;
  margin: 64px 26px 72px;
  border-radius: 999px;
}
.track__bg {
  position: absolute;
  inset: 0;
  background: var(--border);
  border-radius: inherit;
}
.track__fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #f59e0b, #22c55e);
}
.track__glow {
  position: absolute;
  top: 50%;
  left: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.35), 0 0 12px rgba(34, 197, 94, 0.6);
}

.node {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}
.node__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--border);
  border: 3px solid var(--card);
  box-shadow: 0 0 0 1px var(--border);
}
.node.unlocked .node__dot {
  background: #f59e0b;
  box-shadow: 0 0 0 1px #f59e0b, 0 0 10px rgba(245, 158, 11, 0.6);
}
.node__icon {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  opacity: 0; /* 未解锁隐藏,解锁时由 gsap 蹦出 */
}
.node.unlocked .node__icon {
  opacity: 1;
}
.node__meta {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  text-align: center;
}
.node__value {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.node.unlocked .node__value {
  color: #f59e0b;
}
.node__name {
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
}

.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
}
.btn {
  border: 0;
  padding: 11px 24px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #f59e0b, #22c55e);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
  cursor: pointer;
}
.btn:active {
  transform: scale(0.96);
}
.btn.ghost {
  color: var(--muted);
  background: transparent;
  border: 1px solid var(--border);
  box-shadow: none;
}
</style>
