# DuDuPay SPA

DuDuPay Vue 3 SPA 前端專案。

## 技術棧

- [Vue 3]（`<script setup>` SFC）+ TypeScript。
- [Vite] 8 作為建置工具。
- [Vue Router] 5 管理路由。
- [Pinia] 管理全域變數狀態。
- [Element Plus] + [Bootstrap 5]：UI 框架

## 目錄結構

```
src/
├─ main.ts                     # App 進入點：掛載 Pinia / Router / Element Plus
├─ App.vue                     # 根元件，僅渲染 <router-view />
├─ router/
│  └─ index.ts                 # 路由表
├─ stores/
│  └─ registration.ts          # Pinia store
├─ config/
│  └─ registrationSteps.ts     # 定義單一事實來源供組件使用
├─ types/
│  └─ registration.ts          # 型別定義（純型別，零依賴）
├─ fixtures/
│  └─ registration.ts          # 暫存
├─ content/
│  └─ privacyPolicy.ts         # 靜態文案內容
├─ views/register/              # 7 個註冊步驟頁面
│  ├─ RegisterAccountView.vue      (step1 帳號註冊)
│  ├─ RegisterUploadView.vue       (step2 上傳照片)
│  ├─ RegisterInfoView.vue         (step3 基本資料)
│  ├─ RegisterTwcaConsentView.vue  (step4 門號同意)
│  ├─ RegisterTwcaClauseView.vue   (step5 條款同意)
│  ├─ RegisterTwcaVerifyView.vue   (step6 身分驗證)
│  └─ RegisterSignView.vue         (step7 簽署完成)
├─ components/register/
│  ├─ RegisterStepLayout.vue   # 共用頁面骨架：標題、上一步/下一步按鈕
│  ├─ RegisterWizardNav.vue    # 步驟進度導覽列
│  ├─ FormField.vue            # 共用表單欄位元件
│  └─ FileUploadSlot.vue       # 共用檔案上傳元件
└─ styles/
   ├─ main.scss
   └─ _variables.scss
```

## 架構重點

### 單一事實來源（type → config → router / store / nav）

`config/registrationSteps.ts` 定義 7 個步驟的 `key`、`path`、`title`、`order` 陣列，是整個流程唯一的資料來源：

- `router/index.ts` 依此陣列產生路由表，並掛上全域 `beforeEach` 守門：若某步驟前面任一步驟尚未完成，一律導回第一個未完成的步驟。
- `stores/registration.ts` 依此陣列判斷「下一個未完成步驟」（`firstIncompleteStepPath`）。
- `RegisterWizardNav.vue` 依此陣列渲染步驟進度列。

新增/修改步驟只需改這份 config，不必同步改多處。

## 開發

```bash
npm install     # 安裝依賴
npm run dev     # 啟動開發伺服器
npm run build   # 型別檢查（vue-tsc）+ 正式建置
npm run preview # 預覽建置產物
```
