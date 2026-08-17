# Mission: Pinia Store 與 localStorage 持久化

## Why
使用者正在維護 dudupay-spa 的註冊精靈（7 個步驟的表單），使用者原本以為 Pinia store 只是「記憶體裡的全域變數」，但讀 `src/stores/registration.ts` 時發現裡面直接呼叫 `localStorage.getItem`/`setItem`，搞不懂兩者的關係。目標是讓使用者能正確分清楚「Pinia 負責什麼、localStorage 負責什麼」，這樣未來修改或新增 store 欄位時，才不會不小心漏掉某段邏輯，導致使用者填到一半重新整理頁面就把資料弄丟。

## Success looks like
- 能說出「如果把 store 裡所有 localStorage 相關程式碼拿掉，重新整理頁面後會發生什麼事、為什麼」
- 能指著 `src/stores/registration.ts` 的真實程式碼，講出 `loadPersisted()`、`reactive({...default, ...persisted})` 合併預設值、`watch(..., { deep: true })`、`persist()` 這四段各自在解決什麼問題，以及為什麼要照這個順序接起來
- 幫這個 store 新增一個新欄位時，知道要同時改哪幾個地方（預設值函式、`PersistedShape` 型別、`reactive` 初始化），才不會漏掉一處導致「改了資料，重新整理後又消失」的 bug

## Constraints
- 使用者正在 dudupay-spa 這個真實專案裡邊做邊學，教學要直接引用 `src/stores/registration.ts` 的實際程式碼，不用抽象假設範例
- 教學內容使用繁體中文
- 使用者對 Pinia 的既有認知：「可以存全域變數」——這是起點，不是要重新從零教 Pinia

## Out of scope
- Pinia getters / actions 的進階用法（除非直接卡在理解 store + localStorage 關係的路上）
- 其他持久化方案的比較（IndexedDB、cookie、`pinia-plugin-persistedstate` 這類套件的實際導入）——先聚焦在看懂目前這份手寫程式碼在做什麼、為什麼要手寫
- 跨分頁同步（`storage` event）——目前程式碼沒做這件事，不需要現在教
