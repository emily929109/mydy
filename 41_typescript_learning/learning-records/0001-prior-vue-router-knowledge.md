# 已有 Vue Router 基礎，TypeScript 語法是全新的

使用者自述「有一點 Vue Router 的概念」，並指定目標是看懂 `dudupay-spa/src/router/index.ts`。因此教學不需要從 Vue Router 的路由觀念（`createRouter`、`routes`、`beforeEach` 守衛的用途）教起，可以直接假設這些已知，把力氣放在該檔案裡的 TypeScript 語法本身（型別標註、`Record` 泛型、indexed access type、type-only import）。之後設計課程時，遇到「這是 Vue Router 的 API」和「這是 TS 語法」混在一起的地方，應該只解釋後者，避免重複教已知內容。
