# 04 - RegisterStepLayout 與共用元件

Status: ready-for-agent
Blocked by: 01, 03

## 目標

建立 7 個註冊步驟共用的外框與表單元件，是回應「以後加變體不要複製整頁」這個需求的核心機制。

## 內容

- `src/components/register/RegisterWizardNav.vue`：步驟指示器（可用 `el-steps`），讀 `config/registrationSteps.ts` 渲染，並依 `registration` store 的 `completedSteps` 標示目前進度
- `src/components/register/RegisterStepLayout.vue`：共用外框（標題、`<slot>` 放各步驟內容、上一步/下一步按鈕），各 view 都套用這個 layout 而不是各自刻版面
- `src/components/register/FormField.vue`：label + input + 錯誤訊息的共用元件，後續各步驟表單重複使用
- `src/components/register/FileUploadSlot.vue`：單張圖片上傳元件（含預覽），供 `06` 的 Step2 重複用 5 次

## 驗收

- 7 個 view（`05`–`09` 建立完成後）都套用同一個 `RegisterStepLayout`，`RegisterWizardNav` 正確反映目前所在步驟與已完成步驟
- `FormField`/`FileUploadSlot` 至少各被兩個不同步驟重複使用

## 參考

- `spec.md` 元件拆分草案

## Comments

- 2026-08-13：完成。`RegisterWizardNav.vue` 讀 `registrationSteps` 渲染 `el-steps`，目前所在步驟依當前路由算 `active` index，已完成步驟另外用 `store.isStepCompleted()` 蓋 `status="success"`（跟 `active` 的自動判斷分開算，因為「非本人」跳過分支之類的情境下，已完成步驟不一定等於「index 小於目前所在頁」）。`RegisterStepLayout.vue` 提供標題（讀 `registrationSteps` 的 `title`）、`<slot>` 放步驟內容、上一步按鈕（layout 自己處理導頁）、下一步按鈕（只 `emit('next')`，實際要不要驗證/完成哪個 store 欄位交給各 view 自己決定，layout 不管業務邏輯）。`FormField.vue`/`FileUploadSlot.vue` 已建好（`v-model` 介面、`FileUploadSlot` 用 `FileReader` 轉 base64 本地預覽），但兩個都還沒有實際使用者——月 1 的表單欄位要到 issue 05-07 才會寫，這點驗收條件本文也用「（05–09 建立完成後）」註明是之後才會成立，不是本張的範圍。
- 7 個 placeholder view 都已改用 `RegisterStepLayout`（`grep -L RegisterStepLayout src/views/register/*.vue` 沒有漏掉的），`npm run build`（`vue-tsc -b` 型別檢查 + `vite build`）過；dev server 起來後 7 條路由都回 200。沒有瀏覽器可以肉眼確認 `el-steps` 視覺效果（跟前幾張一樣的環境限制），這塊风险較低（Element Plus 自己的元件邏輯），沒有另外寫驗證腳本。
