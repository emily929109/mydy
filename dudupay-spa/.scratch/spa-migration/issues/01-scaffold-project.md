# 01 - Scaffold 新 Vue3 + Vite + TS 專案

Status: ready-for-agent

## 目標

在本 repo（`dudupay-spa`，個人 GitHub repo `emily929109/mydy` 底下的 `01_project/dudupay-spa/`，非 `dudupay` 公司 repo 子目錄，見 `dudupay` repo 的 ADR-0007）建立 SPA 專案骨架，作為月 1 註冊 wizard 架構驗證的基礎。

## 內容

- `npm create vite@latest` 建立 Vue3 + TypeScript 專案（`tsconfig.json` 不開 `strict`）
- 加入依賴：`vue-router`、`pinia`、`element-plus`、`sass`（供 SCSS 編譯，見 `02`）
- 建立 `src/router/`、`src/stores/`、`src/views/register/`、`src/components/register/`、`src/config/`、`src/fixtures/`、`src/styles/`、`src/types/` 目錄骨架（見 `spec.md` 的元件拆分草案）
- 設定 Vite `base: '/spa-poc/'`（對應 `10-lab-iis-deploy` 的部署路徑，見 spec.md）
- 確認 `npm run build` 能成功產出 `dist/`

## 驗收

- `npm run dev` 能啟動、`npm run build` 能成功產出 `dist/`
- 專案結構符合 `spec.md` 的元件拆分草案

## 參考

- `spec.md` 決策總覽與元件拆分

## Comments

- 2026-08-13：完成。`npm create vite@latest` + `vue-ts` template，加入 `vue-router`/`pinia`/`element-plus`/`sass`；`tsconfig.app.json` 覆寫 `strict: false`（預設 `@vue/tsconfig` 是 `true`）；`vite.config.ts` 設 `base: '/spa-poc/'`；`src/` 下 8 個骨架目錄已建立；`npm run dev`（確認 `/spa-poc/` 路徑回 200）與 `npm run build`（產出 `dist/`）都驗證過。
