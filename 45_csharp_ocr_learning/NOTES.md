# Notes

- 使用者：前端工程師（Vue 3 / JS），之前在 `41_typescript_learning` 學過 TS 型別標註、`type`、泛型 `Record<K,V>`。可以用 TS 寫法當 C# 對照橋樑（例如 `name: string` ↔ `string name`）。
- 偏好繁體中文教材、真實專案程式碼當範例（不要編造範例）。
- 目標檔案：`98_公司專案/後端/Utilities.cs`（`Upload_register` :349、`CheckIdIdentify_register` :700、`OcrResult` :842）、`後端/IDApi.cs`。呼叫鏈文件：`~/Downloads/OCR身分證辨識_程式追蹤與修改紀錄.md.txt`。
- 本機沒有 `UploadController.cs`、`JwtAuthActionFilter_General`、`MemberIdentity.cs`；`MemberController.cs:47` 的 `GetAuthMember` 用 `HttpResponseException(401)`，可當參考。

## 課程路線（暫定）
1. 前端拿到的 response 是從哪一行 return 的（方法簽章、`new { }`、try/catch、三層 status）✅
2. `CheckIdIdentify_register` 的分支：if/else、`using`、LINQ `Where().FirstOrDefault()`、EF `SaveChanges` → ok / duplicate 與 DB 寫入
3. `Task.Run` + `t.Result`：為什麼上傳要等、跟 JS 沒 await 的對比
4. `IDApi`：HttpClient、502 重試迴圈、`Failure`、各種 catch → `http_status` 何時是 0
5. 下一頁 `MemberInfoInit` 讀回 DB；整條鏈的除錯中斷點

## 之後可以拿來當教材的觀察
- `Utilities.cs:358` `Request.CreateResponse(UnsupportedMediaType)` 建了 response 卻沒 return，等於沒作用（非 multipart 也會繼續往下）。適合在講「return vs 只是呼叫」時當例子。
- `Utilities.cs:351` `MemberIdentity.Require` 在所有 try 之外。
- 追蹤紀錄說 `http_status: 0` = 「沒收到 OCR 回應」，但讀 IDApi.cs 發現 MapResult（:110–:125）的失敗也沒帶碼 → 也是 0。速查表已照程式碼修正；Lesson 4 要講這點。
