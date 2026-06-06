<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

const phase = ref<'closed' | 'opened'>('closed')
const amount = ref(0)
const displayAmount = ref('0.00')
const balance = ref(1280)
const displayBalance = ref('1280.00')

const root = ref<HTMLElement>()
const packetEl = ref<HTMLElement>()
const flapEl = ref<HTMLElement>()
const btnEl = ref<HTMLElement>()
const rewardEl = ref<HTMLElement>()
const badgeEl = ref<HTMLElement>()
const coinLayer = ref<HTMLElement>()

const COIN_COUNT = 14
const coins = Array.from({ length: COIN_COUNT }, (_, i) => i)

let ctx: gsap.Context | undefined
let shakeTween: gsap.core.Tween | undefined

function randomAmount() {
  // 0.50 ~ 88.88 元
  return Math.round((Math.random() * 88.38 + 0.5) * 100) / 100
}

function startShake() {
  shakeTween?.kill()
  if (!packetEl.value) return
  gsap.set(packetEl.value, { rotate: 0 })
  // 未拆时持续轻微抖动:repeat:-1 + yoyo
  shakeTween = gsap.to(packetEl.value, {
    rotate: 3,
    duration: 0.11,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}

onMounted(() => {
  // gsap.context 绑定作用域,卸载时统一 revert 清理所有补间
  ctx = gsap.context(() => {}, root.value)
  amount.value = randomAmount()
  displayBalance.value = balance.value.toFixed(2)
  startShake()
})

onUnmounted(() => {
  shakeTween?.kill()
  ctx?.revert()
})

function open() {
  if (phase.value === 'opened') return
  shakeTween?.kill()

  ctx!.add(() => {
    const tl = gsap.timeline()
    // 1) 抖动回正
    tl.to(packetEl.value!, { rotate: 0, duration: 0.15, ease: 'power2.out' })
    // 2) 翻盖上掀(顶部为轴) + 開 按钮旋转缩没
    tl.to(
      flapEl.value!,
      { rotateX: -168, duration: 0.55, ease: 'power3.inOut', transformOrigin: '50% 0%' },
      '<',
    ).to(btnEl.value!, { scale: 0, rotate: 200, duration: 0.4, ease: 'back.in(2)' }, '<')
    // 3) 金额揭晓 + 数字滚动
    tl.add(() => (phase.value = 'opened'))
    tl.fromTo(
      rewardEl.value!,
      { scale: 0.4, opacity: 0, y: 12 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(2)' },
      '>-0.1',
    )
    const amt = { v: 0 }
    tl.to(
      amt,
      {
        v: amount.value,
        duration: 0.7,
        ease: 'power1.out',
        onUpdate() {
          displayAmount.value = amt.v.toFixed(2)
        },
      },
      '<',
    )
    // 4) 金币爆发并沿弧线飞向余额
    tl.add(() => burstCoins(), '>-0.25')
  })
}

function burstCoins() {
  const packet = packetEl.value
  const badge = badgeEl.value
  const layer = coinLayer.value
  if (!packet || !badge || !layer) return

  const pr = packet.getBoundingClientRect()
  const br = badge.getBoundingClientRect()
  const cx = pr.left + pr.width / 2
  const cy = pr.top + pr.height / 2
  const dx = br.left + br.width / 2 - cx
  const dy = br.top + br.height / 2 - cy

  const coinEls = Array.from(layer.children) as HTMLElement[]
  coinEls.forEach((coin, i) => {
    const ang = (Math.PI * 2 * i) / coinEls.length + Math.random() * 0.6
    const r = 60 + Math.random() * 70
    const sx = Math.cos(ang) * r // 先向四周炸开
    const sy = Math.sin(ang) * r - 30 // 略向上,更有抛物感
    const delay = i * 0.035

    gsap.set(coin, { left: cx, top: cy, xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0, opacity: 1 })
    // 飞行:中心 -> 散开点 -> 余额(三点贝塞尔弧线)
    gsap.to(coin, {
      duration: 0.95 + Math.random() * 0.2,
      delay,
      ease: 'power1.inOut',
      motionPath: {
        path: [
          { x: 0, y: 0 },
          { x: sx, y: sy },
          { x: dx, y: dy },
        ],
        curviness: 1.4,
      },
    })
    gsap.to(coin, { scale: 1, duration: 0.22, delay, ease: 'back.out(2)' })
    gsap.to(coin, { scale: 0.3, opacity: 0, duration: 0.25, delay: delay + 0.72, ease: 'power1.in' })
  })

  // 余额滚动上涨,与金币抵达节奏同步
  const start = balance.value
  const end = balance.value + amount.value
  const b = { v: start }
  gsap.to(b, {
    v: end,
    duration: 0.8,
    delay: 0.55,
    ease: 'power1.out',
    onUpdate() {
      displayBalance.value = b.v.toFixed(2)
    },
    onComplete() {
      balance.value = end
    },
  })
  // 余额徽章被砸到时弹一下
  gsap.fromTo(badge, { scale: 1 }, { scale: 1.18, duration: 0.16, delay: 0.7, yoyo: true, repeat: 1, ease: 'power2.out' })
}

function reset() {
  amount.value = randomAmount()
  displayAmount.value = '0.00'
  phase.value = 'closed'
  gsap.set(flapEl.value!, { rotateX: 0 })
  gsap.set(btnEl.value!, { scale: 1, rotate: 0 })
  gsap.set(rewardEl.value!, { opacity: 0 })
  startShake()
}
</script>

<template>
  <div ref="root" class="rp">
    <!-- 顶部余额徽章(金币飞行的目标) -->
    <div class="topbar">
      <div ref="badgeEl" class="balance">
        <span class="balance__label">余额</span>
        <span class="balance__num">¥{{ displayBalance }}</span>
      </div>
    </div>

    <!-- 红包 -->
    <div class="stage">
      <div ref="packetEl" class="packet" @click="open">
        <!-- 内层:金额揭晓 -->
        <div class="packet__body">
          <div ref="rewardEl" class="reward">
            <div class="reward__tip">恭喜发财</div>
            <div class="reward__amount">
              <span class="reward__yuan">¥</span>{{ displayAmount }}
            </div>
            <div class="reward__unit">已存入余额</div>
          </div>
        </div>
        <!-- 盖子:覆盖内层,点開后上掀 -->
        <div ref="flapEl" class="packet__flap">
          <div ref="btnEl" class="open-btn">開</div>
        </div>
      </div>
    </div>

    <button class="action" @click="phase === 'opened' ? reset() : open()">
      {{ phase === 'opened' ? '再抢一个' : '点开红包' }}
    </button>

    <!-- 金币飞行层(全屏固定,不挡点击) -->
    <div ref="coinLayer" class="coin-layer">
      <span v-for="c in coins" :key="c" class="coin">🪙</span>
    </div>
  </div>
</template>

<style scoped>
.rp {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(120% 80% at 50% 0%, #b3261a 0%, #7d1410 60%, #5e0f0c 100%);
  color: #fff;
  padding: 16px;
}
.topbar {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
.balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 8px 14px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(4px);
}
.balance__label {
  font-size: 11px;
  color: #f4d28a;
}
.balance__num {
  font-size: 17px;
  font-weight: 700;
  color: #ffe9b0;
  font-variant-numeric: tabular-nums;
}

.stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px; /* 给翻盖的 rotateX 提供透视 */
}
.packet {
  position: relative;
  width: 230px;
  height: 320px;
  cursor: pointer;
  transform-style: preserve-3d;
}
.packet__body {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(160deg, #e23b2e, #c0241a);
  box-shadow: inset 0 0 0 2px rgba(255, 222, 150, 0.35), 0 16px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.reward {
  opacity: 0; /* 拆开后由动画显示 */
  text-align: center;
}
.reward__tip {
  font-size: 14px;
  color: #ffd98a;
  letter-spacing: 2px;
}
.reward__amount {
  margin: 10px 0 6px;
  font-size: 44px;
  font-weight: 800;
  color: #ffe08a;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 12px rgba(255, 196, 80, 0.5);
}
.reward__yuan {
  font-size: 24px;
  margin-right: 2px;
}
.reward__unit {
  font-size: 12px;
  color: #ffd98a;
  opacity: 0.85;
}

.packet__flap {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(160deg, #d83327, #b51f16);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
}
.packet__flap::before {
  /* 盖子下沿的弧形压痕 */
  content: '';
  position: absolute;
  top: 58%;
  left: 50%;
  width: 150%;
  height: 80%;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
}
.open-btn {
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ffe9a8, #f0c44d 55%, #d99b1f);
  color: #9a2018;
  font-size: 30px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.6);
}

.action {
  margin: 8px 0 4px;
  border: 0;
  padding: 12px 36px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  color: #8a1c14;
  background: linear-gradient(135deg, #ffe9a8, #f0c44d);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
.action:active {
  transform: scale(0.96);
}

.coin-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}
.coin {
  position: fixed;
  font-size: 26px;
  opacity: 0;
  will-change: transform;
}
</style>
