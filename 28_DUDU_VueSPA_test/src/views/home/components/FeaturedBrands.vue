<script setup>
const brands = [
  { href: 'https://www.dudupay.com.tw/Home/OnlineStore?store=JYAP', external: true, img: '/img/brand/brand1.png', title: '中圓寵物家族', sub: '用心專業，溫度您感受的到' },
  { href: 'https://www.dudupay.com.tw/Home/OnlineStore?store=MN10', external: true, img: '/img/brand/brand2.png', title: 'GOMO 寵物食品', sub: '選擇透明供應鏈，給毛孩最安心的食品' },
  { href: '/Home/Travel', external: false, img: '/img/brand/brand3.png', title: '一起飛', sub: '旅遊分期新體驗' },
  { href: 'https://www.petsfamily.com.tw/page/yuanlin', external: true, img: '/img/brand/brand4.png', title: '圓霖動物醫院', sub: '關心您的寵物健康' },
]
</script>

<template>
  <div class="brand-ex mx-auto py-7 sectio fadeUp">
    <div class="title fs-4 fs-md-6 fw-bold mb-4 text-center">精選品牌</div>
    <div class="brand-list justify-content-center d-flex gap-3 gap-lg-4 flex-lg-nowrap flex-wrap">
      <div class="brand-list-item" v-for="(b, i) in brands" :key="i">
        <component :is="b.external ? 'a' : 'router-link'" v-bind="b.external ? { href: b.href } : { to: b.href }">
          <div class="brand-list-img py-4 text-center mb-3 overflow-hidden">
            <img class="w-100" :src="b.img" />
          </div>
          <div class="brand-description d-flex justify-content-between">
            <div class="brand-description-text features-title fs-2 fs-md-3 mb-2 mb-md-4">
              <span class="brand-description-text-title"> {{ b.title }} </span>
              <span class="brand-description-text-sub d-block features-text fs-1">{{ b.sub }}</span>
            </div>
            <div class="brand-description-img d-flex gap-1 align-self-start">
              <img class="online-store-default" src="/img/brand/online-store-icon-08-09.png" />
              <img class="online-store-hover" src="/img/brand/online-store-icon-08-09-white-10.png" />
            </div>
          </div>
        </component>
      </div>
    </div>
    <a href="/Home/Dealer" target="_blank">
      <button class="d-block fs-1 fs-md-2 mx-auto mt-5 news-more py-3">觀看更多</button>
    </a>
  </div>
</template>

<style>
/* 由原站 Index.cshtml「精選品牌」CSS 搬移 */
.brand-description-img img {
  width: 50px;
  border: 1px solid #00aa98;
  border-radius: 50%;
}

.brand-list {
  margin: 0 auto;
}

.brand-list-img {
  border: 2px solid #7fd6c4;
  border-radius: 16px;
}

.brand-list img {
  max-width: 220px;
  transition: all 0.3s ease;
}

.brand-list-item {
  cursor: pointer;
  width: 23%;
}

.brand-ex .brand-description-text-title,
.brand-ex .brand-description-text-sub {
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  display: -webkit-box !important;
}

.brand-ex .brand-description-text-title {
  -webkit-line-clamp: 1;
}

.brand-description-text-sub {
  -webkit-line-clamp: 2;
}

.online-store-hover {
  display: none;
}

@media (hover: hover) and (pointer: fine) {
  .brand-list-item:hover .brand-description-img img {
    border-color: #fff;
    background-color: #00aa98;
  }
  .brand-list-item:hover .online-store-hover {
    display: block;
  }
  .brand-list-item:hover .online-store-default {
    display: none;
  }
  .brand-list-item:hover .brand-list-img img {
    transform: scale(1.1);
  }
}

@media (max-width: 992px) {
  .brand-list-item {
    width: 47%;
  }
}

/* 共用按鈕 .news-more */
button.news-more {
  background-color: #00ab96;
  color: #fff;
  outline: none;
  border: 1px solid transparent;
  width: 100%;
  max-width: 250px;
  border-radius: 8px;
  font-family: 'Chiron GoRound TC', sans-serif;
  transition: all 0.3s ease;
}

.news-more::after {
  content: '';
  width: 0;
  height: 0;
  z-index: 9;
  position: relative;
  display: inline-block;
  margin-left: 10px;
  border: 7px solid #fff;
  border-right-width: 0;
  border-top-color: transparent;
  border-bottom-color: transparent;
  vertical-align: inherit;
}

button.news-more:hover {
  color: #0b1f41;
  border-color: #0b1f41;
  background-color: #fff;
}

button.news-more:hover::after {
  border-left-color: #0b1f41;
}
</style>
