<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import parseAPNG from "apng-js";

const img1Src = "/images/ezgif.com-apng-maker.png";

window.onload = function () {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  //將圖片轉換為純二進位數據
  async function getImgBuffer(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer(); //(純二進位數據)

    return buffer;
  }

  //apng解析、準備播放器
  async function createApngPlayer(url, ctx, options = {}) {
    const imgBuffer = await getImgBuffer(url);
    const apng = parseAPNG(imgBuffer);

    //canvas尺寸設定為apng圖片尺寸
    canvas.width = apng.width;
    canvas.height = apng.height;

    // Object.keys(options).forEach((key) => {
    //   apng[key] = options[key];
    // });
    const player = await apng.getPlayer(ctx);
    return player;
  }

  // createApngPlayer(img1Src, ctx);

  //IIFE (立即呼叫函式表達式)
  (async () => {
    const player1 = await createApngPlayer(img1Src, ctx, { numPlays: 1 });
    // const player2 = await createApngPlayer(img2Src, ctx);
    player1.play();
  })();
};
</script>

<template>
  <canvas id="canvas"></canvas>
  <!-- <img :src="img1Src" /> -->
</template>

<style scoped>
canvas#canvas {
  max-width: 300px;
}
</style>
