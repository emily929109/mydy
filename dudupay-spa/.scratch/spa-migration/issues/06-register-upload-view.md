# 06 - Step2 RegisterUploadView（上傳照片，假資料）

Status: ready-for-agent
Blocked by: 02, 03, 04

## 目標

實作註冊 wizard 第二步，對應現有 `UploadFile.cshtml`/`uploadFile.js`，驗證多檔案上傳型頁面的元件拆分模式（不發真實上傳請求）。

## 內容

- `src/views/register/RegisterUploadView.vue`（`/register/upload`）：5 個 `FileUploadSlot`（身分證正面必填、反面必填、第二證件選填、自拍必填、其他證明選填），選檔案當下用 `FileReader` 本地預覽（不真的上傳），比照現有系統「選了就先預覽」的體驗
- 檔案類型/大小驗證比照現有規則（jpg/jpeg/png/gif、上限約 9.9MB）
- 送出時把檔案的假結果（如檔名/預覽 base64）寫入 `registration` store 的 `step2Upload`，標記 Step2 完成，導向 `/register/info`

## 驗收

- 必填欄位未上傳無法送出下一步
- 選擇圖片後立即顯示本地預覽（不用等待任何網路請求）

## 參考

- `spec.md` 元件拆分草案、「現有系統參考事實」Step2 段落

## Comments

- 2026-08-14：完成，經過一輪 `/grill-with-docs` 確認兩個實作分岔點後動手。`FileUploadSlot.vue` 加上檔案型別（`image/jpeg`/`png`/`gif` 白名單）與大小（9.9MB = `9.9 * 1024 * 1024` bytes）驗證，驗證放在元件內部（選檔案當下就摸得到原始 `File` 物件，`FileReader` 讀完就只剩 base64 字串，之後要驗就驗不到了）；不符合就不 emit、顯示元件自己的 `selectionError`，跟 parent 傳進來的 `error`（必填用）疊在同一個錯誤欄位顯示。`RegisterUploadView.vue` 從 placeholder 改成真的表單，5 個 `FileUploadSlot` 直接 `v-model` 綁 `store.step2Upload`（`idFront`/`idBack`/`selfie` 必填，`secondId`/`incomeProof` 選填），比照 05 的模式：`validate()` 在按下「下一步」時檢查必填欄位是否為 `null`，全過才 `completeStep` + 導向 `/register/info`。決定不做現有系統的 400px client resize——月 1 目標是驗證架構本身，這個效能優化細節不在 06 的驗收條件內，之後真的要接真實上傳再加。
- 驗收怎麼驗的：`npx vue-tsc -b` 全過（exit 0）。型別/大小驗證的邊界判斷邏輯另外用臨時腳本複製同一份規則跑了 5 組邊界值（剛好 9.9MB / 超過 9.9MB / 三種允許格式 / 兩種不允許格式），全部符合預期；這份腳本測的是規則本身，不是 `.vue` 檔實際執行的那份程式碼，兩者理論上一致，但之後如果改了元件裡的驗證邏輯要注意這份舊驗證不會自動失效。跟前幾張一樣，這台環境沒有瀏覽器，沒辦法肉眼選檔案點過一次表單。
