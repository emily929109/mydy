# 08 - Step4-6 TWCA 三步驟（門號同意/條款/驗證，全假資料）

Status: ready-for-agent
Blocked by: 02, 03, 04

## 目標

實作註冊 wizard 的 TWCA 三步驟，對應現有 `TwcaVerify_1/2/3.cshtml`。**月 1 不呼叫既有後端 TWCA proxy**（見 [ADR-0001](../../../docs/adr/0001-twca-fixture-not-real-api-month1.md)），全部用假資料模擬，但保留「門號非本人」這個正式系統本來就有的合法跳過分支。

## 內容

- `src/views/register/RegisterTwcaConsentView.vue`（`/register/twca/consent`，對應 Step4）：門號是否本人的選擇；選「非本人」直接標記 Step4-6 全部完成，導向 `/register/sign`（比照現有系統 `TwcaVerify_1` 的跳過邏輯）；選「是本人」需勾選同意（Wi-Fi/行動網路）後才能進下一步
- `src/views/register/RegisterTwcaClauseView.vue`（`/register/twca/clause`，對應 Step5）：假的條款內容（`fixtures/registration.ts` 提供固定文字），強制捲到底才能勾同意，寫入假的 `clausever`
- `src/views/register/RegisterTwcaVerifyView.vue`（`/register/twca/verify`，對應 Step6）：選電信商，送出後用假延遲（如 `setTimeout`）模擬驗證中，固定回傳驗證成功
- 三步驟共用寫入 `registration` store 的 `step4TwcaConsent`/`step5TwcaClause`/`step6TwcaVerify`，完成後導向 `/register/sign`

## 驗收

- 選「門號非本人」能直接跳過 Step5/6 進入 Step7
- 選「是本人」需依序完成條款同意、選電信商才能進入 Step7
- 不發出任何呼叫 `/api/Twca/*` 的網路請求

## 參考

- `spec.md`「TWCA 串接」列、[ADR-0001](../../../docs/adr/0001-twca-fixture-not-real-api-month1.md)、「現有系統參考事實」Step4-6 段落
