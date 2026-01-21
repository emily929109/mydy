<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const canvasEl = ref(null);
const frameCount = 59; // 假設您有 60 張圖
const images = [];
const imageFrame = { frame: 0 }; // 這是一個虛擬物件，用來給 GSAP 改變數值用
let tween = null; // 用來存儲動畫實例

// 預先載入圖片的函式 (避免捲動時閃爍)
const loadImages = () => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    const id = (i + 1).toString().padStart(2, "0");
    console.log(id);
    img.src = `/${id}.png`;
    images.push(img);
  }
  // console.log(images);
};

const render = (ctx) => {
  // 畫出目前 frame 對應的那張圖
  // Math.round 確保我們取整數 (第1張, 第2張...)
  const index = Math.round(imageFrame.frame);
  if (images[index]) {
    // 清空畫布並繪製新圖
    ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height);
    ctx.drawImage(
      images[index],
      0,
      0,
      canvasEl.value.width,
      canvasEl.value.height,
    );
  }
};

onMounted(() => {
  loadImages(); // 1. 先載圖

  const canvas = canvasEl.value;
  const ctx = canvas.getContext("2d");

  canvas.width = 500;
  canvas.height = 1000;

  // === 關鍵修改開始 ===

  // 1. 設定動畫總時間 (秒)
  // 如果你有60張圖，想呈現 30fps，duration 就是 2 秒 (60/30)
  const duration = 5;

  tween = gsap.to(imageFrame, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    duration: duration, // 必須加入時間長度
    paused: true, // 預設先暫停，等待 ScrollTrigger 觸發

    scrollTrigger: {
      trigger: ".animation-wrapper",
      // start: "top center", // 當區塊頂部到達視窗中間時開始
      start: "top 60%", // 稍微早一點，當區塊頂部到達視窗 60% 位置時開始
      end: "bottom top",
      // markers: true, // 開發時可以打開，觀察觸發線

      // === 核心控制：toggleActions ===
      // 格式: "onEnter onLeave onEnterBack onLeaveBack"
      // play: 播放
      // pause: 暫停
      // restart: 重頭播放
      // reverse: 倒帶
      // reset: 重置到 0
      // none: 不做任何事

      // 設定範例：滑進去就播放，滑出去暫停，滑回來繼續播
      toggleActions: "play pause resume pause",

      // 如果你不想要「釘選住」使用者，把 pin 拿掉
      // 如果想要使用者看完整個動畫才能繼續滑，保留 pin: true
      pin: false,
    },
    onUpdate: () => render(ctx),
  });
  // === 關鍵修改結束 ===
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
