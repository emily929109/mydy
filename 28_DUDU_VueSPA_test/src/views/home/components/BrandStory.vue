<script setup></script>

<template>
  <div class="brand px-3 py-7 section mt-0 mt-md-5 fadeUp">
    <div class="title fs-4 fs-md-6 fw-bold mb-5 text-center">品牌故事</div>
    <div class="brand-text fs-1 fs-lg-2 mx-auto px-4 px-lg-8 py-5 py-lg-7">
      <div class="brand-subtitle fs-1 fs-md-3 mx-auto py-2 text-center px-4 position-absolute">新型額度數位分期支付品牌</div>
      <div>
        秉持「理性分期、幸福升級」的理念，打造現代消費者輕鬆、彈性的支付體驗。不論是寵物日常用品或是意外支出，DUDUPAY
        讓你無需刷卡也能安心分期。獨特的「履約信用升級模式（PBPCM）」，逐步提升信用額度，用對方式照顧毛孩，降低財務負擔。讓
        DUDUPAY 成為你寵愛毛孩、聰明消費的最佳選擇。
      </div>
      <div class="more mx-auto py-3 text-center fs-1 fs-md-2">
        <a href="/Home/About"><div>了解更多</div></a>
      </div>
    </div>
  </div>
</template>

<style>
/* 由原站 Index.cshtml「品牌故事」CSS 搬移 */
.brand {
  background-color: #cdf0ec;
  z-index: 0;
  position: relative;
  margin-left: -1rem;
  margin-right: -1rem;
}

.brand-text {
  background-color: #00ab96;
  color: #fff;
  border-radius: 16px;
  letter-spacing: 5px;
  text-align: justify;
  z-index: -1;
  position: relative;
  margin-bottom: 35px;
}

.brand-subtitle {
  color: var(--color-dark-blue);
  font-family: 'Chiron GoRound TC', sans-serif;
  letter-spacing: 1px;
  background-color: #ffffff;
  border-radius: 40px;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  width: max-content;
}

.brand-subtitle::after {
  content: '';
  display: block;
  width: 5px;
  height: 32px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  border-radius: 8px;
}

.brand .more {
  width: 100%;
  background-color: #fff;
  max-width: 200px;
  border-radius: 8px;
  border: 1px solid #0a2f4a;
  color: var(--color-dark-blue);
  font-family: 'Chiron GoRound TC', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
}

.brand .more:hover {
  background: #0a2f4a;
  color: #fff;
}

.brand .more:hover div::after {
  border-left-color: #fff;
}

.brand .more div::after {
  content: '';
  width: 0;
  height: 0;
  z-index: 9;
  position: relative;
  display: inline-block;
  margin-left: 10px;
  border: 7px solid #1c2f4f;
  border-right-width: 0;
  border-top-color: transparent;
  border-bottom-color: transparent;
  vertical-align: inherit;
}

@media (max-width: 992px) {
  .brand-subtitle::after {
    height: 22px;
  }
}
</style>
