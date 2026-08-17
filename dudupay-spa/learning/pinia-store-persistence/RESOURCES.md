# Pinia Store 與 localStorage 持久化 Resources

## Knowledge

- [State | Pinia（官方文件）](https://pinia.vuejs.org/core-concepts/state.html)
  Pinia 官方文件對 state 的定義：state 只是被包裝成響應式物件的資料，本質上活在記憶體裡。用於：確認「Pinia 本身完全不管持久化」這個事實的第一手來源。
- [Reactivity Fundamentals | Vue.js（官方文件）](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
  Vue 官方文件說明 `reactive()` 如何把物件包成響應式代理。用於：理解 `stores/registration.ts` 裡 `reactive({ ...defaultStep1Account(), ...persisted.step1Account })` 這行在做什麼。
- [Watchers | Vue.js（官方文件）](https://vuejs.org/guide/essentials/watchers)
  Vue 官方文件說明 `watch()` 與 `{ deep: true }` 選項——深度監看巢狀物件變化時才會觸發 callback。用於：理解 store 裡 `watch([...], persist, { deep: true })` 為什麼要加 `deep: true`（不加的話改欄位不會觸發自動存檔）。
- [pinia-plugin-persistedstate（GitHub / 官方文件）](https://prazdevs.github.io/pinia-plugin-persistedstate/guide/)
  Pinia 生態圈裡最主流的「自動持久化」套件，證實了 Pinia 核心真的沒有內建持久化——這是一個外掛才提供的能力。用於：對照組——dudupay-spa 目前是手寫 `loadPersisted()`/`persist()`，不是用這個套件，讓使用者理解手寫版本在做這個套件會自動做的事。

- [Window: storage event | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
  官方文件明確指出：`storage` 事件**不會在做出改變的那個分頁本身觸發**，只有「其他」共用同源 storage 的分頁才收得到。用於：解釋為什麼不能只靠 `localStorage` 本身當作 Vue 的資料來源——同一分頁內寫入 localStorage 不會有任何東西通知 Vue「該重新算畫面了」。
- [Web Storage API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
  官方文件指出 `localStorage`/`sessionStorage` 的讀寫是**同步**操作，會阻塞主執行緒，資料量大或次數頻繁時會拖慢畫面回應。用於：解釋為什麼不適合把 localStorage 當成「每次畫面渲染都直接讀」的即時資料源。

## Wisdom (Communities)

（目前使用者專注在單一專案裡建立直覺，暫不需要社群資源。之後若想深入 Pinia 生態圈的持久化套件選型，可以回來補 Pinia Discord 或相關 GitHub Discussions。）

## Gaps

- 還沒找到針對「手寫 localStorage 同步 vs 用套件」這個取捨的權威文章，目前是從官方文件反推出兩者差異，之後可以補一篇實務比較文章。
