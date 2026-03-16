<script setup>
import { ref } from 'vue';
import ArticleCard from './components/ArticleCard.vue';

/**
 * App 組件
 * 主要入口組件，展示文章列表。
 */

// 模擬文章數據
const articles = ref([
  {
    id: 1,
    title: '探索 Vue 3 的 Composition API',
    content: 'Vue 3 的 Composition API 為開發者提供了更靈活、更強大的方式來組織代碼邏輯，讓組件更加模組化且易於維護。',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    author: 'Emily',
    date: '2026/03/10',
    link: 'https://vuejs.org/'
  },
  {
    id: 2,
    title: 'MDB 與 Bootstrap 的視覺美學',
    content: 'Material Design for Bootstrap (MDB) 結合了 Google 的設計規範與 Bootstrap 的易用性，讓開發者能快速建立現代化的網頁介面。',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    author: 'Gemini',
    date: '2026/03/12',
    link: 'https://mdbootstrap.com/'
  },
  {
    id: 3,
    title: '高效 CLI 開發工具指南',
    content: '了解如何利用現代 CLI 工具加速您的開發流程，從自動化腳本 to 智能代碼生成，全面提升開發效率。',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    author: 'Admin',
    date: '2026/03/15',
    link: '#'
  }
]);
</script>

<template>
  <div class="container py-5">
    <!-- 列表標題 -->
    <div class="row mb-4">
      <div class="col-12 text-center">
        <h1 class="fw-bold mb-3">我的 Vite + Vue 3 專案</h1>
        <div class="d-flex justify-content-center">
          <hr class="border-primary border-3 opacity-100" style="width: 100px;">
        </div>
        <p class="text-muted mt-3">運用 Vue 3 組件大師技能所建立的文章展示列表</p>
      </div>
    </div>

    <!-- 文章卡片網格 -->
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="article in articles" :key="article.id" class="col">
        <ArticleCard
          :title="article.title"
          :content="article.content"
          :image="article.image"
          :author="article.author"
          :date="article.date"
          :link="article.link"
        />
      </div>
    </div>

    <!-- 加載更多 (模擬) -->
    <div class="row mt-5">
      <div class="col-12 text-center">
        <button type="button" class="btn btn-primary btn-rounded btn-lg shadow-2" data-mdb-ripple-init>
          查看更多文章 <i class="fas fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* 全域樣式調整 */
body {
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
}

/* 確保網格高度一致 */
.col {
  display: flex;
}

.article-card {
  flex: 1;
}
</style>
