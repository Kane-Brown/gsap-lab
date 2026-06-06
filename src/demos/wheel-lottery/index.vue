<script setup lang="ts">
import Placeholder from '../../components/Placeholder.vue'
</script>

<template>
  <Placeholder
    :plan="[
      'gsap.to(rotation) 旋转转盘,ease: power4.out 减速',
      '目标角度 = 360×圈数 + (360 − 中奖扇区中心角)',
      'CSS conic-gradient 画扇区,指针固定在顶部',
    ]"
  />
</template>
