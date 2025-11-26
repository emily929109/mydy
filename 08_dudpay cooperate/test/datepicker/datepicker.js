import PrimeVue from "primevue/config";

// ----------------vue prime 開始---------------------
const app = Vue.createApp({
  data() {
    return {
      date: null, // 用來綁定 DatePicker 的 v-model
    };
  },
});

// 啟用 PrimeVue + UIX 主題
// app.use(PrimeVue.Config, {
//   theme: {
//     preset: PrimeUIX.Themes.Aura,
//   },
// });

app.use(PrimeVue.Config);

// 註冊 DatePicker 元件
app.component("p-datepicker", PrimeVue.DatePicker);
app.component("p-inputtext", PrimeVue.InputText);

// 掛載
app.mount("#app");
// ----------------vue prime 結束---------------------
flatpickr("#myDate");
flatpickr("#date");
// ----------------input-placeholder 開始---------------------
const inputsPlaceholder = document.querySelectorAll(".input-placeholder"); //input

inputsPlaceholder.forEach((input) => {
  handleInputPlaceholder(input);
});

function handleInputPlaceholder(input) {
  const updateState = () => {
    const isFocused = document.activeElement === input;
    const isEmpty = input.value.trim() === "" || input.value === "\u00A0"; // &nbsp;

    if (isFocused && isEmpty) {
      input.setAttribute("placeholder", input.dataset.placeholder);
    } else {
      input.setAttribute("placeholder", "");
    }
  };

  input.addEventListener("focus", updateState);
  input.addEventListener("blur", updateState);
}

// ----------------input-placeholder 結束---------------------
// ----------------檢查input狀態 控制label 開始---------------------
const inputs = document.querySelectorAll(".input-underlined input");

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      input.classList.add("filled");
    } else {
      input.classList.remove("filled");
    }
  });
});
// ----------------檢查input狀態 控制label 結束---------------------
