# Static HTML to CDN Vue Conversion

## 簡介
此文件記錄了將傳統「純手寫 HTML + 複製貼上 DOM 結構」的專案，重構為「基於資料驅動 (Data-driven) 的 Vue 3 CDN 架構」的標準操作程序。這項技能可大幅提升無建置工具前端專案的維護性。

## 適用時機
- 專案沒有使用 Node.js, Webpack, Vite 等打包工具。
- 畫面上存在大量重複的 HTML 結構（如：文章列表、商品卡片、輪播圖項目）。
- 需要更方便地替換或新增資料，但不希望引入完整的現代化前端框架建置流程。

## 執行步驟

### 1. 準備 Vue 3 環境
在 HTML 檔案底部的 `<body>` 關閉標籤前，引入 Vue 3 的全域建置版本：
```html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
```

### 2. 定義 Vue 掛載範圍
找到需要交由 Vue 管理的區域，通常可以直接將 `<body>` 內的主要內容包裝在 `<div id="app">` 中：
```html
<body>
  <div id="app">
    <!-- 原本的頁面結構 -->
  </div>
</body>
```

### 3. 分析與提取資料
檢查 HTML 中的重複結構，將其抽象為資料陣列 (Array of Objects)。例如：
```javascript
const app = Vue.createApp({
  data() {
    return {
      items: [
        { title: 'Item 1', image: 'img1.jpg', link: '/item1' },
        { title: 'Item 2', image: 'img2.jpg', link: '/item2' }
      ]
    }
  }
});
```

### 4. 套用 `v-for` 與資料綁定
刪除多餘的 HTML，保留一個樣板結構，使用 `v-for` 進行迭代，並利用 `v-bind` (或 `:`) 綁定屬性：
```html
<div class="card" v-for="(item, index) in items" :key="index">
  <a :href="item.link">
    <img :src="item.image" :alt="item.title">
    <p>{{ item.title }}</p>
  </a>
</div>
```

### 5. 處理第三方依賴與 DOM 操作
若是原有的 JavaScript 腳本（例如 `window.onload`）中包含了 Swiper 初始化或 `IntersectionObserver` 綁定，需要將這些邏輯移至 Vue 的生命週期中。
- **務必**將這些邏輯放在 `mounted()` 中。
- **務必**使用 `this.$nextTick()` 包裝，確保 Vue 在 DOM 節點完全依照資料產生後再進行初始化。

```javascript
mounted() {
  this.$nextTick(() => {
    // 在這裡初始化 Swiper 等操作 DOM 的套件
    const swiper = new Swiper('.swiper', { ... });
  });
}
```

### 6. 掛載應用程式
在腳本的最後執行：
```javascript
app.mount('#app');
```
