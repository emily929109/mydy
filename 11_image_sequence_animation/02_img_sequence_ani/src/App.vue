<script setup>
import { ref, onMounted } from "vue";
import parseAPNG from "apng-js";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
gsap.registerPlugin(ScrollTrigger);

const img1Src = "/images/apng_v2.png";
const img2Src = "/images/apng_2.png";
const img3Src = "/images/apng_3.png";
const apngList = [img1Src, img2Src, img3Src];
const videoItems = [
  { id: 1, text: "簡單一掃 即可付款" },
  { id: 2, text: "繳帳單也能很輕鬆" },
  { id: 3, text: "快速結帳 無需等待" },
];
const canvasRefs = ref([]); //供gsap使用

onMounted(async () => {
  //  載入背景圖
  const bgImg = await loadBgImage("/images/mb.png"); //<img src="...">

  //遍歷每個canvas
  for (const [index, src] of apngList.entries()) {
    let canvasEl;
    canvasEl = canvasRefs.value[index];
    if (!canvasEl) return;

    const ctx = canvasEl.getContext("2d", { willReadFrequently: true });
    // ----------------------------------------------------------------
    //設定背景畫布大小
    // ----------------------------------------------------------------
    canvasEl.width = bgImg.width;
    canvasEl.height = bgImg.height;
    // ----------------------------------------------------------------
    // 設定影片畫布大小並準備播放器
    // ----------------------------------------------------------------
    const virtualCanvas = document.createElement("canvas");
    const virtualCtx = virtualCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    const apng = await initApngPlayer(src, virtualCtx);
    virtualCanvas.width = apng.width;
    virtualCanvas.height = apng.height;
    apng.numPlays = 2;
    const player = await apng.getPlayer(virtualCtx);

    // ----------------------------------------------------------------
    // 我們使用 GSAP 的 ticker 來驅動畫面更新，這樣效能最好

    ScrollTrigger.create({
      trigger: canvasEl,
      start: "top 50%", // 視窗的 50% 碰到元素的頂部時觸發 (等同 threshold 0.5)
      end: "bottom top",
      onEnter: () => {
        player.play();
        gsap.ticker.add(() => renderApng(bgImg, ctx, canvasEl, virtualCanvas));
      },
      onLeave: () => {
        player.pause();
        gsap.ticker.remove(() =>
          renderApng(bgImg, ctx, canvasEl, virtualCanvas),
        );
      },
      onLeaveBack: () => {
        player.play();
        gsap.ticker.add(() => renderApng(bgImg, ctx, canvasEl, virtualCanvas));
      },
      onEnterBack: () => {
        player.play();
        gsap.ticker.add(() => renderApng(bgImg, ctx, canvasEl, virtualCanvas));
      },
    });
  }
});

//------------------------------------------------------------------
//準備apng播放器，回傳apng物件
const initApngPlayer = async (url, ctx) => {
  const imgBuffer = await getImgBuffer(url);
  if (!imgBuffer) return;

  const apng = parseAPNG(imgBuffer);
  return apng;
};

//------------------------------------------------------------------
//將apng轉換為純二進位數據`
const getImgBuffer = async (url) => {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer(); //(純二進位數據)
    return buffer;
  } catch (error) {
    console.error("圖片讀取失敗:", error);
  }
};

//------------------------------------------------------------------
// 載入圖片並回傳一個 Image 物件，後續被 Canvas.drawimge() 使用
const loadBgImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image(); //web api 等同於 document.createElement("img")
    img.src = src;
    img.onload = () => resolve(img); // 圖片載入成功，回傳 Image 物件 給呼叫者(await)
    img.onerror = (e) => reject(e);
  });
};

//------------------------------------------------------------------
//渲染
const renderApng = (bgImg, ctx, canvasEl, virtualCanvas) => {
  // 計算 APNG 在手機畫面中的位置
  // ----------------------------------------------------------------
  const originX = 20;
  const originY = 50; // 20,50為畫布放置的起始點
  const screenW = 300; // iphone螢幕比例約為2:1 所以apng比例也要是2:1 否則會變形
  const screenH = 600;

  // 1. 清空實體畫布
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  // 2. 先畫 APNG (把虛擬畫布貼上來)
  // APNG 播放器會自動更新 virtualCanvas 的內容，我們只要把它貼過來就好
  ctx.drawImage(virtualCanvas, originX, originY, screenW, screenH);
  // ctx.drawImage(virtualCanvas, originX, originY);
  // 3. 再畫背景 (手機框)
  ctx.drawImage(bgImg, 0, 0, canvasEl.width, canvasEl.height);
};

window.onload = async function () {
  // for (const [index, src] of apngList.entries()) {
  //   const canvasEl = document.getElementById(`canvas${index + 1}`);
  //
  // }
};
</script>

<template>
  <div class="wrapper mt-5">
    <!-- <div class="d-flex video-wrapper justify-center">
      <div class="video-wrapper-img">
        <div class="canvas-container">
          <canvas id="canvas1"></canvas>
        </div>
      </div>
      <div class="video-wrapper-txt fs-1">簡單一掃 即可付款</div>
    </div>
    <div class="d-flex video-wrapper justify-center">
      <div class="video-wrapper-txt fs-1">繳帳單也能很輕鬆</div>
      <div class="video-wrapper-img">
        <canvas id="canvas2"></canvas>
      </div>
    </div>
    <div class="d-flex video-wrapper justify-center">
      <div class="video-wrapper-img">
        <canvas id="canvas3"></canvas>
      </div>

      <div class="video-wrapper-txt fs-1">快速結帳 無需等待</div>
    </div> -->
    <div
      v-for="(item, index) in videoItems"
      :key="item.id"
      class="d-flex video-wrapper justify-center"
      :class="{ 'flex-row-reverse': index % 2 !== 0 }"
    >
      <div class="video-wrapper-img">
        <div class="canvas-container">
          <canvas
            :id="'canvas' + item.id"
            :ref="(el) => (canvasRefs[index] = el)"
          ></canvas>
        </div>
      </div>

      <div class="video-wrapper-txt fs-1">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
canvas#canvas {
  max-width: 300px;
}
</style>
