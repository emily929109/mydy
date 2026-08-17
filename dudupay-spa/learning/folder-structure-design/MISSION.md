# Mission: 資料夾結構設計（分層架構）

## Why
理解 dudupay-spa 專案中 `type → config → store → router` 這種分層資料夾結構背後的設計原因，讓自己未來在這個專案裡新增註冊流程步驟、或在其他專案設計類似的表單精靈（wizard）架構時，能自信地決定「新東西該放進哪一層、為什麼」，而不是照抄現有結構卻說不出所以然。

## Success looks like
- 能說出 `type` / `config` / `store` / `router` 各自唯一的職責，以及彼此之間為什麼「只能單向依賴」
- 幫 dudupay-spa 的註冊流程新增一個步驟時，知道要照順序改哪些檔案、為什麼要照那個順序改
- 看到別的專案用類似分層方式時，能認出這個模式，並判斷它是否設計得乾淨（有沒有循環依賴、有沒有 single source of truth）

## Constraints
- 使用者正在 dudupay-spa 這個真實專案裡邊做邊學，教學要盡量直接引用專案裡的實際檔案（`src/types/registration.ts`、`src/config/registrationSteps.ts`、`src/stores/registration.ts`、`src/router/index.ts`），不要用抽象假設範例
- 教學內容使用繁體中文

## Out of scope
- Vue / Pinia 本身的 API 用法（除非直接卡在理解分層原因的路上）
- 其他前端框架的資料夾規範比較（先聚焦在能在這個專案裡建立起的直覺）
