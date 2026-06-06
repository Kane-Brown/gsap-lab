<script setup lang="ts">
import Placeholder from '../../components/Placeholder.vue'
</script>

<template>
  <Placeholder
    :plan="[
      'gsap.to({val}) 驱动数字滚动到目标值',
      '进度条宽度补间 + 节点到达时高亮点亮',
      'ScrollTrigger 滚动到视口才开始播放',
    ]"
  />
</template>
