<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'

const containerEl = ref(null)
const prevEl = ref(null)
const nextEl = ref(null)
const paginationEl = ref(null)
let swiper = null

// 對應原站 index.js 的 banner swiper 設定
onMounted(() => {
  swiper = new Swiper(containerEl.value, {
    modules: [Navigation, Pagination],
    observer: true,
    observeParents: true,
    navigation: { nextEl: nextEl.value, prevEl: prevEl.value },
    pagination: { el: paginationEl.value, type: 'bullets', clickable: true },
    autoplay: false,
    effect: 'slide',
    speed: 1000,
    spaceBetween: 0,
    slidesPerGroup: 1,
    centeredSlides: true,
    slidesPerView: 1,
    loop: true,
    loopAdditionalSlides: 1,
    simulateTouch: true,
    breakpoints: { 750: { simulateTouch: true, speed: 700 } },
  })
})

onBeforeUnmount(() => swiper?.destroy(true, true))

const slides = [
  { href: '/Home/StoreList', mb: '/img/travel/promotion20260518/banner_1024x1024.jpg', pc: '/img/travel/promotion20260518/banner_1550x600.jpg', alt: '一起飛旅行社機加酒' },
  { href: '/Home/News?id=thailand', mb: '/img/news/thailand/banner_1024x1024.jpg', pc: '/img/news/thailand/banner_1550x600.jpg', alt: '曼谷不只好買！5個一去就愛上的泰國經典景點推薦' },
  { href: '/Home/News?id=jeju', mb: '/img/news/jeju/banner_1024x1024.jpg', pc: '/img/news/jeju/banner_1550x600.jpg', alt: '濟州旅行清單公開' },
  { href: '/Home/News?id=hospitals', mb: '/img/news/hospitals/hos_list.jpg', pc: '/img/news/hospitals/hos_BN.jpg', alt: 'DUDUPAY 攜手多家動物醫院' },
  { href: '/Home/News?id=yl', mb: '/img/news/yl/banner_1024x1024.jpg', pc: '/img/news/yl/banner_1550x600.jpg', alt: 'DUDU 會員 中圓寵物家族專屬優惠' },
  { href: '/Home/News?id=games', mb: '/img/news/games/banner_1024x1024.jpg', pc: '/img/news/games/banner_1550x600.jpg', alt: '程泓電玩' },
]
</script>

<template>
  <div style="margin-left: -1rem; margin-right: -1rem">
    <div class="banner-wrapper mb-7 mb-lg-8 mt-lg-5">
      <div class="swiper-container swiper" id="banner-swiper" ref="containerEl">
        <ul class="swiper-wrapper">
          <li class="swiper-slide" v-for="(s, i) in slides" :key="i">
            <router-link :to="s.href">
              <picture>
                <source media="(min-width:576px)" :srcset="s.pc" />
                <img :src="s.mb" :alt="s.alt" />
              </picture>
            </router-link>
          </li>
        </ul>
        <div class="swiper-pagination" ref="paginationEl"></div>
        <div class="swiper-button-prev" ref="prevEl"></div>
        <div class="swiper-button-next" ref="nextEl"></div>
      </div>
    </div>
  </div>
</template>

<style>
/* 由原站 css/index/swiper-em.css 搬移 */
.banner-wrapper ul,
.banner-wrapper li {
  padding: 0;
  margin: 0;
  list-style: none;
}

.banner-wrapper img {
  width: 100%;
  border-radius: 10px;
}

.banner-wrapper .swiper {
  overflow: visible;
}

.banner-wrapper {
  margin: 0 auto;
  position: relative;
}

.banner-wrapper .swiper-container {
  width: 100%;
  position: relative;
}

.banner-wrapper .swiper-slide {
  transform: scale(1);
  opacity: 1;
  background-color: #fff;
  transition-property: transform, opacity;
  transition-duration: 0.3s;
}

.banner-wrapper .swiper-container .swiper-slide a:hover {
  opacity: 0.7;
}

@media only screen and (max-width: 950px) {
  .banner-wrapper img {
    border-radius: 0;
  }
}

