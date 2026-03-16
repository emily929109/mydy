# Skill: Shopping Demo MDB Migration

This skill outlines the standard operating procedure (SOP) for migrating the user interface of the `@18_vue_learning/shopping_demo.html` application from standard Bootstrap 5 to Material Design for Bootstrap (MDB) 7.x.

## 1. 核心載入替換 (Dependency Updates)
- **移除舊版 Bootstrap**：移除原有的 Bootstrap 5 CSS 與 JS CDN 連結。
- **加入 MDB CDN**：
  - **CSS**: `<link href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/7.2.0/mdb.min.css" rel="stylesheet" />`
  - **字體**: 確保保留 Roboto 字體與 FontAwesome，這對 MDB 的視覺效果至關重要。
  - **JS**: `<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/7.2.0/mdb.umd.min.js"></script>`

## 2. 導覽列優化 (Navbar Upgrade)
- **結構替換**：將原本的 `navbar` 加上 MDB 特有的陰影 (`.shadow-3`) 與交互效果類別。
- **按鈕樣式**：將購物車按鈕替換為 MDB 風格的按鈕，例如 `.btn-primary` 或 `.btn-secondary`，並加入 `data-mdb-ripple-init` 以啟用波紋特效。

## 3. 商品卡片重構 (Product Cards)
- **卡片容器**：保留 `.card`，加入 `.shadow-4-strong` 提升立體感。
- **波紋效果 (Ripple)**：在圖片區域包覆 `<div class="bg-image hover-overlay ripple" data-mdb-ripple-init data-mdb-ripple-color="light">` 結構，實現點擊或懸停的 MDB 波紋與遮罩效果。
- **加入購物車按鈕**：將原本自定義的 `.add-cart-btn` 替換為 `.btn .btn-primary` 並加上 `data-mdb-ripple-init`。

## 4. 表單與結帳流程 (Forms & Checkout)
- **輸入框 (Inputs)**：**關鍵步驟**！將所有標準 `<input>` 和 `<textarea>` 包覆在 MDB 的 Floating Label 結構中，並移除原本獨立的 `<label>`（將其移入 `.form-outline` 內）：
  ```html
  <div class="form-outline mb-4" data-mdb-input-init>
    <input type="text" id="inputId" class="form-control" v-model="..." />
    <label class="form-label" for="inputId">標籤文字</label>
  </div>
  ```
- **下拉選單 (Select)**：若使用原版 `<select>`，確保外觀簡潔；若能升級，考慮改為 MDB 風格或保持 `.form-select` 並確保外觀一致。

## 5. 購物車側邊欄 (Sidebar Cart)
- **陰影與按鈕**：移除自定義的生硬設計，為側邊欄容器加上 `.shadow-5`。將刪除按鈕改為 MDB 的紅色按鈕 (`.btn-danger` 或紅色 icon 按鈕)。

## 6. 全局樣式調整 (Global Styling)
- **按鈕特效**：全站所有 `<button>` 應加上 `data-mdb-ripple-init`。
- **自定義 CSS 瘦身**：移除 `<style>` 中為按鈕（如 `.add-cart-btn`）和卡片寫的自定義背景色或陰影，全面依賴 MDB class。

## 執行指令
當接受到「將 UI 轉為 MDB 風格」的指令時，必須嚴格按照上述 1 到 6 點的規範審查目標 HTML 檔案，並進行 DOM 結構與 CSS 類別的替換，確保最終輸出的程式碼具備完整的 Material Design 視覺與交互體驗。
