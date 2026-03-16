# 19_gemini_cli 專案：Vue 3 組件展示

本專案是一個標準的 **Vite + Vue 3** 應用程式，專注於展示高品質的組件設計與實作，特別是結合了 Material Design for Bootstrap (MDB) 的運用。

## 專案概述
- **目的**：作為可複用 Vue 3 組件與文章列表邏輯的展示平台。
- **核心技術**：
  - **框架**：Vue 3 (使用 `<script setup>` 的 Composition API)
  - **建構工具**：Vite
  - **UI 函式庫**：MDB (Material Design for Bootstrap) 7.2.0 (透過 `index.html` 中的 CDN 引用)
  - **圖標**：FontAwesome 6.0.0
- **專案架構**：
  - `src/main.js`：應用程式進入點。
  - `src/App.vue`：根組件，負責管理文章列表狀態與版面配置。
  - `src/components/`：存放可複用 UI 組件的目錄（例如 `ArticleCard.vue`）。
  - `skills/`：包含技術文件與規範標準（例如 `my-vue-skill.md`）。

## 編譯與執行
請使用以下指令開始開發：

- **安裝依賴**：
  ```powershell
  npm install
  ```
- **啟動開發伺服器**：
  ```powershell
  npm run dev
  ```
- **生產環境打包**：
  ```powershell
  npm run build
  ```
- **預覽生產環境產出**：
  ```powershell
  npm run preview
  ```

## 開發規範
- **語言規範**：**後續所有溝通、註解、文件更新及開發指令皆須使用繁體中文。**
- **組件標準**：務必遵循 `skills/my-vue-skill.md` 中定義的準則。
- **SFC 結構**：統一使用 `<script setup>`、`<template>` 與 `<style scoped>`。
- **Props 定義**：使用 `defineProps` 進行清晰且具備型別定義的屬性設定。
- **樣式風格**：優先利用 MDB 類別以確保 UI/UX 的一致性。針對組件特有的調整請使用 `scoped` 樣式。
- **交互邏輯**：組件內狀態管理統一使用 `ref` 與 `reactive`。
- **程式碼整潔**：包含簡要的組件文件註解，並確保邏輯模組化。

## 關鍵檔案
- `index.html`：包含 MDB CSS/JS 與 FontAwesome 的外部 CDN 連結。
- `src/App.vue`：展示如何在網格佈局中使用模擬數據呼叫 `ArticleCard`。
- `src/components/ArticleCard.vue`：具備高度交互性與樣式設計的卡片組件。
- `skills/my-vue-skill.md`：本工作區建立 Vue 3 組件的基礎核心準則。
