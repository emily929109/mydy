# 09 - Step7 RegisterSignView（簽署完成頁，假資料）

Status: ready-for-agent
Blocked by: 02, 03, 04

## 目標

實作註冊 wizard 最後一步，對應現有 `MemberSign2.cshtml`，作為整條假流程的終點。**不重現 webcam 自拍/手寫簽名板/PDF 合約渲染/QR code 跨裝置交接**這些真實互動，用假合約摘要頁呈現「已完成」狀態即可。

## 內容

- `src/views/register/RegisterSignView.vue`（`/register/sign`）：讀 `registration` store 前面 6 步驟收集到的資料，呈現一頁「合約摘要」（假資料排版即可，不用真的渲染 PDF）
- 一個「確認簽署」按鈕，點擊後標記 Step7 完成（寫入 store），顯示「註冊完成」的最終畫面
- 若直接訪問此路由但前面任一步驟未完成（除「門號非本人」跳過分支外），依 `03` 的 guard 邏輯導回未完成的步驟

## 驗收

- 從 Step1 依序完成到 Step6 後，能在此頁看到彙整資料並完成「確認簽署」
- 顯示最終「註冊完成」畫面，作為整條 7 步驟流程跑通的驗收依據

## 參考

- `spec.md` 元件拆分草案、「現有系統參考事實」Step7 段落
