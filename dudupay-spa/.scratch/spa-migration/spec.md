# DuDuPay → Vue3 SPA 遷移：月 1 架構驗證（範圍已 pivot：跑通註冊流程）

**Status:** ready-for-agent（範圍已定案，逐票見 `issues/`）
**Date:** 2026-08-13
**Repo:** 個人 GitHub repo `emily929109/mydy` 底下的 `01_project/dudupay-spa/` 子資料夾（不是公司 Gitea `mydy/dudupay` repo 的子目錄）。拆成獨立 repo 的原因見 `dudupay` repo 的 ADR-0007（避免動到公司 git commit、方便帶回家研究測試）。
**來源:** 技術選型沿用 2026-08-12+13 兩輪 `/grill-with-docs` grilling 定案；本版本是同日再一輪 grilling 對月 1 範圍的 pivot，原始需求：

> 我改變目標了，我想在這一個月內跑通 dudupay 註冊流程，我只要專心把前端架構建起來就好

## 月 1 目標（取代原本「登入→首頁→會員中心→帳單查詢」範圍，不是疊加）

這個月只做「新會員自助註冊」這一條 7 步驟 wizard，**全程假資料，不串任何真實或模擬的後端 API**（含既有 TWCA proxy）。目標是驗證 Vue3 SPA + Vite + Pinia + 多步驟表單這套架構，撐不撐得住一個貼近真實系統複雜度的流程：路由、跨步驟狀態管理與持久化、元件拆分/共用機制、建置與部署流程。

代表流程（用假資料跑過一次，走到簽署完成頁）：

```
Register（帳號註冊）
  → UploadFile（上傳照片）
  → MemberInfo（基本資料）
  → TwcaVerify_1（門號同意，含「非本人」合法跳過分支）
  → TwcaVerify_2（條款，假資料）
  → TwcaVerify_3（驗證，假資料）
  → MemberSign2（簽署完成頁）
```

步驟順序、欄位/畫面內容對應現有 ASP.NET MVC 系統（`dudupay` repo）的 `Register.cshtml`/`UploadFile.cshtml`/`MemberInfo.cshtml`/`TwcaVerify_1~3.cshtml`/`MemberSign2.cshtml`（見下方「現有系統參考事實」）。

**不在月 1 範圍：**

- 原本規劃的登入／首頁／會員中心／帳單查詢
- 所有註冊變體頁面：`_amountup`/`_bobo`/`_easy`/`_updidno`/`_updmobile`/`Registerz`/`RegisterMail`，以及 dealer 合作申請（`UploadFile_dealer`/`UploadFile_dealerAdd`）
- TWCA 真實 API 串接與導轉（見 [ADR-0001](../../docs/adr/0001-twca-fixture-not-real-api-month1.md)）
- `MemberSign2` 的真實互動細節：webcam 即時自拍、canvas 手寫簽名板、PDF 合約即時渲染、PC→手機 QR code 交接——月 1 用假合約摘要頁取代，不重現這些瀏覽器 API

架構刻意設計成「以後加變體是加 config，不是複製整頁」（見「元件拆分」），但變體本身的實作不在這個月工作量內。

## 已定案的技術選型

| 項目 | 決定 | 備註 |
| --- | --- | --- |
| 框架 | Vue 3 Composition API | 不變 |
| 建置工具 | Vite | 不變；不需支援 IE11 |
| 語言 | TypeScript | 不開 `strict`；型別重點放在 `RegistrationState`/store 介面，其餘元件先寫鬆一點，避免學習曲線太陡 |
| 狀態管理 | Pinia | 這個月唯一的 store 是 `registration`（7 步驟跨頁狀態，需要在多個路由頁面間共享/持久化）；用 setup store 語法（就是回傳 ref/函式的 function），不用 Vuex 那套 mutations/actions/getters |
| CSS | Bootstrap（SCSS 引入，可覆寫變數）+ Element Plus | 不變，兩套框架靠 `el-` class 前綴隔離 |
| 路由 | vue-router，navigation guard 讀 `registration` store 的各步驟完成狀態，未完成前一步就直接訪問後面路由會被導回未完成的步驟 | 取代原本「未登入導回 /login」的 guard 邏輯（本月無登入流程） |
| 認證（未來架構，本月不實作） | JWT 從 `HttpOnly` cookie 改成前端 Authorization header；token 存記憶體（Pinia）+ refresh token | 見 `dudupay` repo 的 ADR-0004（同時牽動後端，決策留在該 repo，本 repo 只引用）；本月範圍不含登入頁，此決策留供未來登入頁參考，不影響月 1 工作 |
| TWCA 串接 | 月 1 全用前端假資料，不呼叫既有後端 `TwcaController` proxy；真實串接（含後端 `ReturnURL` 改向新 SPA）留待與後端討論 | 見 [ADR-0001](../../docs/adr/0001-twca-fixture-not-real-api-month1.md) |
| 部署 | 既有 on-prem IIS，不用 Docker | 見 `dudupay` repo 的 ADR-0005（同時涵蓋未來 Core API 部署，決策留在該 repo，本 repo 只引用） |
| 月 1 部署目標 | `test2cms.dudupay.com.tw`（lab 站台）底下虛擬目錄 `/spa-poc/`，手動部署一次；Vite `base` 與 router `base` 設為 `/spa-poc/` | 不變 |
| 測試 | 手動測試即可；有餘力再學自動化 | 不變 |
| 團隊分工 | 使用者只做前端 SPA；後端由另一人/團隊同步進行，不算進這個月工作量 | 不變；TWCA 真實串接需要的後端配合，明確排除在月 1 之外 |

