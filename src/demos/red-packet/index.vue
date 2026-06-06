<script setup lang="ts">
import Placeholder from '../../components/Placeholder.vue'
</script>

<template>
  <Placeholder
    :plan="[
      '抢之前:红包持续抖动(yoyo + repeat:-1 的小幅 rotation)',
      '拆开:timeline 翻盖 + 金额数字滚动',
      '金币爆发:stagger 批量错峰 + MotionPathPlugin 飞向余额',
    ]"
  />
</template>
