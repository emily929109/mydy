gsap.registerPlugin(ScrollTrigger);

// ===========文字往下消失==============
gsap.to(".banner", {
  scrollTrigger: {
    trigger: ".banner",
    start: "top 25%",
    end: "top 5%",
    scrub: 2,
    markers: false,
  },
  opacity: 0,
  scale: 0,
  ease: "none",
});

//=========== 1.圖片上浮 2.fixed到一個定點 3.背景變色==============

// const offsetY = window.innerHeight > 800 ? 70 : 50; // 大螢幕不要太沉
const start = window.innerHeight > 750 ? "35% 95%" : "20% 95%"; // 大螢幕不要太慢trigger

let tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".img-sliding-up-inner-container",
    start: start,
    end: "center 70%",
    scrub: 2,
    markers: true,
  },
});

// 第一段：滑入、縮小
tl.fromTo(
  ".img-sliding-up-inner-container",
  {
    yPercent: 70,
    width: 724,
    opacity: 1,
  },
  { yPercent: 0, width: 554, opacity: 1, ease: "none", duration: 1 }
)

  // 第二段: swiper opacity 0 -> 1
  .to(".swiper", {
    opacity: 1,
  })

  // 與上段同時：背景變色
  .to(
    "body",
    {
      backgroundColor: "#fff",
    },
    "<"
  )

  // 與上段同時：背景變色
  .to(
    ".img-sliding-up-inner-container",
    {
      opacity: 0,
    },
    "+=0.2"
  );

//============== 小圖片往外飛==============
let flyout = gsap.timeline({
  scrollTrigger: {
    trigger: ".stickers_wrapper",
    start: "20% 15%",
    end: "20% 15",
    scrub: 1,
    markers: false,
  },
});

flyout.to(".sticker_item", {
  x: (i) => {
    // 前四個往左飛
    if (i < 5) {
      return gsap.utils.random(-1200, -800);
    }
    // 後四個往右飛
    else {
      return gsap.utils.random(800, 1200);
    }
  },
  y: () => gsap.utils.random(-300, 400), // 垂直隨機位移
  rotation: () => gsap.utils.random(-45, 45), // 隨機旋轉角度
  opacity: 0, // 淡出
  ease: "none",
});

// ==============小icon跟著滑鼠移動==============
document.addEventListener("mousemove", (e) => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  // 將滑鼠座標轉換為 -1 ~ 1 的範圍
  const offsetX = (e.clientX - centerX) / centerX;
  const offsetY = (e.clientY - centerY) / centerY;

  const maxMove = 25; // 控制最大移動範圍(px)

  // 使用 GSAP 平滑移動 icon
  gsap.to(".sticker_item", {
    x: offsetX * maxMove,
    y: offsetY * maxMove,
    duration: 0.01,
    ease: "none",
  });
});

// ===========swiper==============
const swiper = new Swiper(".swiper", {
  // Optional parameters
  loop: true,
  speed: 1000,

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
