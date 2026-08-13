# 11 - 手動 Smoke Test（自動化為加分項）

Status: ready-for-human
Blocked by: 10

## 目標

確認整條註冊 wizard（Step1–7）在 lab 環境（`10`）上實際可走通。月 1 預設手動測試即可；若時間允許，可額外補自動化測試作為加分項，非必要交付。

## 內容

- 手動在 `https://test2cms.dudupay.com.tw/spa-poc/` 依序操作：`Register`（假帳密/假OTP）→ `UploadFile`（假上傳）→ `MemberInfo`（假資料）→ `TwcaVerify_1`（先測「非本人」跳過分支，再測「是本人」完整走 2/3）→ `MemberSign2`（確認簽署）→ 確認顯示「註冊完成」畫面
- 額外測：重新整理頁面確認進度不遺失、直接用網址跳到後面步驟確認會被導回、`console` 無 error
- （加分項，非必要）若有餘力，補一個 Playwright/Cypress e2e smoke test 涵蓋上述路徑

## 驗收

- 手動流程全部走通（含「門號非本人」跳過分支），無 console error
- 重新整理與跳步驟的邊界情況行為符合預期
- （加分項達成時）e2e smoke test 綠燈

## 參考

- `spec.md`「測試」列
