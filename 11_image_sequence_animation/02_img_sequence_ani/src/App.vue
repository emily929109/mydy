<script setup>
import { ref, onMounted } from "vue";
import parseAPNG from "apng-js";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

gsap.registerPlugin(ScrollTrigger);
const img1Src = "./images/apng_v2.png";
const img2Src = "./images/video2/apng_2.png";
const img3Src = "./images/video3/apng_3.png";
const apngList = [img1Src, img2Src, img3Src];

onMounted(() => {});

//將圖片轉換為純二進位數據
async function getImgBuffer(url) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer(); //(純二進位數據)
    return buffer;
  } catch (error) {
    console.error("圖片讀取失敗:", error);
  }
}

window.onload = function () {
  // const canvas = document.querySelector("#canvas");
  // const ctx = canvas.getContext("2d");
  const playerMap = new Map();

  apngList.forEach((src, index) => {
    const canvasEl = document.getElementById(`canvas${index + 1}`);

    if (canvasEl) {
      const ctx = canvasEl.getContext("2d");
      const apng = initApngPlayer(src, ctx);
    canvasEl.width = apng.width;
    canvasEl.height = apng.height;

    apng.numPlays = 2;
    const player = await apng.getPlayer(ctx);
    playerMap.set(canvas, player);

        ScrollTrigger.create({
      trigger: canvasEl,
      start: "top 50%", // 視窗的 50% 碰到元素的頂部時觸發 (等同 threshold 0.5)
      end: "bottom top",
      onEnter: () => player.play(),
      onLeave: () => player.pause(),
      onLeaveBack: () => player.pause(),
      onEnterBack: () => player.play(),

      // markers: true,
    });

      // console.log(`APNG Player ${index + 1} initialized!`);
    }
  });

  //初始化apng
  async function initApngPlayer(url, ctx) {
    const imgBuffer = await getImgBuffer(url);
    if (!imgBuffer) return;

    const apng = parseAPNG(imgBuffer);
    return apng;





    // Object.keys(options).forEach((key) => {
    //   apng[key] = options[key];
    // });


  }

  // initApngPlayer(img1Src, ctx);
};
</script>

<template>
  <div style="min-height: 1200px"></div>
  <div class="fs-1">簡單一掃 即可付款</div>
  <canvas id="canvas1"></canvas>
  <div class="fs-1">繳帳單也能很輕鬆</div>
  <canvas id="canvas2"></canvas>
  <div class="fs-1">快速結帳 無需等待</div>
  <canvas id="canvas3"></canvas>
</template>

<style scoped>
canvas#canvas {
  max-width: 300px;
}
</style>
