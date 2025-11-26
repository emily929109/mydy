import PrimeVue from "primevue/config";

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
