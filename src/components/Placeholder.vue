<script setup lang="ts">
// 占位骨架:写出该效果计划用到的 GSAP 思路,真正实现时替换为本目录的 index.vue。
defineProps<{ plan: string[] }>()
</script>

<template>
  <div class="ph">
    <div class="ph__emoji">🚧</div>
    <p class="ph__hint">占位中 · 计划用到的 GSAP 能力:</p>
    <ul class="ph__plan">
      <li v-for="(p, i) in plan" :key="i">{{ p }}</li>
    </ul>
    <p class="ph__cta">对我说「做这个」即可开始实现。</p>
  </div>
</template>

<style scoped>
.ph {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 24px;
  text-align: center;
}
.ph__emoji {
  font-size: 48px;
}
.ph__hint {
  color: var(--muted);
  font-size: 13px;
  margin: 0;
}
.ph__plan {
  text-align: left;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
  max-width: 300px;
}
.ph__cta {
  margin-top: 8px;
  font-size: 13px;
}
</style>
