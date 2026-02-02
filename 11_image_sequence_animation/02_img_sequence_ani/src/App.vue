<script setup>
import { ref, onMounted } from "vue";
import parseAPNG from "apng-js";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const img1Src = "./images/apng_v2.png";

window.onload = function () {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");
  const playerMap = new Map();

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

  //初始化apng
  async function initApngPlayer(url, ctx) {
    const imgBuffer = await getImgBuffer(url);
    if (!imgBuffer) return;

    const apng = parseAPNG(imgBuffer);
    canvas.width = apng.width;
    canvas.height = apng.height;
    apng.numPlays = 2;
    const player = await apng.getPlayer(ctx);
    playerMap.set(canvas, player);

    // Object.keys(options).forEach((key) => {
    //   apng[key] = options[key];
    // });

    ScrollTrigger.create({
      trigger: canvas,
      start: "top 50%", // 視窗的 50% 碰到元素的頂部時觸發 (等同 threshold 0.5)
      end: "bottom top",
      onEnter: () => player.play(),
      onLeave: () => player.pause(),
      onLeaveBack: () => player.pause(),
      onEnterBack: () => player.play(),

      // markers: true,
    });
  }

  initApngPlayer(img1Src, ctx);
};
</script>

<template>
  <div style="min-height: 1200px"></div>
  <canvas id="canvas"></canvas>
  <!-- <img :src="img1Src" /> -->
</template>

<style scoped>
canvas#canvas {
  max-width: 300px;
}
</style>
