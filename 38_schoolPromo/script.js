gsap.registerPlugin(ScrollTrigger);

// 絕對定位每個裝飾元素
gsap.set(".decor, .star", {
  xPercent: -50,
  yPercent: -50,
  y: 20,
  autoAlpha: 0,
});

const introTl = gsap.timeline({ defaults: { ease: "power2.out" } });
introTl
  .to(".banner-bg", { autoAlpha: 1, duration: 0.3 })
  .to(
    ".decor, .star",
    { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.09 },
    0.3,
  )
  .call(() => {
    startStarIdle();
    initParallax();
  });

function startStarIdle() {
  gsap.to(".star", {
    opacity: 0.25,
    duration: 1.1,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    stagger: { each: 0.5, from: "random" },
  });
}

function initParallax() {
  // 等同於 const items = Array.from(document.querySelectorAll(".decor")).filter(...).map(...);
  const items = gsap.utils
    .toArray(".decor")
    .filter(
      (el) =>
        !el.matches(
          ".item-hand, .item-circle1, .item-circle2, .item-circle3, .item-line1, .item-line2, .item-line3, .item-line4",
        ),
    )
    .map((el) => ({
      setY: gsap.quickSetter(el, "y", "px"),
      speed: parseFloat(el.dataset.speed) || 0,
    }));

  // items 會是一個陣列，每個元素長得像：  { setY: fn, speed: 1.5 }
  // map 的目的 : 把「DOM 查詢」和「每次 scroll 更新的運算」分開
  // DOM 相關的東西（找元素、讀屬性、建立 setter）只在初始化時做一次，之後滾動時的 onUpdate 只做純數字運算＋呼叫 setter，效能較好。
  ScrollTrigger.create({
    trigger: "#banner",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      // Negative y: scrolling down moves items up, scrolling up moves items down.
      items.forEach(({ setY, speed }) => setY(-speed * 3 * self.progress));
    },
  });
}
