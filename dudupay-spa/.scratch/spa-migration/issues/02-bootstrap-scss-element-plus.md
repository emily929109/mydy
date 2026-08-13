# 02 - Bootstrap SCSS + Element Plus 整合

Status: ready-for-agent
Blocked by: 01

## 目標

確立月 1 的 CSS 架構：Bootstrap（以 SCSS 引入，可覆寫變數）負責版面/網格/utility，Element Plus 負責互動元件（表單、上傳、步驟指示器等註冊 wizard 會大量用到的元件）。

## 內容

- 加入 `bootstrap` 套件（SCSS 原始碼，非預編譯 CSS），在 `src/styles/main.scss` 用 `@import` 引入
- 建立 `src/styles/_variables.scss`，示範至少覆寫一個 Bootstrap 變數（例如主色），驗證「練習 SCSS」這個目的
- 引入 Element Plus 的元件與樣式（可用 auto-import 或手動 `import 'element-plus/dist/index.css'`）
- 在任一頁面同時使用 Bootstrap grid class（如 `.row`/`.col-*`）與至少一個 Element Plus 元件（如 `el-steps`/`el-form`），確認兩者不衝突

## 驗收

- 建置成功，頁面上 Bootstrap 版面與 Element Plus 元件同時正常顯示，無明顯樣式衝突
- `_variables.scss` 至少覆寫一個 Bootstrap 變數且生效

## 參考

- `spec.md` 「CSS」列

## Comments

- 2026-08-13：完成。裝了 `bootstrap`；`src/styles/_variables.scss` 覆寫 `$primary: #e63946`，`src/styles/main.scss` 依序 `@import` functions → 變數覆寫 → `bootstrap/scss/bootstrap`（在 `main.ts` 引入）；Element Plus 用手動方式引入（`import ElementPlus from 'element-plus'` + CSS + `app.use(ElementPlus)`，沒用 auto-import）。`App.vue` 同頁放 Bootstrap `.row`/`.col-md-*`/`.card` 跟 Element Plus 的 `el-steps`/`el-button`。`npm run build` 成功，編譯後 CSS 確認含 `e63946`（變數覆寫生效）與 `.col-md-4`（grid 正常編譯）；`npm run dev` 在 `/spa-poc/` 路徑回 200。Bootstrap 自己的 SCSS 對新版 Dart Sass 色彩函式有大量 deprecation warning（上游已知問題，非本專案程式碼問題），不影響建置結果。未做視覺截圖比對（環境未裝 Chrome 擴充套件），已用建置產物內容驗證取代。
