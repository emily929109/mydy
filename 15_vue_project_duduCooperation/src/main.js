import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

createApp(App).mount("#app");

// document.addEventListener(
//   "animationstart",
//   (e) => {
//     if (e.animationName === "onAutoFillStart") {
//       // e.target 就是被自動填入的那個 input

//       // 直接移除 is-invalid，或呼叫你的處理函式
//       e.target.classList.remove("is-invalid");
//       console.log("auto fill start detected");
//       // 如果你要複用上面的函式：
//       // handleRequiredAtFocus(e);
//     }
//   },
//   true
// ); // Use capture phase if needed

// console.log("Hello Vue 3!");
