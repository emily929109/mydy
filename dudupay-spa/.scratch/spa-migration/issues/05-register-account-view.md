# 05 - Step1 RegisterAccountView（帳號註冊，假資料）

Status: ready-for-agent
Blocked by: 02, 03, 04

## 目標

實作註冊 wizard 第一步，對應現有 `Register.cshtml`/`register.js`，驗證表單驗證 + 假 OTP + 寫入 store 導頁這條鏈路。

## 內容

- `src/fixtures/registration.ts` 新增假 OTP：任意輸入 6 碼即視為正確（或固定接受 `123456`）
- `src/views/register/RegisterAccountView.vue`（`/register`）：密碼、確認密碼、email、手機、簡訊 OTP、email OTP、推薦碼、同意條款；client-side 驗證比照現有規則（密碼 8-18 碼含大小寫數字、手機 `^09\d{8}$`、email 格式）
- 送出時寫入 `registration` store 的 `step1Account`，標記 Step1 完成，導向 `/register/upload`

## 驗收

- 欄位驗證錯誤時顯示對應錯誤訊息（沿用 `FormField` 元件）
- 假 OTP 輸入正確才能送出；送出後 store 狀態更新、導向 Step2

## 參考

- `spec.md` 元件拆分草案、「現有系統參考事實」Step1 段落

## Comments

- 2026-08-13：完成。`src/fixtures/registration.ts` 新增 `isFakeOtpValid`（任意 6 碼數字視為正確）。`RegisterAccountView.vue` 改成真的表單：密碼/確認密碼/Email/手機/簡訊OTP/EmailOTP/推薦碼（選填）用 `FormField`（`v-model` 直接綁 `store.step1Account` 的欄位，不另外複製一份 local state），同意條款是一個獨立 checkbox（`FormField` 只設計給文字型輸入，checkbox 語意不同，沒有硬塞進去）。驗證規則比照現有系統：密碼 8-18 碼含大小寫英數、手機 `^09\d{8}$`、Email 格式、OTP 用假規則；`validate()` 在按下「下一步」（`RegisterStepLayout` 的 `@next`）時執行，全過才 `completeStep` + 導頁。
- 驗收怎麼驗的：`isFakeOtpValid` 直接 import 真正的 `fixtures/registration.ts` 測；密碼/手機/Email 三個 regex 因為寫在 SFC 的 `<script setup>` 裡沒辦法單獨 import，臨時腳本裡複製了一份同樣的 pattern 測邊界值（測的是 regex 本身的行為，不是元件實際執行那份程式碼，兩者理論上一致但要注意如果之後改了 `.vue` 裡的 regex，這個舊驗證結果不會自動失效）；`completeStep` 後 `firstIncompleteStepPath` 從 `/register` 變成 `/register/upload` 則是直接 import 真正的 store 測，這段沒有失真。跟前幾張一樣，這台環境沒有瀏覽器可以肉眼點過一次表單。
