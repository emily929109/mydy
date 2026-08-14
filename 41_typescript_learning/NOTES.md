# Notes

- 教學動機：使用者要維護 dudupay-spa（Vue 3 SPA），目標是看懂 `src/router/index.ts`。已有一點 Vue Router 概念，TypeScript 本身是新的。
- 教學工作區位置：使用者選擇放在 `07_mydy` 底下開新獨立資料夾（而非塞進 dudupay-spa repo 內），沿用之前 `39_aspnet_mvc5_bundling` 的做法，避免教材檔案混進正式專案的 repo。
- 素材來源：dudupay-spa 是本機真實可讀的 repo（跟 `39_aspnet_mvc5_bundling` 那次不同，那次目標專案不在本機、只能靠使用者回報），可以直接引用專案裡的真實程式碼當範例，不用憑空舉例。目標檔案 `src/router/index.ts` 用到 type-only import、`Record<K, V>` 泛型、indexed access type（`Type['key']`）、陣列展開等語法。
