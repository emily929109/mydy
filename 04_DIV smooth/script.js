const options_x = {
  root: null, // 以視窗為範圍
  threshold: 0.5,
};
const observer = new IntersectionObserver(callback, options_x);

const target = document.querySelectorAll("section");
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