## 元件拆分（月 1 範圍）

```
src/
├── main.ts
├── App.vue
├── router/
│   └── index.ts                    ← 7 個步驟路由 + navigation guard（讀 registration store）
├── stores/
│   └── registration.ts             ← Pinia setup store；state 依 7 步驟分區，localStorage 同步（重新整理不遺失進度）
├── views/
│   └── register/
│       ├── RegisterAccountView.vue      ← Step1 帳號註冊（密碼/email/手機/假OTP/推薦碼/同意條款）
│       ├── RegisterUploadView.vue       ← Step2 上傳照片（5 張：ID正反/其他證件/自拍/收入證明，假上傳）
│       ├── RegisterInfoView.vue         ← Step3 基本資料（~25 欄位）
│       ├── RegisterTwcaConsentView.vue  ← Step4 門號是否本人（含「非本人」跳過分支）
│       ├── RegisterTwcaClauseView.vue   ← Step5 條款同意（假資料）
│       ├── RegisterTwcaVerifyView.vue   ← Step6 選電信商、假驗證通過
│       └── RegisterSignView.vue         ← Step7 簽署完成頁（假合約摘要，不做 webcam/簽名板/PDF）
├── components/
│   └── register/
│       ├── RegisterWizardNav.vue    ← 步驟指示器，讀 `config/registrationSteps.ts`，不寫死步驟名稱
│       ├── RegisterStepLayout.vue   ← 共用外框（標題/上一步/下一步按鈕）
│       ├── FileUploadSlot.vue       ← 單張圖片上傳元件，UploadView 重複用 5 次
│       └── FormField.vue            ← label + input + 錯誤訊息共用元件
├── config/
│   └── registrationSteps.ts        ← 7 步驟的 meta（path/title/順序/store key）；未來變體是加一份新 config，不是複製整頁
├── fixtures/
│   └── registration.ts             ← 假 OTP、假 TWCA 回應、假上傳結果
├── styles/
│   ├── _variables.scss             ← 覆寫 Bootstrap 變數
│   └── main.scss                   ← @import bootstrap source + 自訂
└── types/
    └── registration.ts             ← RegistrationState 等 interface
```

## 相關 ADR

本 repo：

- [ADR-0001: 月 1 TWCA 驗證步驟用假資料，不串既有後端 proxy](../../docs/adr/0001-twca-fixture-not-real-api-month1.md)

`dudupay` repo（跨後端決策，留在該 repo，這裡不搬）：

- ADR-0004：JWT 驗證改用 Authorization Header（未來登入頁參考，本月不實作）
- ADR-0005：新 SPA 部署在既有 IIS，不引入 Docker（同時涵蓋未來 Core API 部署）
- ADR-0007：為什麼本專案拆成獨立個人 repo，不放 `dudupay` 子目錄

## 現有系統參考事實（供實作時查閱，非決策；程式碼位於 `dudupay` repo）

- **Step1 帳號註冊**：`Views/Home/Register.cshtml` + `js/register.js`（740 行）；驗證邏輯是手刻 regex（密碼 8-18 碼含大小寫數字、手機 `^09\d{8}$`、email、OTP 比對、同意勾選），用 `ru` reactive 物件存 `{v, error, msg}`
- **Step2 上傳照片**：`Views/Home/UploadFile.cshtml` + `js/uploadFile.js`；5 個檔案欄位（`ID0A` 身分證正面必填、`ID0B` 反面必填、`ID0Q` 第二證件選填、`ID0L` 自拍必填、`ID0C` 其他證明選填），選檔案當下就個別預覽+上傳（非集中送出），jpg/jpeg/png/gif、上限約 9.9MB，client resize 到最大寬 400px
- **Step3 基本資料**：`Views/Home/MemberInfo.cshtml` + `js/memberInfo.js`；對應後端 `MemberAddController.cs:42` 的 `MemberInfo_s`（~25 個欄位：發票偏好、身分證字號、姓名、生日、戶籍/通訊地址、緊急聯絡人、任職狀態、信用卡銀行、退款帳戶、LINE ID、申請額度等）
- **Step4-6 TWCA 驗證**：`Views/Home/TwcaVerify_1.cshtml`/`TwcaVerify_3.cshtml` + `js/twcaVerify_1.js`/`js/twcaVerify_2.js`/`js/twcaVerify_3.js`；後端 `Controllers/TwcaController.cs`、`Models/TwcaDA.cs`、`CallApi/TwcaApiM1.cs`；`Web.config` 的 `ReturnURL` 目前寫死指向舊站 `/Home/MemberSign2`（見 ADR-0001）
- **Step7 簽署完成**：`Views/Home/MemberSign2.cshtml` + `js/memberSign2.js`（925 行，Vue3 Composition API 寫成但未打包）；讀 `localStorage.member` 判斷是否可進入此頁；webcam/簽名板/地理定位/PC↔手機 QR code 交接/pdf.js 合約渲染/送出到 `/api/Member/FinishRegister`——這些真實互動月 1 不重現
- lab 部署設定：`dudupay` repo 的 `DuDuPay/Properties/PublishProfiles/lab.pubxml`（站台 `test2cms.dudupay.com.tw`，主機 `10.2.8.32`）
- Production 部署設定（不動）：`dudupay` repo 的 `DuDuPay/Properties/PublishProfiles/Production.pubxml`（站台 `www.dudupay.com.tw`）

## Issues

見 `issues/01`–`11`。
