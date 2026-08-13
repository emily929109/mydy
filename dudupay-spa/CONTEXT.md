# DuDuPay SPA

DuDuPay 無卡分期購物金流系統的 Vue3 SPA 前端架構驗證。月 1 範圍只做「新會員自助註冊」7 步驟 wizard，全程假資料，不串任何真實或模擬的後端 API。詳見 `.scratch/spa-migration/spec.md`。

業務網域本體（會員/特約商/訂單）由公司 Gitea `mydy/dudupay` repo 維護，本 repo 只是該網域下註冊流程的前端實作，不重複定義業務詞彙，僅在下方補與本 repo 實作直接相關的詞。

## Language

**TWCA 驗證（門號驗證）**:
會員註冊流程中的手機門號實名認證步驟，由 TWCA（台灣網路認證）比對使用者填寫的門號與電信業者資料是否相符。驗證會將瀏覽器整個導離站台到 TWCA 網域，結果由 TWCA 以 server-to-server 方式 POST 回站台設定的 callback 網址，不是單純的前端 API 呼叫。使用者可選擇「門號非本人所有」略過此驗證，直接進入簽署合約步驟。月 1 本 repo 全用前端假資料模擬這個步驟，不呼叫真實 TWCA 或既有後端 proxy（見 [ADR-0001](docs/adr/0001-twca-fixture-not-real-api-month1.md)）。
_Avoid_: 憑證驗證（TWCA 也承辦自然人憑證業務，但此處專指門號 MID 驗證，非讀卡機/憑證流程）
