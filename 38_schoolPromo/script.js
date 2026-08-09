gsap.registerPlugin(ScrollTrigger);

// Centering baseline for every absolutely-positioned decor/star image.
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
  // Background texture (circles/lines) and Hand stay static — only the
  // top-layer small items (product icons) get the scroll parallax.
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

  // start: "top top" keeps scroll progress at 0 on page load (banner sits
  // at the very top of the page), matching the intro's resting y:0 so
  // parallax doesn't snap items to a new position once it takes over.
  ScrollTrigger.create({
    trigger: "#banner",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      // Negative y: scrolling down moves items up, scrolling up moves items down.
      items.forEach(({ setY, speed }) => setY(-speed * 1.5 * self.progress));
    },
  });
}
