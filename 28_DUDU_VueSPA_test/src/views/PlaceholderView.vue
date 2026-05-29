<script setup>
defineProps({
  page: { type: String, default: '' },
})
</script>

<template>
  <div class="container py-9 text-center" style="min-height: 60vh">
    <h2 class="title fw-bold mb-3">{{ page }}</h2>
    <p class="fs-1 text-secondary">此頁面尚未重構，僅作為導覽占位。</p>
    <router-link to="/" class="news-more d-inline-block px-4 py-2 mt-3 text-white">回首頁</router-link>
  </div>
</template>
