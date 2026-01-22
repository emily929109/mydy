<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const canvasEl = ref(null);
const frameCount = 59; // 假設 60 張圖
const images = [];
const imageFrame = { frame: 0 }; // 這是一個虛擬物件，用來給 GSAP 改變數值用
let tween = null; // 用來存儲動畫實例

// 預先載入圖片的函式 (避免捲動時閃爍)
const loadImages = () => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    const id = (i + 1).toString().padStart(2, "0");
    console.log(id);
    // img.src = `/${id}.png`;
    // 意思是：以目前這支程式檔案 (import.meta.url) 為基準，去抓同層級 images 資料夾裡的圖
    img.src = new URL(`./images/${id}.png`, import.meta.url).href;
    images.push(img);
  }
  // console.log(images);
};

// const render = (ctx) => {
//   // 畫出目前 frame 對應的那張圖
//   // Math.round 確保我們取整數 (第1張, 第2張...)
//   const index = Math.round(imageFrame.frame);
//   if (images[index]) {
//     // 清空畫布並繪製新圖
//     ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height);
//     ctx.drawImage(
//       images[index],
//       0,
//       0,
//       canvasEl.value.width,
//       canvasEl.value.height,
//     );
//   }
// };

const render = (ctx) => {
  // 畫出目前 frame 對應的那張圖
  // 清空畫布並繪製新圖
  const index = Math.round(imageFrame.frame);
  ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height);
  ctx.drawImage(
    images[index],
    0,
    0,
    canvasEl.value.width,
    canvasEl.value.height,
  );
};

onMounted(() => {
  loadImages();

  const canvas = canvasEl.value;
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 1000;
  const duration = 3; // 如果你有60張圖，想呈現 30fps，duration 就是 2 秒 (60/30)

  tween = gsap.to(imageFrame, {
    frame: frameCount - 1,
    snap: "frame", // 使frame只取整數
    ease: "none",
    duration: duration,
    paused: true, // 預設先暫停，等待 ScrollTrigger 觸發

    scrollTrigger: {
      trigger: ".animation-wrapper",
      start: "top 50%", // 當區塊頂部到達視窗中間位置時開始
      end: "bottom top",
      toggleActions: "play pause resume pause", // 滑進去就播放，滑出去暫停，滑回來繼續播
      pin: false,
    },
    onUpdate: () => render(ctx),
  });
});
</script>

<template>
  <div class="scroll-container">
    <div class="animation-wrapper">
      <canvas ref="canvasEl"></canvas>
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
