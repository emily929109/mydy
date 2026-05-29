<script setup>
const products = [
  { href: 'https://www.dudupay.com.tw/Home/Purchase?store=JYAP&product=15', logo: '/img/index-product/logo1.png', img: '/img/index-product/prd-1.png', slogan: '喵星人小木屋｜休息玩樂一次滿足', title: '高質感設計｜多功能貓爬架', price: '$1299 元起 / 最高1期' },
  { href: 'https://www.dudupay.com.tw/Home/Purchase?store=JYAP&product=188', logo: '/img/index-product/logo1.png', img: '/img/index-product/prd-2.png', slogan: '【特百滋TAPAZO】凍乾三重奏', title: '成幼犬低敏羊肉 (狗飼料) 5lb', price: '$870 元起 / 最高1期' },
  { href: 'https://www.dudupay.com.tw/Home/Purchase?store=JYAP&product=201', logo: '/img/index-product/logo1.png', img: '/img/index-product/prd-3.png', slogan: '【皇家】減少便臭 | 健康亮麗毛髮', title: ' 中型熟齡犬 7+ / 15KG', price: '$1122 元起 / 最高3期' },
  { href: 'https://www.dudupay.com.tw/Home/Purchase?store=MN10&product=18', logo: '/img/index-product/logo2.png', img: '/img/index-product/prd-4.png', slogan: 'GOMO® 平衡生活', title: '全齡貓腎臟低負擔配方', price: '$999 元起 / 最高1期' },
  { href: 'https://www.dudupay.com.tw/Home/Purchase?store=MAN0&product=41', logo: '/img/index-product/logo3.png', img: '/img/index-product/prd-5.png', slogan: '流暢順跑3A大作', title: '小鋼炮性能水冷主機', price: '$1450 元起 / 最高24期' },
  { href: 'https://www.dudupay.com.tw/Home/Purchase?store=YUSI&product=89', logo: '/img/index-product/logo4.png', img: '/img/index-product/prd-6.png', slogan: '1TB 高容量SSD | 4K 遊戲主機', title: 'PS5 PlayStation5 Slim 薄型光碟版主機', price: '$849 元起 / 最高24期' },
  { href: 'https://www.dudupay.com.tw/Home/Purchase?store=EMI0&product=10', logo: '/img/index-product/logo5.png', img: '/img/index-product/prd-7.png', slogan: '大容量除臭貓砂盆 | 免插電好清理', title: 'PawCleaner 半自動拉拉貓砂盆', price: '$1154 元起 / 最高6期 ' },
  { href: 'https://www.dudupay.com.tw/Home/Purchase?store=EMI0&product=3', logo: '/img/index-product/logo5.png', img: '/img/index-product/prd-8.png', slogan: '雕塑臀部曲線', title: 'CurvEase 翹臀按摩坐墊', price: '$1055 元起 / 最高3期' },
]
</script>

<template>
  <div class="py-7 section store fadeUp">
    <div class="position-relative mx-auto" style="max-width: 1200px">
      <div class="title fs-4 fs-md-6 fw-bold mb-4 text-center shop">購物商城</div>
      <a href="/Home/StoreList" target="_blank">
        <div class="align-items-center d-flex more-product position-absolute fs-1 fs-md-2 fw-bold">
          看更多商品
          <div><span class="fas fa-arrow-right"></span></div>
        </div>
      </a>
    </div>
    <div class="d-flex gap-4 justify-content-between store-product">
      <div class="store-product-item" v-for="(p, i) in products" :key="i">
        <a :href="p.href">
          <div class="store-product-item-logo"><img :src="p.logo" /></div>
          <div class="card p-3 mb-3">
            <div class="img-container overflow-hidden">
              <img class="card-img-top" :src="p.img" :alt="'item' + (i + 1)" />
            </div>
            <div class="card-body pb-0 ps-0 pe-0">
              <div class="card-slogan">{{ p.slogan }}</div>
              <div class="card-title">{{ p.title }}</div>
              <div class="card-text fw-bold pb-2">{{ p.price }}</div>
              <button class="align-items-center arrow-button d-flex mt-3"><span class="fas fa-arrow-right"></span></button>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style>
/* 由原站 Index.cshtml「購物商城」CSS 搬移 */
.store {
  background-image: url(/img/index-product/product-bg.png);
  background-size: 100% auto;
  background-repeat: no-repeat;
  margin-left: -1rem;
  margin-right: -1rem;
}

.more-product {
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
  letter-spacing: 2px;
  color: var(--color-dark-blue);
  font-family: 'Chiron GoRound TC', sans-serif;
  margin-right: 20px;
}

.more-product div {
  border: 1px solid #00ac96;
  background-color: #00ab98;
  width: 50px;
  height: 50px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  color: #fff;
  margin-left: 10px;
  transition: all 0.3s ease;
}

@media (hover: hover) and (pointer: fine) {
  .more-product:hover div {
    background-color: #fff;
    border-color: var(--color-dark-blue);
  }
  .more-product:hover div svg {
    color: var(--color-dark-blue);
  }
}

@media (max-width: 768px) {
  .more-product div {
    width: 30px;
    height: 30px;
  }
}

.store .card-img-top {
  object-fit: cover;
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 0.375rem;
  transition-duration: 0.3s;
}

.store .card-text {
  color: #00ab97;
  border-bottom: 1px solid #d8d9d9;
}

.store .card-slogan {
  color: #fc8e3f;
  height: 48px;
}

.store .card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #eef0ef;
  border-radius: 16px;
  border-bottom-right-radius: 64px;
  height: 100%;
}

.store .fa-arrow-right {
  color: #fff;
  border-radius: 50%;
  display: block;
  width: 32px;
  z-index: 9;
}

.store .card-title {
  height: 58px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
  color: var(--color-dark-grey);
}

.store .card .arrow-button {
  border: none;
  width: 32px;
  height: 32px;
  background: #52ab97;
  border-radius: 50%;
  margin-left: auto;
  position: relative;
  overflow: hidden;
}

.store .card .arrow-button::after {
  position: absolute;
  content: '';
  inset: 0px;
  background-color: #fff;
  transition: transform 0.3s ease-in-out;
  transform: translateX(-100%);
  width: 30px;
  height: 32px;
}

.store-product {
  overflow-x: auto;
  flex-wrap: wrap;
  margin: 0 auto;
  padding: 0 2rem;
}

.store-product-item {
  width: 22%;
  min-width: 200px;
  position: relative;
}

.store-product-item-logo {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 9;
  max-width: 80px;
}

.store-product-item-logo img {
  width: 100%;
}

@media (hover: hover) and (pointer: fine) {
  .store .store-product-item:hover img {
    transform: scale(1.1);
  }
  .store .store-product-item:hover .arrow-button::after {
    transform: translateX(0);
  }
  .store .store-product-item:hover .arrow-button {
    border: 1px solid #52ab97;
  }
  .store .store-product-item:hover .fa-arrow-right {
    color: #52ab97;
  }
}

@media (max-width: 992px) {
  .store-product {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin-left: -1rem;
    margin-right: -1rem;
  }
}

@media (max-width: 576px) {
  .more-product {
    top: 115%;
  }
  .more-product span {
    width: 30px;
    height: 30px;
  }
}
</style>
