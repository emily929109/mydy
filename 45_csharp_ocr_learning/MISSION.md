# Mission: C# 基本語法 × 證件辨識（OCR）後端呼叫鏈

## Why
使用者是前端工程師（Vue / JS，學過一點 TS），負責 DuDuPay 註冊流程的「上傳身分證照片」頁。前端拿到 `/api/Upload/PostFormData` 的 HTTP status 和 response 時，要能自己判斷「後端剛剛走了哪條路、在哪一行 return、DB 有沒有寫進去」，不用每次都靠別人解釋或猜。

## Success looks like
- 看到一個 response（例如 `200` + `ocr.status: "fail"` + `http_status: 0`），能指出是 `Utilities.cs` / `IDApi.cs` 的哪一行產生的，以及當下 `z_Member` 有沒有被寫入
- 能分清楚三種「status」：我們後端的 HTTP 碼、`success`、`ocr.status`，以及 OCR 主機的 `http_status`
- 能逐段讀懂 `Upload_register`、`CheckIdIdentify_register`、`IDApi.CheckIdIdentify / Identify / MapResult / Failure` 用到的 C# 語法（方法簽章、`new { }`、try/catch、`Task.Run` + `.Result`、`using`、LINQ `Where().FirstOrDefault()`、`JObject`）
- 能自己決定除錯時中斷點該下在哪

## Constraints
- 教材放在 `07_mydy/45_csharp_ocr_learning`，不混進專案資料夾（沿用 `41_typescript_learning` 的做法）
- 範例一律取自真實檔案：`98_公司專案/後端/Utilities.cs`、`後端/IDApi.cs`，呼叫鏈依據 `~/Downloads/OCR身分證辨識_程式追蹤與修改紀錄.md.txt`
- `UploadController.cs`、`JwtAuthActionFilter_General`、`MemberIdentity.cs` 不在本機，相關說法要標「依追蹤紀錄 / 待確認」
- 用前端已知的 JS/TS 概念當橋樑

## Out of scope
- 自己寫一個 C# 專案、ASP.NET Core、型別系統進階（泛型約束、介面設計等）
- Entity Framework 深入原理（只需讀懂查詢與 `SaveChanges`）
- 修改證件／提高額度流程（`Utilities.Upload → CheckIdIdentify`），除非之後要動到
