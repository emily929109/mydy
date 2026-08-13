# 03 - Registration Store（Pinia）與路由/Step Guard

Status: ready-for-agent
Blocked by: 01

## 目標

驗證「多步驟表單跨路由頁面共享狀態、且重新整理不遺失進度」這條完整鏈路，是整個註冊 wizard 架構的骨架。**月 1 不發真實 HTTP request**，各步驟的送出都只是把資料寫進 store。

## 內容

- `src/config/registrationSteps.ts`：定義 7 個步驟的 meta（`path`/`title`/`order`/對應的 store 區塊 key），`RegisterWizardNav`（見 `04`）與路由設定都讀這份 config，不寫死步驟名稱
- `src/stores/registration.ts`（Pinia setup store）：state 依 7 步驟分區（`step1Account`/`step2Upload`/`step3Info`/`step4TwcaConsent`/`step5TwcaClause`/`step6TwcaVerify`/`step7Sign`），另有 `completedSteps` 追蹤進度；用 `watch` 把 state 同步進 `localStorage`（對應現有系統 `localStorage.member` 的行為），初始化時從 `localStorage` 還原
- `src/types/registration.ts`：`RegistrationState` 等 interface
- `src/router/index.ts` 加上 navigation guard：依 `registrationSteps.ts` 的順序，若嘗試直接訪問某步驟但前一步尚未完成（`completedSteps` 未包含），導回第一個未完成的步驟

## 驗收

- 直接用網址列跳到 `/register/info`（Step3）但 Step1/Step2 未完成，會被導回 Step1
- 完成 Step1 後重新整理頁面，`registration` store 的 Step1 資料仍在（從 `localStorage` 還原）

## 參考

- `spec.md`「狀態管理」「路由」列、元件拆分

## Comments

- 2026-08-13：完成。`src/types/registration.ts` 定義 `RegistrationState`/7 個 step 區塊/`StepKey`（`Step3Info` 先鬆寫成 index signature，~25 欄位留給 issue 07 展開）。`src/config/registrationSteps.ts` 是 7 步驟 path/title/order/key 的單一事實來源。`src/stores/registration.ts`（Pinia setup store）7 個區塊各自 `reactive`/`completedSteps` 用 `ref`，`watch(..., { deep: true })` 同步進 `localStorage`（key `dudupay-spa.registration`），初始化時從 `localStorage` 還原；另外提供 `completeStep`/`isStepCompleted`/`firstIncompleteStepPath` 給 guard 跟各 view 用。`src/router/index.ts` 的 `beforeEach` 依 `registrationSteps` 的 `order` 檢查前面步驟是否都在 `completedSteps` 裡，沒有就導到 `firstIncompleteStepPath()`。
- 7 個 view 目前是 placeholder（`src/views/register/*.vue`，只有標題 + 「標記完成並前往下一步」按鈕），真正表單留給 issue 05-09。
- 驗收怎麼測的：這台環境沒有瀏覽器（沒裝 Chrome 擴充套件），改用臨時腳本（`npx tsx`，跑完即刪，不是專案檔案）直接 import 真正的 `registrationSteps.ts`/`registration.ts`（不是重寫一份邏輯來測），模擬「全新狀態訪問 `/register/info`」與「完成 Step1 後重建 store（模擬重新整理）」兩個情境，7 個斷言全過：確認未完成前置步驟時 guard 條件會判定導回 `/register`；完成 Step1 後 `completedSteps`/`step1Account` 資料能從 `localStorage` 還原。vue-router 本身的 `beforeEach` 註冊機制沒有另外測（框架自身邏輯，風險低），如果你想眼見為憑，可以自己跑 `npm run dev` 開 `http://localhost:5173/spa-poc/register/info` 確認會被導回 `/register`。
