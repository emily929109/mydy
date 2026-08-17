# Notes

- 使用者偏好繁體中文授課內容。
- 教學要直接對應 dudupay-spa 專案的真實檔案（`src/types`、`src/config`、`src/stores`、`src/router`），不要用抽象假設範例 —— 這是使用者目前正在工作的真實 codebase。
- 使用者一開始就自己觀察出「type → config → store → router，後者依賴前者」的依賴方向，但還不懂「為什麼」要這樣設計。Lesson 0001 補的是這個「為什麼」的知識缺口，不是重新介紹依賴方向本身。
- 教學工作區位置：`learning/folder-structure-design/`（專案內子資料夾，會被 git 追蹤；是否要 gitignore 由使用者之後決定）。
