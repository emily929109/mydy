<script setup>
import { onMounted, onBeforeUnmount, nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Swiper from 'swiper'
import { useNewsStore } from '@/stores/news'

const newsStore = useNewsStore()
const { homeNews } = storeToRefs(newsStore)

const mobileSwiperEl = ref(null)
let swiper = null

onMounted(async () => {
  await newsStore.fetchHomeNews()
  await nextTick()
  // 手機版：抓取資料並等渲染後初始化 Swiper（對應原站 #news-swiper）
  swiper = new Swiper(mobileSwiperEl.value, {
    loop: true,
    slidesPerView: 1.5,
    breakpoints: {
      320: { spaceBetween: 20 },
      576: { spaceBetween: 40 },
    },
  })
})

onBeforeUnmount(() => swiper?.destroy(true, true))
</script>

<template>
  <div class="news-card-wrapper mt-4 mt-md-7 text-center mx-auto py-4 py-md-7">
    <div class="title fs-4 fs-md-6 fw-bold mb-md-4 text-center position-relative">
      最新消息
      <router-link to="/Home/News">
        <div class="align-items-center d-flex more-product position-absolute fs-1 fs-md-2">
          看更多消息
          <div><span class="fas fa-arrow-right"></span></div>
        </div>
      </router-link>
    </div>

    <!-- 網頁版 -->
    <div class="d-none d-lg-block">
      <div class="d-flex news-card-inner-wrapper mx-auto justify-content-between">
        <div
          class="news-card-item d-flex flex-column"
          :class="{ ended: item.status === 'ended' }"
          v-for="item in homeNews"
          :key="item.href"
        >
          <router-link :to="item.href">
            <div class="news-item-img"><img :src="item.img" alt="news-item-img" /></div>
            <div class="news-item-text">
              <div class="news-item-text-date text-start">{{ item.date }}</div>
              <div class="fw-bold news-item-text-title text-start mb-3">{{ item.text }}</div>
              <button class="position-relative"><div class="arrow-box position-absolute"></div></button>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 手機版 -->
    <div
      class="news-mb swiper d-block d-lg-none mt-4 py-4"
      style="margin-left: -1rem; margin-right: -1rem; padding-left: 1rem"
      ref="mobileSwiperEl"
    >
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="item in homeNews" :key="item.href">
          <router-link :to="item.href">
            <div class="news-item-img-mb"><img :src="item.img" alt="news-item-img" /></div>
            <div class="news-item-text">
              <div class="news-item-text-date text-start">{{ item.date }}</div>
              <div class="fw-bold news-item-text-title text-start mb-3">{{ item.text }}</div>
              <button class="position-relative"><div class="arrow-box position-absolute"></div></button>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 由原站 Index.cshtml「最新消息改版」CSS 搬移 */
.news-item-img img {
  width: 100%;
  transition: transform 0.5s ease;
}

.news-card-item {
  width: 32%;
  cursor: pointer;
}

.news-item-img {
  border-color: #e2e2e2;
  overflow: hidden;
  border-radius: 1em;
  width: 95%;
  opacity: 0;
}

.news-item-text {
  padding: 20px;
  margin-left: 40px;
  margin-top: -35px;
  background-color: #ffffff;
  border-radius: 1em;
  box-shadow: 0 2px 8px 0 rgb(112 112 112 / 20%);
  z-index: 2;
  position: relative;
}

.news-item-text-title {
  font-size: 1.1rem;
  letter-spacing: 1px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
  color: var(--color-dark-blue);
}

.news-item-text-date {
  font-size: 0.875rem;
}

.news-card-wrapper button {
  border: none;
  outline: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-green);
  margin-right: auto;
  display: block;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.arrow-box {
  height: 3px;
  background: #fff;
  transform: rotate(-45deg) translate(-50%, -50%);
  width: 20px;
  top: 50%;
  left: 50%;
  transform-origin: left center;
  transition: background-color 0.3s ease;
}

.arrow-box::before {
  content: '';
  display: block;
  position: absolute;
  right: 0;
  bottom: 0px;
  width: 10px;
  height: 10px;
  transform: rotate(45deg);
  border-top: 3px solid #fff;
  border-right: 3px solid #fff;
  top: 1px;
  transform: translateY(-50%) rotate(45deg);
  transition: border-color 0.3s ease;
}

.news-card-item:hover img {
  transform: scale(1.1);
}

.news-card-item:hover .arrow-box::before {
  border-top-color: var(--color-dark-blue);
  border-right-color: var(--color-dark-blue);
}

.news-card-item:hover button {
  background: #fff;
  border: 1px solid var(--color-dark-blue);
}

.news-card-item:hover .arrow-box {
  background: var(--color-dark-blue);
}

.news-item-img-mb {
  border-color: #e2e2e2;
  overflow: hidden;
  border-radius: 1em;
  width: 95%;
}

.news-item-img-mb img {
  width: 100%;
}

@media (max-width: 576px) {
  .news-card-wrapper .more-product {
    top: 70px;
  }
}

/* 活動狀態標籤：已結束 */
.news-card-item.ended .news-item-img {
  position: relative;
}

.news-card-item.ended .news-item-img::before {
  content: '已結束';
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(43, 43, 43, 0.85);
  color: #fff;
  padding: 10px 25px;
  font-size: 1.1rem;
  font-weight: 500;
  border-bottom-right-radius: 20px;
  z-index: 5;
  letter-spacing: 2px;
}
</style>
