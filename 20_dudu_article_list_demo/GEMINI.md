# 專案規範與工作指南 (GEMINI.md)

本專案是一個無建置工具的純前端專案。在進行開發與更新時，請遵守以下規範：

## 1. 架構與技術棧
- **核心框架**: Vue 3 (全域 CDN 版本，無建置步驟)
- **元件庫 / 樣式**: Bootstrap 5, FontAwesome (皆透過 CDN)
- **套件**: Swiper (透過 CDN)

## 2. 開發規範
- **無 Import 限制**: 絕對禁止使用 `import` 或 `export` 語法 (ES Modules)，也請勿建立 `.vue` 單文件組件 (SFC)。
- **Vue 初始化**: 所有的 Vue 程式碼都必須直接寫在 HTML 檔案的 `<script>` 標籤中，使用全域的 `Vue.createApp`。
- **資料驅動**: 請將原本寫死在 HTML 的重複結構（例如輪播圖、文章列表），提取成 JavaScript 陣列或物件，並透過 Vue 的 `v-for` 指令進行渲染。
- **DOM 操作**: 如果有整合依賴 DOM 的第三方套件 (例如 Swiper 或 IntersectionObserver)，務必在 Vue 的 `mounted()` 鉤子內執行，並用 `this.$nextTick()` 包裝，確保 `v-for` 完成渲染後才進行綁定。

## 3. 檔案變更
- 進行前端頁面編輯時，應直接修改對應的 HTML 檔案，將新的資料加入 Vue 實體的 `data()` 函數回傳的物件中，避免直接操作或拷貝大塊的 HTML DOM 結構。
