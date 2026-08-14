# Mission: TypeScript 語法與概念

## Why
使用者在維護 dudupay-spa（Vue 3 SPA）專案時，需要看懂專案裡的 TypeScript 程式碼——尤其是 `src/router/index.ts`，這樣才能安心閱讀、修改路由邏輯，不會因為看不懂型別語法而卡住或改壞東西。使用者已有一點 Vue Router 的概念，缺的是 TypeScript 本身的語法和概念。

## Success looks like
- 能逐行讀懂 `src/router/index.ts`，說出每一行在做什麼（type-only import、`Record` 泛型、陣列型別、路由守衛函式的回傳型別等）
- 看到陌生的 TS 語法（例如 `Record<K, V>`、`Type['key']`、`import type`）時，知道那是什麼、為什麼要這樣寫，而不是死記語法
- 能在 dudupay-spa 專案的其他 `.ts` 檔案（如 `src/types/registration.ts`、`src/config/registrationSteps.ts`）中辨認出同樣的語法模式，舉一反三

## Constraints
- 使用者主要在 dudupay-spa repo 裡工作，教學工作區刻意放在 repo 外（`07_mydy/41_typescript_learning`），避免教材檔案混進專案 repo
- 學習素材優先直接取材自 dudupay-spa 專案裡的真實檔案，而非憑空編造的範例

## Out of scope
- Vue Router 本身的用法（使用者已有基礎，不是這次要補的）
- TypeScript 進階型別體操（自訂 conditional types、mapped types 等）——除非之後真的在專案裡遇到才補
