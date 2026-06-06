<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </div>
</template>

<style scoped>
.app-shell {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
