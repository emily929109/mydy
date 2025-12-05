//淡入
$(window).on("load", function () {
  const isMobile = window.innerWidth < 768;

  const options_x = {
    root: null,
    threshold: isMobile ? 0.1 : 0.5, // 手機 0.1  桌機 0.5
  };

  //const options_x = {
  //    root: null, // 以視窗為範圍
  //    threshold: 0.1,
  //};
  const observer = new IntersectionObserver(callback, options_x);

  const target = document.querySelectorAll(".section");
  target.forEach((el) => observer.observe(el));

  function callback(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        console.log("目標元素在可視區域內");
        observer.unobserve(entry.target);
      } else {
        //   entry.target.classList.remove("fade-in");
        //   console.log("目標元素在可視區域外");
      }
    });
  }
});

//多種淡入效果
function handleAnimation(entries, observer) {
  document
    .querySelectorAll("[data-animation]")
    .forEach((el) => observer.observe(el));

  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const animationClass = entry.target.dataset.animation;

      entry.target.classList.add(animationClass);
      observer.unobserve(entry.target);
    } else {
    }
  });
}

//依序出現
function animationDelay() {
  const items = document.querySelectorAll(".news-item");
  items.forEach((item, index) => {
    //item.style.animationDelay = `${index * 0.2}s`;
    const cycleIndex = index % 3; // 0,1,2 → 0,1,2 → 0,1,2 循環
    item.style.animationDelay = `${cycleIndex * 0.2}s`;
  });
}
