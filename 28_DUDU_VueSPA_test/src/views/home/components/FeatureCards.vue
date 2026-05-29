<script setup></script>

<template>
  <div class="section features mt-4 mt-md-7 text-center fadeUp">
    <div class="title fs-4 fs-md-6 fw-bold text-center">DUDUPAY</div>
    <div class="title fs-4 fs-md-6 fw-bold text-center mb-4"><span class="me-3">3</span>大特色</div>
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="features-item col-12 col-md-4 mb-4">
          <img class="mb-3" src="/img/mb4.png" />
          <div class="features-title fs-2 fs-md-3 mb-2 mb-md-4">新型額度數位分期支付</div>
          <div class="features-text fs-1 fs-md-2">毛孩消費 / 美容 / 旅遊 / 機車<br />都可輕鬆分期付款無負擔</div>
        </div>
        <div class="features-item col-12 col-md-4 mb-4">
          <img class="mb-3" src="/img/pc.png" />
          <div class="features-title fs-2 fs-md-3 mb-2 mb-md-4">線上一鍵申辦</div>
          <div class="features-text fs-1 fs-md-2">DUDUPAY 官方網站申辦<br />全線上申請，簡單快速</div>
        </div>
        <div class="features-item col-12 col-md-4 mb-4">
          <img class="mb-3" src="/img/banner/安全支付工具.png" />
          <div class="features-title fs-2 fs-md-3 mb-2 mb-md-4">安全支付工具</div>
          <div class="features-text fs-1 fs-md-2">獨立伺服器&驗證簡訊保護個資<br />防盜刷超安心！</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 由原站 Index.cshtml「3大特色」CSS 搬移 */
.features-item img {
  max-height: 150px;
}

.features-title {
  color: var(--color-dark-blue);
}

.features-text {
  color: #6e6d6d;
}

/* 背景偽元素 跑馬燈效果 */
.features::before,
.features::after {
  font-size: 15vw;
  letter-spacing: 20px;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  position: absolute;
  text-shadow: -1px -1px 0 #e4f6f4, 1px -1px 0 #e4f6f4, -1px 1px 0 #e4f6f4, 1px 1px 0 #e4f6f4;
  font-weight: 900;
  z-index: -1;
  white-space: nowrap;
  pointer-events: none;
}

.features::before {
  content: 'DUDU';
  top: 0;
  animation: marquee-left 50s linear infinite;
}

.features::after {
  content: 'PAY';
  bottom: -146px;
  animation: marquee-right 50s linear infinite;
}

@keyframes marquee-left {
  0% {
    left: 100%;
    transform: translateX(0);
  }
  100% {
    left: 0;
    transform: translateX(-100%);
  }
}

@keyframes marquee-right {
  0% {
    left: 0;
    transform: translateX(-100%);
  }
  100% {
    left: 100%;
    transform: translateX(0);
  }
}

@media (max-width: 1500px) {
  .features::after {
    bottom: 45px;
  }
}

@media (max-width: 768px) {
  .features::before {
    font-size: 23vw;
    top: 67px;
  }
  .features::after {
    bottom: 5px;
    font-size: 23vw;
  }
}

.features {
  position: relative;
  margin: 0 auto;
}
</style>
