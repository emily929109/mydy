# 10 - Lab IIS 部署（test2cms.dudupay.com.tw/spa-poc）

Status: ready-for-human

## 目標

把 `01`–`09` 完成後的 `dist/` 手動部署到 lab 站台的虛擬目錄，驗證整條建置＋部署管線可行（`dudupay` repo 的 ADR-0005）。需要實體伺服器/IIS 管理權限，非單純程式碼變更，標記 `ready-for-human`。

## 內容

- 在 `test2cms.dudupay.com.tw`（站台設定見 `dudupay` repo 的 `DuDuPay/Properties/PublishProfiles/lab.pubxml`，主機 `10.2.8.32`）底下新增虛擬目錄 `/spa-poc/`
- 確認 Vite `base`（`01` 已設）與 vue-router 的 `base` 都對應 `/spa-poc/`
- 在該虛擬目錄設定 IIS URL Rewrite 規則：非靜態資源的路徑一律 fallback 回 `index.html`，讓 vue-router 接手
- 手動 build（`npm run build`）後把 `dist/` 內容複製上去
- 用瀏覽器實際訪問 `https://test2cms.dudupay.com.tw/spa-poc/`，跑一次完整註冊 7 步驟

## 驗收

- 直接訪問子路徑下的深層路由（如重新整理 `/spa-poc/register/info`）不會 404，URL Rewrite fallback 正常運作
- 靜態資源（JS/CSS/圖片）路徑正確，無 404

## 參考

- `spec.md`「部署」列、`dudupay` repo 的 ADR-0005、`DuDuPay/Properties/PublishProfiles/lab.pubxml`
