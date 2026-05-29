<script setup>
import { computed, onMounted, ref } from 'vue'
import { useNewsStore } from '@/stores/news'

const newsStore = useNewsStore()
const currentTab = ref('announcement')
const tabs = newsStore.tabs

const currentTabItems = computed(() => newsStore.tabItems(currentTab.value))

onMounted(() => newsStore.fetchHomeNews())
</script>

<template>
  <div class="section news mx-auto fadeUp">
    <div class="title fs-4 fs-md-6 fw-bold mb-4 text-center">公告專區</div>
    <div class="news-list">
      <!-- tab links -->
      <div class="d-flex gap-3 mx-1">
        <button
          v-for="(tab, key) in tabs"
          :key="key"
          class="tablinks fs-1 fs-lg-2 fw-bold"
          :class="{ active: currentTab === key }"
          @click="currentTab = key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- tab contents -->
      <div class="tab-container mt-4">
        <transition mode="out-in" name="tab">
          <ol :key="currentTab" class="news-list-content tabcontent mb-4">
            <li v-for="(item, index) in currentTabItems" :key="index" class="news-item py-3">
              <router-link :to="item.href" class="w-100 d-flex justify-content-between align-items-center">
                <div>
                  <p class="fs-0 fs-lg-1 news-date">{{ item.date }}</p>
                  <div class="fs-1 fs-md-2 fs-lg-3 fw-bold new-title">{{ item.text }}</div>
                </div>
                <span><i class="fa-solid fa-chevron-right"></i></span>
              </router-link>
            </li>
          </ol>
        </transition>
      </div>
    </div>
    <a href="/Home/News" target="_blank">
      <button class="d-block fs-1 fs-md-2 mb-7 mt-5 mx-auto news-more py-3">觀看更多</button>
    </a>
  </div>
</template>

<style>
/* 由原站 Index.cshtml「公告專區」CSS 搬移 */
.news ol {
  padding: 0;
  margin: 0;
  list-style: none;
}

.news {
  color: #003048;
}

.news a {
  color: inherit;
}

.news-date {
  margin: 0;
  color: #6f6e6e;
}

.news-item {
  border-bottom: 1px solid #e1e1e2;
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-item i {
  color: #00ab96;
}

.news a:hover {
  text-decoration: none;
  color: #00ab96;
  font-weight: bold;
}

/* tab */
.news .tablinks {
  width: 50%;
  background-color: #fff;
  outline: none;
  padding: 8px 0;
  border-radius: 24px;
  border: 2px solid #009d87;
  color: inherit;
  position: relative;
}

.news .tablinks.active {
  border-color: #ff8025;
}

.news .tablinks::after {
  content: '';
  display: block;
  height: 0px;
  border-width: 12px 8px;
  border-style: solid;
  border-color: #00ab98 transparent transparent transparent;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%);
}

.news .tablinks.active::after {
  border-color: #ff8025 transparent transparent transparent;
}

.new-title {
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
}

/* 公告分頁過場 transition name="tab" */
.tab-enter-active,
.tab-leave-active {
  transition: all 0.4s ease;
}

.tab-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.tab-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.tab-enter-to,
.tab-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
