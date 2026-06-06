<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

// 8 个奖品,按九宫格外圈顺时针排列(0 在左上角)
const prizes = [
  { name: '5 元红包', icon: '🧧' },
  { name: '谢谢参与', icon: '🙇' },
  { name: '100 积分', icon: '⭐' },
  { name: '8 折券', icon: '🎟️' },
  { name: '再来一次', icon: '🔁' },
  { name: '谢谢参与', icon: '🙇' },
  { name: '1 元红包', icon: '🧧' },
  { name: '神秘大奖', icon: '🎁' },
]

// 外圈顺时针 -> 3×3 行优先索引(中心 4 是按钮)
//  0 1 2          0 1 2
//  7 · 3   <=>    7 8 3  (行优先: 0,1,2,5,8,7,6,3)
//  6 5 4
const perimeterToCell = [0, 1, 2, 5, 8, 7, 6, 3]
const CENTER_CELL = 4

const activeIndex = ref(-1) // 当前高亮的外圈位置 0..7
const spinning = ref(false)
const result = ref<(typeof prizes)[number] | null>(null)

const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined

onMounted(() => {
  // 用 gsap.context 绑定作用域,onUnmounted 时 revert() 统一清理所有补间,
  // 避免组件卸载后动画仍在跑导致的内存泄漏 / 报错。
  ctx = gsap.context(() => {}, root.value)
})

onUnmounted(() => {
  ctx?.revert()
})

// 逐步时长:从快(minDur)平滑爬升到有上限的慢(maxDur)。
// 关键点 —— 减速分摊到末尾的每一步上,且任何一步都 ≤ maxDur,
// 所以不会出现"某一格被冻住一秒再跳走"的卡顿。
const MIN_DUR = 0.045 // 起步每格停留(秒),快
const MAX_DUR = 0.2 // 最后一格停留(秒),慢但有上限
const DECEL_POWER = 3 // 越大,减速越集中在末尾

function start() {
  if (spinning.value) return
  spinning.value = true
  result.value = null

  // 1) 先定结果(真实业务里这里换成后端返回的中奖下标)
  const N = prizes.length
  const target = Math.floor(Math.random() * N)

  // 2) 多转几圈再停:总步数 = 整圈数 × 8 + 目标位置,落点恰好是 target
  const rounds = 4
  const steps = rounds * N + target

  // 3) 用时间轴把高亮一格一格往前推,每格停留时长按曲线递增 -> 平滑减速
  ctx!.add(() => {
    const tl = gsap.timeline({
      onComplete() {
        activeIndex.value = target // 落点对齐,消除任何误差
        result.value = prizes[target]
        spinning.value = false
      },
    })
    const cursor = { i: 0 }
    for (let i = 1; i <= steps; i++) {
      const dur = MIN_DUR + (MAX_DUR - MIN_DUR) * Math.pow(i / steps, DECEL_POWER)
      tl.to(cursor, {
        i,
        duration: dur,
        ease: 'none',
        onStart() {
          activeIndex.value = i % N // 这一步开始时点亮对应格,停留 dur
        },
      })
    }
  })
}
</script>

<template>
  <div ref="root" class="lottery">
    <div class="board">
      <template v-for="cell in 9" :key="cell">
        <!-- 中心格:抽奖按钮 -->
        <button
          v-if="cell - 1 === CENTER_CELL"
          class="cell center"
          :disabled="spinning"
          @click="start"
        >
          {{ spinning ? '抽奖中…' : '开始抽奖' }}
        </button>

        <!-- 外圈格:奖品 -->
        <div
          v-else
          class="cell prize"
          :class="{ active: perimeterToCell[activeIndex] === cell - 1 }"
        >
          <span class="prize__icon">
            {{ prizes[perimeterToCell.indexOf(cell - 1)].icon }}
          </span>
          <span class="prize__name">
            {{ prizes[perimeterToCell.indexOf(cell - 1)].name }}
          </span>
        </div>
      </template>
    </div>

    <p class="result">
      <template v-if="result">🎉 抽中:{{ result.icon }} {{ result.name }}</template>
      <template v-else-if="spinning">　</template>
      <template v-else>点击中间按钮开始</template>
    </p>
  </div>
</template>

<style scoped>
.lottery {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px 16px;
}
.board {
  display: grid;
  grid-template-columns: repeat(3, 96px);
  grid-template-rows: repeat(3, 96px);
  gap: 10px;
}
.cell {
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  user-select: none;
}
.prize {
  background: var(--card);
  border: 2px solid var(--border);
  transition: border-color 0.08s, transform 0.08s, box-shadow 0.08s;
}
.prize.active {
  border-color: #f59e0b;
  transform: scale(1.04);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.35), 0 6px 18px rgba(245, 158, 11, 0.25);
}
.prize__icon {
  font-size: 26px;
}
.prize__name {
  color: var(--muted);
}
.center {
  border: 0;
  cursor: pointer;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
}
.center:disabled {
  filter: saturate(0.6) brightness(0.9);
  cursor: default;
}
.center:not(:disabled):active {
  transform: scale(0.95);
}
.result {
  font-size: 16px;
  min-height: 22px;
  font-weight: 600;
}
</style>
