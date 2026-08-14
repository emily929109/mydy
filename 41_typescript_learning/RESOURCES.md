# TypeScript 語法與概念 Resources

## Knowledge

- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
  官方手冊，涵蓋最基本的型別標註（`string` / `number` / `boolean` / 陣列 / 聯集型別...）。Use for: 看不懂任何基本型別標註時的第一站。
- [TypeScript Handbook: Everyday Types — Type Aliases](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases)
  官方手冊中 `type` 別名的定義，含字串字面值聯集的範例。Use for: 理解 `types/registration.ts` 裡的 `export type StepKey = 'a' | 'b' | ...`。
- [TypeScript Handbook: Type-Only Imports and Export](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)
  官方手冊，解釋 `import type { ... }` 和行內 `type` 修飾兩種寫法，以及為什麼型別 import 在編譯後會被整行刪掉。Use for: 理解 `router/index.ts` 第 1、4 行的 import。
- [TypeScript Handbook: Utility Types — Record](https://www.typescriptlang.org/docs/handbook/utility-types.html)
  官方手冊中 `Record<K, T>` 等內建工具型別的定義與範例。Use for: 理解 `router/index.ts` 裡的 `Record<StepKey, RouteRecordRaw['component']>`。
- [TypeScript Handbook: Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)
  官方手冊，解釋 `Type['key']` 這種「從型別裡取出某個屬性的型別」語法。Use for: 理解 `RouteRecordRaw['component']`。
- [Vue.js: Using Vue with TypeScript](https://vuejs.org/guide/typescript/overview)
  Vue 官方文件，說明 Vue 生態系（含 vue-router）如何內建 TypeScript 型別支援。Use for: 理解為什麼 `RouteRecordRaw` 這類型別可以直接從 `'vue-router'` 匯入、以及為什麼專案要用 `import type`。
- [TypeScript Handbook: Everyday Types — Arrays](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays)
  官方手冊，`Type[]` 陣列型別語法。Use for: 理解 `router/index.ts` 裡的 `const routes: RouteRecordRaw[]`。
- [MDN: Spread syntax (...)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
  純 JavaScript 語法（非 TS 專屬），陣列/物件展開運算子。Use for: 理解 `router/index.ts` 裡 `...registrationSteps.map(...)` 這種寫法。

## Wisdom (Communities)

（尚未建立——使用者目前專注在讀懂手上這份專案的程式碼，還沒有表達加入社群討論的需求。之後若想找地方問進階問題，可以考慮 TypeScript 官方 Discord 或 Stack Overflow 的 `typescript` tag。）

## Gaps

- 還沒有針對「如何在既有 Vue 3 + TS 專案中『讀』程式碼」這件事本身的專門教材；目前策略是官方手冊（語法本身）+ dudupay-spa 專案原始碼（真實情境）交叉教學。
