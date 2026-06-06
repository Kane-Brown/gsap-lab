<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { demos } from '../registry'
</script>

<template>
  <main class="home">
    <header class="home__hd">
      <h1>gsap-lab</h1>
      <p>GSAP 动画沙盒 · 移动端 H5 效果</p>
    </header>

    <ul class="grid">
      <li v-for="d in demos" :key="d.name">
        <RouterLink class="card" :to="`/demo/${d.name}`">
          <span class="card__icon">{{ d.icon }}</span>
          <span class="card__title">{{ d.title }}</span>
          <span class="card__desc">{{ d.desc }}</span>
          <span class="card__tag" :class="`is-${d.status}`">
            {{ d.status === 'done' ? '可玩' : '占位' }}
          </span>
        </RouterLink>
      </li>
    </ul>

    <footer class="home__ft">共 {{ demos.length }} 个效果</footer>
  </main>
</template>

<style scoped>
.home {
  padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
  max-width: 480px;
  margin: 0 auto;
}
.home__hd h1 {
  margin: 8px 0 4px;
  font-size: 28px;
}
.home__hd p {
  margin: 0 0 20px;
  color: var(--muted);
  font-size: 14px;
}
.grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 14px;
  min-height: 110px;
  border-radius: 16px;
  background: var(--card);
  border: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease;
}
.card:active {
  transform: scale(0.97);
}
.card__icon {
  font-size: 26px;
}
.card__title {
  font-weight: 600;
  font-size: 15px;
}
.card__desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}
.card__tag {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
}
.card__tag.is-done {
  background: rgba(34, 197, 94, 0.18);
  color: #22c55e;
}
.card__tag.is-todo {
  background: rgba(148, 163, 184, 0.18);
  color: var(--muted);
}
.home__ft {
  margin-top: 24px;
  text-align: center;
  color: var(--muted);
  font-size: 12px;
}
</style>