@media only screen and (max-width: 750px) {
  .banner-wrapper .swiper-container .swiper-slide {
    transition-duration: 0.8s;
  }
}

@media only screen and (max-width: 576px) {
  .banner-wrapper .swiper-container .swiper-slide a:hover {
    opacity: 1;
  }
}

.banner-wrapper .swiper-container .swiper-slide-prev,
.banner-wrapper .swiper-container .swiper-slide-next {
  transform: scale(0.7);
  opacity: 1;
  background-color: #fff;
  transition-property: transform, opacity;
  transition-duration: 0.3s;
}

.banner-wrapper .swiper-container .swiper-slide.swiper-slide-next img,
.banner-wrapper .swiper-container .swiper-slide.swiper-slide-prev img {
  opacity: 0.4;
}

@media only screen and (max-width: 750px) {
  .banner-wrapper .swiper-container .swiper-slide.swiper-slide-next,
  .banner-wrapper .swiper-container .swiper-slide.swiper-slide-prev {
    transition-duration: 0.7s;
    transition-delay: 0.2s;
  }
}

.banner-wrapper .swiper-container .swiper-slide.swiper-slide-prev {
  right: -50px;
}

.banner-wrapper .swiper-container .swiper-slide.swiper-slide-next {
  left: -50px;
}

@media only screen and (max-width: 750px) {
  .banner-wrapper .swiper-container .swiper-slide.swiper-slide-next {
    left: 0;
  }
  .banner-wrapper .swiper-container .swiper-slide.swiper-slide-prev {
    right: 0;
  }
}

#app .banner-wrapper .swiper-pagination-bullet {
  display: inline-block;
  opacity: 1;
  background-color: #d2d2d2;
  border-radius: 50%;
  width: min(1.5555555556vw, 14px);
  height: min(1.5555555556vw, 14px);
  cursor: pointer;
}

#app .banner-wrapper .swiper-pagination-bullet + .swiper-pagination-bullet {
  margin-left: 15px;
}

#app .banner-wrapper .swiper-pagination {
  position: absolute;
  bottom: -50px;
  left: 0;
  right: 0;
  margin: auto;
  text-align: center;
}

@media only screen and (max-width: 750px) {
  #app .banner-wrapper .swiper-pagination {
    bottom: -8vw;
    width: calc(100% - 20.2666666666vw);
  }
  #app .banner-wrapper .swiper-pagination-bullet {
    width: 2.666666666vw;
    height: 2.666666666vw;
  }
}

#app .banner-wrapper .swiper-pagination-bullet-active {
  background: var(--color-green);
}

.banner-wrapper .swiper-button-prev,
.banner-wrapper .swiper-button-next {
  border-radius: 50%;
  width: min(7.77777777vw, 70px);
  height: min(7.77777777vw, 70px);
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.09);
  cursor: pointer;
}

@media only screen and (max-width: 750px) {
  .banner-wrapper .swiper-button-prev,
  .banner-wrapper .swiper-button-next {
    bottom: -10.1333333333vw !important;
    width: 10.1333333333vw;
    height: 10.1333333333vw;
  }
}

.banner-wrapper .swiper-button-prev {
  left: -100px;
}

.banner-wrapper .swiper-button-next:after,
.banner-wrapper .swiper-button-prev:after {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-green);
}

.banner-wrapper .swiper-button-next {
  right: -100px;
}

@media only screen and (max-width: 1200px) {
  .banner-wrapper .swiper-button-prev,
  .banner-wrapper .swiper-button-next {
    top: auto;
    bottom: max(-7.777777777vw, -70px);
    border-radius: 10px;
  }
  .banner-wrapper .swiper-button-prev {
    top: 50%;
    left: 0;
  }
  .banner-wrapper .swiper-button-next {
    top: 50%;
    right: 0;
  }
}

@media only screen and (max-width: 950px) {
  .banner-wrapper .swiper-button-prev,
  .banner-wrapper .swiper-button-next {
    border-radius: 0;
  }
}
</style>
