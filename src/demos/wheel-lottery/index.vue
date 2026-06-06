<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

const prizes = [
  { name: '5元红包', icon: '🧧', color: '#ff6b6b' },
  { name: '谢谢参与', icon: '🙇', color: '#ffd86b' },
  { name: '100积分', icon: '⭐', color: '#6bd5ff' },
  { name: '8折券', icon: '🎟️', color: '#a78bfa' },
  { name: '再来一次', icon: '🔁', color: '#5eead4' },
  { name: '谢谢参与', icon: '🙇', color: '#fca5a5' },
  { name: '1元红包', icon: '🧧', color: '#fbbf24' },
  { name: '神秘大奖', icon: '🎁', color: '#f472b6' },
]
const N = prizes.length
const SEG = 360 / N // 每个扇区角度
const ROUNDS = 5 // 每次至少转 5 整圈
const RADIUS = 96 // 文字到圆心距离(px)

const spinning = ref(false)
const result = ref<(typeof prizes)[number] | null>(null)

const wheelEl = ref<HTMLElement>()
const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined
let currentRotation = 0

// 用 conic-gradient 画 N 个彩色扇区(0deg 在顶部,顺时针)
const wheelBg = computed(() => {
  const stops = prizes
    .map((p, i) => `${p.color} ${i * SEG}deg ${(i + 1) * SEG}deg`)
    .join(', ')
  return `conic-gradient(from 0deg, ${stops})`
})

// 扇区 i 的标签位置:中心角 = i*SEG + SEG/2,0deg 在顶部
function labelStyle(i: number) {
  const center = (i * SEG + SEG / 2) * (Math.PI / 180)
  const x = Math.sin(center) * RADIUS
  const y = -Math.cos(center) * RADIUS
  return { transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }
}

onMounted(() => {
  ctx = gsap.context(() => {}, root.value)
})
onUnmounted(() => ctx?.revert())

function spin() {
  if (spinning.value) return
  spinning.value = true
  result.value = null

  // 1) 先定结果(真实业务换成后端返回的中奖下标)
  const target = Math.floor(Math.random() * N)

  // 2) 求终止角度:转 ROUNDS 整圈后,让 target 扇区中心对准顶部指针
  //    R ≡ -(target*SEG + SEG/2) (mod 360)
  const desiredMod = ((360 - (target * SEG + SEG / 2)) % 360 + 360) % 360
  const curMod = ((currentRotation % 360) + 360) % 360
  const delta = ROUNDS * 360 + (((desiredMod - curMod) % 360) + 360) % 360
  // 扇区内 ±0.30 的小抖动,落点更自然但仍在该扇区
  const jitter = (Math.random() * 2 - 1) * SEG * 0.3
  const final = currentRotation + delta + jitter

  // 3) 连续旋转 + power4.out 自然减速(连续旋转无整数步进,不会卡顿)
  ctx!.add(() => {
    gsap.to(wheelEl.value!, {
      rotation: final,
      duration: 4.2,
      ease: 'power4.out',
      onComplete() {
        currentRotation = final
        result.value = prizes[target]
        spinning.value = false
      },
    })
  })
}
</script>

<template>
  <div ref="root" class="wheel-demo">
    <div class="wheel-wrap">
      <!-- 顶部指针 -->
      <div class="pointer"></div>

      <!-- 转盘 -->
      <div ref="wheelEl" class="wheel" :style="{ background: wheelBg }">
        <!-- 扇区分隔线 -->
        <div
          v-for="i in N"
          :key="'line' + i"
          class="divider"
          :style="{ transform: `rotate(${(i - 1) * SEG}deg)` }"
        ></div>
        <!-- 奖品标签 -->
        <div v-for="(p, i) in prizes" :key="i" class="label" :style="labelStyle(i)">
          <span class="label__icon">{{ p.icon }}</span>
          <span class="label__name">{{ p.name }}</span>
        </div>
      </div>

      <!-- 中心抽奖按钮 -->
      <button class="hub" :disabled="spinning" @click="spin">
        {{ spinning ? '…' : '抽奖' }}
      </button>
    </div>

    <p class="result">
      <template v-if="result">🎉 抽中:{{ result.icon }} {{ result.name }}</template>
      <template v-else-if="spinning">　</template>
      <template v-else>点击中间「抽奖」开始</template>
    </p>
  </div>
</template>

<style scoped>
.wheel-demo {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 24px;
}
.wheel-wrap {
  position: relative;
  width: 280px;
  height: 280px;
}
.wheel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 8px solid #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), inset 0 0 0 3px rgba(0, 0, 0, 0.06);
  will-change: transform;
}
.divider {
  position: absolute;
  left: 50%;
  top: 0;
  width: 1px;
  height: 50%;
  background: rgba(255, 255, 255, 0.55);
  transform-origin: bottom center;
}
.label {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 64px;
  text-align: center;
  pointer-events: none;
  color: #5a2a12;
}
.label__icon {
  font-size: 22px;
}
.label__name {
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 13px solid transparent;
  border-right: 13px solid transparent;
  border-top: 22px solid #ef4444;
  z-index: 3;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}
.hub {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 4px solid #fff;
  z-index: 2;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.45);
  cursor: pointer;
}
.hub:disabled {
  cursor: default;
  filter: saturate(0.7) brightness(0.95);
}
.hub:not(:disabled):active {
  transform: translate(-50%, -50%) scale(0.93);
}
.result {
  font-size: 16px;
  font-weight: 600;
  min-height: 22px;
}
</style>
