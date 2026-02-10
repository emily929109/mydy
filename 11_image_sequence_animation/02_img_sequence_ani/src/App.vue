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
// const img3Src = "/images/video3/apng_3.png";
// const img3Src = "/images/video2/apng_3.png";
const img3Src = "/images/apng_3.png";
const apngList = [img1Src, img2Src, img3Src];

onMounted(() => {});

//將圖片轉換為純二進位數據`
async function getImgBuffer(url) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer(); //(純二進位數據)
    return buffer;
  } catch (error) {
    console.error("圖片讀取失敗:", error);
  }
}

window.onload = async function () {
  const playerMap = new Map(); //array不能儲存DOM元素作為key，會被轉換成字符串
  const bgImg = await loadImage("/images/mb.png");

  for (const [index, src] of apngList.entries()) {
    const canvasEl = document.getElementById(`canvas${index + 1}`);

    if (canvasEl) {
      const ctx = canvasEl.getContext("2d", { willReadFrequently: true });
      // const apng = await initApngPlayer(src, ctx);

      canvasEl.width = bgImg.width;
      canvasEl.height = bgImg.height;

      // 這是一個看不見的 Canvas，專門讓 APNG 在上面跑
      const virtualCanvas = document.createElement("canvas");
      const virtualCtx = virtualCanvas.getContext("2d", {
        willReadFrequently: true,
      });

      // 初始化 APNG，注意這裡傳入的是 virtualCtx (虛擬的 context)
      const apng = await initApngPlayer(src, virtualCtx);

      // 設定虛擬畫布大小 = APNG 的大小
      virtualCanvas.width = apng.width;
      virtualCanvas.height = apng.height;

      apng.numPlays = 2;
      const player = await apng.getPlayer(virtualCtx);
      playerMap.set(canvasEl, player);
      // console.log(index);

      // ----------------------------------------------------------------
      // 步驟 C: 計算 APNG 在手機畫面中的位置 (參考您上一題的算法)
      // ----------------------------------------------------------------
      // 這裡請填入您計算出的實際像素座標
      // 例如：手機圖 671px 高，top: 7.4% => 671 * 0.074 = 約 50px
      const screenX = 20; // 範例值
      const screenY = 50; // 範例值
      const screenW = 302; // 範例值
      const screenH = 600; // 範例值

      // ----------------------------------------------------------------
      // 步驟 D: 建立渲染迴圈 (合成器)
      // ----------------------------------------------------------------
      // 我們使用 GSAP 的 ticker 來驅動畫面更新，這樣效能最好
      gsap.ticker.add(() => {
        // 1. 清空實體畫布
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

        // 3. 再畫 APNG (把虛擬畫布貼上來)
        // APNG 播放器會自動更新 virtualCanvas 的內容，我們只要把它貼過來就好
        ctx.drawImage(virtualCanvas, screenX, screenY, screenW, screenH);

        // 2. 先畫背景 (手機框)
        ctx.drawImage(bgImg, 0, 0, canvasEl.width, canvasEl.height);
      });

      ScrollTrigger.create({
        trigger: canvasEl,
        start: "top 50%", // 視窗的 50% 碰到元素的頂部時觸發 (等同 threshold 0.5)
        end: "bottom top",
        onEnter: () => player.play(),
        onLeave: () => player.pause(),
        onLeaveBack: () => player.pause(),
        onEnterBack: () => player.play(),
      });
    }
  }

  //初始化apng
  async function initApngPlayer(url, ctx) {
    const imgBuffer = await getImgBuffer(url);
    if (!imgBuffer) return;

    const apng = parseAPNG(imgBuffer);
    return apng;
  }

  // 1. 新增一個讀取圖片的工具函式 (Promise包裝)
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // 若圖片跨域需要加這行
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }
};
</script>

<template>
  <div class="wrapper mt-5">
    <div class="d-flex video-wrapper justify-center">
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
    </div>
  </div>

  <!-- <img src="/images/video3/apng_3.png" /> -->
</template>

<style scoped>
canvas#canvas {
  max-width: 300px;
}
</style>
