# Notes

- 使用者偏好繁體中文授課內容（與 `learning/folder-structure-design/` 一致）。
- 教學要直接對應 dudupay-spa 專案的真實檔案（`src/stores/registration.ts`），不要用抽象假設範例。
- 使用者對 Pinia 的既有認知只到「可以存全域變數」，第一課要從這個起點出發，不要預設他已經懂 setup store 語法（`ref`/`reactive`/回傳物件）细節——遇到時順手解釋，但不要離題展開。
- 這個 workspace 跟 `learning/folder-structure-design/` 是同一個專案（dudupay-spa）裡的兩個獨立 mission，故意分開資料夾：folder-structure-design 那份 MISSION.md 明確把「Pinia 本身的 API 用法」列為 out of scope，所以 Pinia + localStorage 這題另開一個 workspace。
- assets（style.css、quiz.js）是從 `learning/folder-structure-design/assets/` 複製過來的共用元件，維持兩個 workspace 視覺一致。
