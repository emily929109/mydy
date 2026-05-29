<script setup>
import { onMounted, ref } from 'vue'
import { Carousel } from 'bootstrap'

const carouselEl = ref(null)

const feedbacks = [
  { text: '謝謝DUDUPAY~我買了冷氣還能分期，資金使用很靈活!!', img: '/img/p1.png', name: '黃太太', job: '家庭主婦' },
  { text: '貓咪突然生病需要大筆手術費用，用了DUDUPAY分期，讓我生活比較沒那麼緊繃', img: '/img/p2.png', name: '張小姐', job: '上班族' },
  { text: '為了想買機車，家裡不太寬裕用了DUDUPAY分期，打工薪水可以付每期帳單，減輕我的負擔', img: '/img/p3.png', name: '王同學', job: '學生' },
]

// 手機版輪播：Vue 在 DOMContentLoaded 後才掛載，需手動初始化 Bootstrap Carousel
onMounted(() => {
  if (carouselEl.value) new Carousel(carouselEl.value, { interval: 10000, ride: 'carousel' })
})
</script>

<template>
  <!-- 網頁版 -->
  <div class="section feedback py-4 py-md-7 row d-none d-md-block fadeUp">
    <div class="title fs-4 fs-md-6 fw-bold mb-3 text-center">消費者回饋</div>
    <div class="feedback-list mx-auto row">
      <div class="feedback-item col-md-4" v-for="(f, i) in feedbacks" :key="i">
        <div class="feedback-item-icon">
          <span class="top-icon"></span>
          <span class="bottom-icon"></span>
        </div>
        <div class="card-text fs-1 fs-lg-2 mb-3 pb-4 pt-7 px-3 px-md-4 py-md-7 text-justify">{{ f.text }}</div>
        <div class="feed-back-author text-center text-lg-end">
          <img :src="f.img" />
          <div class="author-name fs-1 fs-md-2">{{ f.name }}</div>
          <div class="author-job fs-1 fs-md-2">{{ f.job }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 手機版（輪播） -->
  <div class="feedback carousel slide d-block d-md-none" id="carouselExampleInterval2" ref="carouselEl">
    <div class="title fs-4 fs-md-6 fw-bold mb-3 text-center">消費者回饋</div>
    <div class="feedback-list mx-auto carousel-inner">
      <div
        class="feedback-item carousel-item"
        :class="{ active: i === 0 }"
        data-bs-interval="10000"
        v-for="(f, i) in feedbacks"
        :key="i"
      >
        <div class="feedback-item-icon">
          <span class="top-icon"></span>
          <span class="bottom-icon"></span>
        </div>
        <div class="card-text fs-1 fs-lg-2 mb-3 pb-4 pt-7 px-3 px-md-4 py-md-7 text-justify">{{ f.text }}</div>
        <div class="feed-back-author text-center text-lg-end">
          <img :src="f.img" />
          <div class="author-name fs-1 fs-md-2">{{ f.name }}</div>
          <div class="author-job fs-1 fs-md-2">{{ f.job }}</div>
        </div>
      </div>
    </div>

    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval2" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true">
        <span class="fas fa-angle-left" style="color: var(--color-green)"></span>
      </span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval2" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true">
        <span class="fas fa-angle-right" style="color: var(--color-green)"></span>
      </span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>

<style>
/* 由原站 Index.cshtml「消費者回饋」CSS 搬移 */
.feedback {
  width: 100vw;
  background: #cdf0ec;
  margin-left: calc(50% - 50vw);
  color: var(--color-dark-blue);
  font-family: 'Chiron GoRound TC', sans-serif;
  padding-left: 7px;
  padding-right: 7px;
}

.feedback .card-text {
  background-color: #fff;
  border-radius: 24px;
  border-top-left-radius: 64px;
  color: #667588;
  padding-top: 95px !important;
  height: 280px;
}

.author-job {
  color: #667588;
}

.feed-back-author img {
  border-radius: 50%;
}

.feedback-item {
  position: relative;
}

/* 對話框 */
.feedback-item-icon {
  background: #cdf0ec;
  width: 50px;
  height: 50px;
  position: absolute;
  top: 30px;
  left: 45px;
  border-radius: 50%;
}

.feedback-item-icon span {
  width: 25px;
  background: #00ab98;
  display: block;
  position: relative;
  left: 50%;
  transform: translate(-50%);
  border-radius: 4px;
}

.feedback-item-icon .top-icon {
  height: 10px;
  top: 10px;
}

.feedback-item-icon .bottom-icon {
  height: 14px;
  top: 12px;
}

.feedback-item-icon .bottom-icon::after {
  content: '';
  display: block;
  width: 0px;
  height: 0px;
  border-width: 6px;
  border-style: solid;
  border-color: #00ab98 transparent transparent transparent;
  position: absolute;
  top: 98%;
  right: 3px;
}

.feedback img {
  width: 100%;
  max-width: 120px;
}

@media (max-width: 1280px) {
  .feedback .card-text {
    height: 360px;
  }
}

@media (max-width: 768px) {
  .feedback {
    background-color: #fff;
  }
  .feedback .card-text {
    height: 250px;
    background-color: #e7f7f6;
  }
  .feedback-list {
    min-height: 442px;
    padding: 0 60px;
  }
  .feed-back-author {
    position: absolute;
    top: 70%;
    right: 20px;
  }
  .feedback .carousel-control-prev,
  .feedback .carousel-control-next {
    top: -15%;
  }
  .feedback .carousel-control-prev-icon,
  .feedback .carousel-control-next-icon {
    background: #cdf0ec;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    border-radius: 16px;
  }
  .feedback .carousel-control-next,
  .feedback .carousel-control-prev {
    display: block;
    top: 33%;
    bottom: unset;
    opacity: 1;
    width: auto;
  }
  .feedback .carousel-control-prev {
    left: 20px;
  }
  .feedback .carousel-control-next {
    right: 20px;
  }
}
</style>
