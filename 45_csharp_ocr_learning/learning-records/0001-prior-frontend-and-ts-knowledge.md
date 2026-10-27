# 前端背景：會 JS/TS，C# 是全新的

使用者是 DuDuPay 的前端工程師，熟悉 Vue 3 / JS 的 axios、FormData、Promise，並在 `41_typescript_learning` 學過 TS 的型別標註、`type` 別名、`Record<K,V>` 泛型（見該工作區 LR-0001、LR-0002）。C# 語法本身沒學過。

**Implications**：教 C# 時優先用 JS/TS 對照（`name: string` ↔ `string name`、`Promise<T>` ↔ `Task<T>`、`{ ocr }` ↔ `new { ocr }`），不用從「什麼是型別」「什麼是 async」教起。要特別注意 C# 和 JS 長得像、意思卻不同的地方。例如 `t.Result` 會卡住執行緒等結果，JS 沒有對應的寫法。
