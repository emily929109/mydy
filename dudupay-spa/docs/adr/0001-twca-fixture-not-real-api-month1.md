# 月 1 註冊 SPA 的 TWCA 驗證步驟用假資料，不串既有後端 proxy

新 SPA 的 `TwcaVerify_1/2/3` 三個步驟，月 1 全部用前端假資料/假延遲模擬（`fixtures/registration.ts`），不呼叫既有 `TwcaController`（`/api/Twca/MIDClause`、`/api/Twca/GetIdno`、`/api/Twca/VerifyM1`）。

原因：TWCA 門號驗證的真實流程會把整個瀏覽器導離站台到 TWCA 外部網域，驗證結果由 TWCA 以 server-to-server POST 送回站台設定的 `ReturnURL`（目前寫死指向舊 MVC 站台的 `/Home/MemberSign2`）。要在新 SPA 接住這個 callback，除了前端改呼叫既有 proxy 外，還需要後端同步調整 `ReturnURL` 設定並可能新增 callback endpoint——這超出「使用者只做前端 SPA、後端不算進這個月工作量」的分工前提，也會讓月 1 的時程綁進一個自己控制不了的外部依賴。

取捨：月 1 驗證不到「SPA 真的能打通 TWCA 導轉+callback」這條鏈路，只驗證得到前端 UI/state 骨架（含 `TwcaVerify_1` 的「門號非本人」合法跳過分支）。真實串接（含 `ReturnURL` 改向新 SPA 網域）留到與後端團隊討論後，作為後續階段的工作。

---
原為 dudupay repo（公司 Gitea `mydy/dudupay`）的 ADR-0006，隨拆 repo 決策（該 repo 的 ADR-0007）一併搬移並重編號。這台機器上不一定會 checkout 到 dudupay repo，所以此處不用相對連結指回去。
