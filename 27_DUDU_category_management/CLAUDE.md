# 專案規範與工作指南

本專案的目的為開發商城分類管理後台，為一個無建置工具的純前端專案。在進行開發與更新時，請遵守以下規範：

## 1. 架構與技術棧

- **核心框架**: Vue 3 (全域 CDN 版本，無建置步驟，使用 Composition API)
- **UI元件庫 / 樣式**: Element Plus, FontAwesome (皆透過 CDN)

## 2. 開發規範

- **無 Import 限制**: 絕對禁止使用 `import` 或 `export` 語法 (ES Modules)，也請勿建立 `.vue` 單文件組件 (SFC)。

- **Vue 初始化與 Composition API**: 所有的 Vue 程式碼都必須直接寫在 HTML 檔案的 `<script>` 標籤中，使用全域的 `Vue.createApp`。在傳統無建置環境中，必須優先使用 `setup()` 函式（Composition API）來撰寫 Vue 邏輯。

- **全域 Vue 物件解構**: 明確規定需從全域的 `Vue` 物件中解構出所需的 API，例如 `const { createApp, ref, reactive, onMounted, nextTick } = Vue;`。

- **避免 Options API**: 逐步淘汰並避免使用 `data`, `methods`, `mounted` 等傳統 Options API 寫法，統一使用響應式 API (`ref`, `reactive`) 以及生命週期 hooks (`onMounted`)。

- **資料驅動**: 避免寫死在 HTML，建議提取成 JavaScript 陣列或物件，並透過 Vue 的 `v-for` 指令進行渲染。

## 3. 資料來源

- 所有的分類資料來源均仰賴後端提供，在開發本專案時請在前端模擬假資料即可
