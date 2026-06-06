<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { findDemo } from '../registry'

const props = defineProps<{ name: string }>()
const router = useRouter()

const entry = computed(() => findDemo(props.name))

const DemoComponent = computed(() => {
  const e = entry.value
  if (!e) return null
  return defineAsyncComponent(e.component)
})
</script>

<template>
  <div class="demo">
    <nav class="demo__bar">
      <button class="back" @click="router.push('/')">‹ 返回</button>
      <span class="demo__title">{{ entry?.title ?? name }}</span>
    </nav>

    <div class="demo__stage">
      <component :is="DemoComponent" v-if="DemoComponent" />
      <p v-else class="demo__missing">未找到效果「{{ name }}」</p>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
.demo__bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 8px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  padding-top: env(safe-area-inset-top);
}
.back {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 16px;
  padding: 6px 10px;
  cursor: pointer;
}
.demo__title {
  font-weight: 600;
  font-size: 15px;
}
.demo__stage {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.demo__missing {
  margin: auto;
  color: var(--muted);
}
</style>
