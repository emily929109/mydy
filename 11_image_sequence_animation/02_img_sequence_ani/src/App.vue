<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// 1. 定義 Canvas 與 Context
const myCanvas = ref(null);
let ctx = null;

// 2. 定義兩張圖片物件
const imgBase = new Image();
const imgTop = new Image();

// 3. 定義動畫狀態 (progress 0 = 全顯示底圖, 1 = 全顯示上層圖)
const animationState = { progress: 0 };

// 圖片路徑 (請換成您的圖片)
const src1 = "./images/01.png";
const src2 = "./images/02.png";

onMounted(async () => {
  // 初始化 Canvas Context
  ctx = myCanvas.value.getContext("2d");

  // 等待兩張圖片都載入完成才能畫 (這步最重要，Canvas 不能畫還沒載入的圖)
  await Promise.all([loadImage(imgBase, src1), loadImage(imgTop, src2)]);

  // 一開始先畫一次初始狀態
  render();
});

// --- 核心繪圖邏輯 (畫家) ---
const render = () => {
  // A. 清空畫布 (擦白板)
  //clearRect(x, y, width, height)
  ctx.clearRect(0, 0, myCanvas.value.width, myCanvas.value.height);

  // B. 畫底圖 (永遠是不透明的)
  // drawImage(image, x, y)
  ctx.globalAlpha = 1;
  ctx.drawImage(imgBase, 0, 0);

  // C. 畫上層圖 (根據進度決定透明度)
  // 這就是 Zingala 疊圖的秘密：globalAlpha
  ctx.globalAlpha = animationState.progress;
  ctx.drawImage(imgTop, 0, 0);
};

// --- 動畫控制邏輯 (導演) ---
const animateToNext = () => {
  gsap.to(animationState, {
    progress: 1, // 目標：變成 1 (完全顯示上層圖)
    duration: 1,
    ease: "power2.out",
    // 關鍵！GSAP 每算一次數值，就叫畫家重畫一次
    onUpdate: render,
  });
};

// --- 工具：圖片載入 Helper ---
const loadImage = (imgObj, src) => {
  return new Promise((resolve) => {
    imgObj.onload = () => resolve();
    imgObj.src = src;
  });
};
</script>

<template>
  <div class="controls">
    <button @click="animateToNext">切換到 B 圖</button>
  </div>
  <div class="scroll-container">
    <div class="animation-wrapper">
      <canvas ref="myCanvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.animation-wrapper {
  width: 100%;
  height: 100vh; /* 佔滿視窗 */
  display: flex;
  justify-content: center;
  align-items: center;
}
canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>
