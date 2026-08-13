# 07 - Step3 RegisterInfoView（基本資料，假資料）

Status: ready-for-agent
Blocked by: 02, 03, 04

## 目標

實作註冊 wizard 第三步，對應現有 `MemberInfo.cshtml`/`memberInfo.js`，驗證大型表單（~25 欄位）的元件拆分與驗證模式。

## 內容

- `src/views/register/RegisterInfoView.vue`（`/register/info`）：發票偏好、身分證字號、姓名、生日、戶籍/通訊地址、緊急聯絡人、任職狀態、信用卡銀行、退款帳戶、LINE ID、申請額度等欄位（比照 `MemberAddController.cs` 的 `MemberInfo_s` 參數列表，見 spec.md）
- 表單依區塊拆分（例如發票/個人資料/聯絡資訊/財務資訊），用 `FormField` 元件組成，避免單一巨型模板
- 送出時寫入 `registration` store 的 `step3Info`，標記 Step3 完成，導向 `/register/twca/consent`

## 驗收

- 必填欄位驗證正確運作
- 表單分區清楚可讀，不是一個 25 欄位攤平的長表單

## 參考

- `spec.md` 元件拆分草案、「現有系統參考事實」Step3 段落
