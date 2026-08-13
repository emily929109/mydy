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
