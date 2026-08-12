# 交接文件：DuDuPay → Vue3 SPA 遷移 — Grilling Session

**日期：** 2026-08-12
**Repo：** `C:\Users\emily\Desktop\emily\04_dudupay\04_git版控\dudupay`（分支 `feature/20260817`，git remote：自架 Gitea `http://10.2.8.17:3000/mydy/dudupay.git`）
**Session 類型：** `/grill-with-docs`（= `/grilling` skill + `/domain-modeling` skill），由使用者原始提問觸發：

> 如何將本專案在一個月內換成spa架構，大致工具如下: VUE3 composition api SPA / vite / UI框架沿用: bs element plus / deploy 方式：請推薦業界常用的方式 / 組件如何拆分：請協助我構思

**狀態：** 進行中。Frontier（尚待決策的前緣）**尚未清空**——請勿將本文件視為最終定案。`/handoff` 指令在 Q15 剛回答完、下一輪問題尚未提出之前，中斷了這個 session。

**Session 中途記錄的使用者偏好：** 使用者要求之後全部改用繁體中文（中文）回覆。請繼續以中文進行。

---

## 這個 session 是什麼（接續時的基本規則）

這是依照 `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/grilling/SKILL.md` 進行的 **grilling session**：

- 以「輪」為單位推進一棵決策樹。**Frontier（前緣）** = 所有前置條件已底定、但本身尚未決定的開放決策。每輪把整個 frontier 一次全部編號列出，每題附上推薦答案（➡️），等使用者回答完再進下一輪。
- **事實查證是 agent 的工作，絕不是使用者的工作。** 派出 sub-agent（Explore/general-purpose）去程式碼庫裡找事實；只把真正需要「決策」的部分丟給使用者。
- Session 只有在 frontier 清空、且使用者確認雙方理解一致時才算結束。**目前尚未到那個階段。**
- 同時也在跑 `domain-modeling` skill（`.../skills/engineering/domain-modeling/SKILL.md`）：當領域用語逐漸成形時，就地更新 `CONTEXT.md`；只有當某個決策同時符合「難以逆轉 + 出乎意料 + 存在真正的取捨」時，才提議寫 ADR（格式見 `.../domain-modeling/ADR-FORMAT.md`）。**本 session 目前尚未寫過任何 `CONTEXT.md` 更新或 ADR**——見下方「可能的 ADR 候選項目」。

這個 repo 的 `CLAUDE.md` 也記載了一些值得在接續前先確認的 repo 慣例：

- Issue tracker：`.scratch/<feature>/` 底下的 markdown 檔（見 `docs/agents/issue-tracker.md`）——一旦 grilling frontier 清空，這份計畫大概就該轉成該處的 spec 文件，例如 `.scratch/spa-migration/`。
- Triage 標籤文件：`docs/agents/triage-labels.md`。
- 領域文件配置：單一 context——repo 根目錄下的 `CONTEXT.md` + `docs/adr/`（見 `docs/agents/domain.md`）。目前 repo 根目錄的 `CONTEXT.md` 只記載了訂單／出貨／消息公告（news-banner）的領域用語——尚未有任何關於這次遷移的內容。

---

## 已確認的事實（來自 sub-agent 的調查——尚未寫入任何檔案，目前唯一的紀錄就是這份文件）

### 現行技術堆疊

- **後端：** ASP.NET MVC 5 / Web API 2，跑在 **.NET Framework**（非 .NET Core）上，C#。方案檔為 `DuDuPay.sln`，共 8 個專案：`DuDuPay`（主要對客戶端的應用程式，170 個 view、42 個 controller、181 個 JS 檔）、`DuDuAdmin`（後台，27 個 view）、`DuDuApi`、`Einvoice`、`CallApi`、`PDF`、`AI_LOC`、`WindowsFormsApp1`。
- **前端：** 伺服器端渲染的 Razor（`.cshtml`）、jQuery 3.6.0 + Bootstrap 5.1.3，完全沒有建置工具（沒有 webpack/vite/gulp，應用層也沒有 `package.json`）。打包是透過 ASP.NET 的 `BundleConfig`。
- **repo 內完全沒有既有的 Vue、沒有 Element UI/Plus、也沒有 client-side router。**
- **部署：** 100% 手動——透過 Visual Studio MSDeploy 發佈設定檔（`DuDuPay/Properties/PublishProfiles/Production.pubxml`、`lab.pubxml`）部署到自架 IIS（`MSDeployServiceURL: http://10.2.8.32`，網站為 `www.dudupay.com.tw`）。**完全沒有 CI/CD。**
- **領域：** `CONTEXT.md` 描述 DuDuPay 是「無卡分期購物金流系統」——特約商（dealer）後台 + 會員（member）前台。

### 認證機制 — 重要、非直覺的發現

這**不是**兩套並行的認證系統（cookie vs JWT）。而是**單一的自訂機制：JWT 存放在 HttpOnly cookie 裡**，而不是走 `Authorization` header：

- `DuDuPay/App_Start/Startup.Auth.cs:40-41,58` —— `UseCookieAuthentication`/`UseExternalSignInCookie`/`UseOAuthBearerTokens`——這是未被使用的 ASP.NET Identity 骨架程式碼，controller 完全沒有依賴它。
- `DuDuPay/Controllers/AuthCookieHelper.cs` —— 真正的機制所在。登入時建立一組 JWT（`Jose.JWT.Encode`，HS256，密鑰來自 `Web.config` 的 `Encryption_Decryption_key`），payload 包含 `member_id/role/idno/mobileno/expiredTime/...`。共兩組 token：`Token_g`（一般用途，效期 24 小時）與 `Token_c`（消費專用，效期約 2 小時）。皆以 `HttpOnly; Secure` cookie 寫入。
- `DuDuPay/Controllers/JwtAuthActionFilter_General.cs`（以及同類的 `_Consume`，還有 `DuDuApi/Controllers/JwtAuthActionFilter_API.cs` 裡另一份副本）——Web API 的 `ActionFilterAttribute`。它會檢查 `Authorization: Bearer` header **是否存在**（第 21 行）作為一道關卡，但**實際解碼的 token 其實來自 `Token_g` cookie**（第 33-37 行），而不是 header 裡的值。解碼後的 payload 會存進 `RouteData.Values["AuthMember"]`。
- `DuDuPay/Layout/JwtAuthObject.cs` —— JWT payload 的結構定義。

### 首頁／會員前台（選定的試點區域）— 詳細盤點

- `HomeController.cs`（750 行）**沒有 `[Authorize]`，也沒有 server-side model binding**——每個 action 都只是 `return View()`。所有真實資料都是前端透過 axios 拿的。這對 SPA 遷移來說是個利多（routing 可以直接變成純前端 client route）。
- **`Views/Home` 底下約有 140 個 `.cshtml` 檔**，其中約 25 個是 `Test*`／開發用檔案（排除），另有一部分是特約商相關頁面（排除——屬於另一塊獨立的「Dealer」區域）。真正屬於會員前台的頁面約 **100 多頁**，包括：MemberSign2/TwcaVerify 系列（多步驟電子簽名 + TWCA 身分驗證，在註冊／額度提升／換證／換手機號等多種情境下重複使用）、MemberCenter/Account/MemberOrder、Purchase（購物車/結帳）、ProductList/StoreList/OnlineStore（商城）、AmountUp（額度提升）、PayBank/PayStore（還款）、靜態/CMS 頁面（關於我們/最新消息/常見問答/隱私權等）、Login/Register/Forget/ResetPassword。
- **既有的 JSON API 已經覆蓋了大部分需求**：`MemberController`、`MemberCenterController`、`OrderController`、`AccountController`、`TwcaController`、`UploadController`、`AnonymousOTPController`、`ForgetController` 全部都是已經套用 `JwtAuthActionFilter_General`/`_Consume` 保護的 `ApiController`。
- **已知的 API 缺口：** `ProductList.cshtml`/`StoreList.cshtml`——快速掃描沒有找到可用的 JSON endpoint（`productList.js`/`storeList.js` 裡看不到 axios 呼叫；可能是靜態資料或寫死的內容）。**使用者已在 Q15 決定將此項排除在第一個月範圍外。**
- **一大利多：** `header.js`（603 行，導覽列/登入/購物車角標/會員狀態）、`memberSign2.js`（925 行，多步驟精靈狀態機）、`purchase.js`（859 行，購物車/結帳，從 `localStorage` 讀取 `member`）、`common.js`（691 行，共用工具/axios 攔截器）、`memberCenter.js`——**這些檔案已經是用 Vue 3 Composition API 寫的**（`ref`/`reactive`），只是透過未打包的 `<script>` 標籤，各自掛載到獨立的 `<div id="xxxApp">` 上。所以這次遷移主要是「重整成 SFC + 導入 Vite build」，而不是「從零重寫」。
- `_Layout.cshtml` —— 全域 CSS、左側導覽 Vue app（`#menuLeftApp`）、頂部導覽 Vue app（`#menuTopApp`，**內嵌了登入/特約商登入 modal**）、購物車側邊欄、頁尾。新的 SPA layout 需要：具備認證感知能力的 header/nav、登入 modal、頁尾、購物車側邊欄，這些都要拆成共用元件。
- 目前的認證檢查是**前端做的**（`header.js`/`memberCenter.js`/`purchase.js` 裡檢查 `localStorage.getItem('member')`），再加上**在 API 層做伺服器端檢查**（透過 JWT filter）。Razor view 本身對任何人都會渲染；真正的權限管控是發生在呼叫 API 的當下。

---

## 本 session 已確認的決策（Q1–Q15，依提問順序）

| #   | 主題               | 決策                                                                                                                                                                                                                             |
| --- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | 遷移範圍           | **漸進式（strangler pattern）** — 新舊並存，逐步蠶食，非整站重寫                                                                                                                                                             |
| Q2  | 團隊時程           | **1人全職一個月**（後由 Q10 釐清：僅限前端）                                                                                                                                                                                 |
| Q3  | 部署環境限制       | **公司內部機房/自架主機**（on-prem IIS，非雲端）                                                                                                                                                                             |
| Q4  | 瀏覽器支援         | **不需要 IE11**，現代瀏覽器即可（Vite 原生 ESM，無需 legacy build）                                                                                                                                                          |
| Q5  | 程式碼庫結構       | **獨立新 repo**（非 monorepo）                                                                                                                                                                                               |
| Q6  | 共存＋認證方向     | （原三選一被使用者用自由文字回答取代）**後端也會同時升級成 ASP.NET Core Web API**                                                                                                                                            |
| Q7  | API 缺口範圍       | **後端會做新的 API**（隱含：由另一團隊/人力負責，不算進這位前端工程師的一個月範圍——Q10 確認）                                                                                                                               |
| Q8  | CI/CD 工具鏈       | **都沒有，需要從零建置**（自架 Gitea `10.2.8.17:3000`，是否已啟用 Gitea Actions **尚未確認**）                                                                                                                              |
| Q9  | 試點業務優先序     | 原選 **Home／會員前台**（消費者常用頁）→ 後由 Q14 進一步縮小                                                                                                                                                                 |
| Q10 | 團隊分工           | **使用者只負責前端 SPA**，後端 Core API 由別的人/團隊同步做（⚠️ 此題透過 AskUserQuestion 送出時被使用者以 `/handoff` 前一輪的「請求釐清」中斷，答案是從被拒絕的 tool call 中使用者已勾選的草稿值取得，我在對話中口頭覆述過一次、使用者未糾正，視為已確認但**建議下一輪再明確覆核一次**） |
| Q11 | Core API 部署方式  | **繼續用 IIS 托管（ASP.NET Core Module），不用 Docker**（同 Q10，來源與確認狀態相同，**建議覆核**）                                                                                                                         |
| Q12 | 認證機制           | 使用者主動追問「本專案從哪裡看出 cookie 和 jwt 驗證」→ 我讀碼給出上方「JWT-in-cookie」的具體證據 → 使用者決定：**改成 JWT-in-Authorization-header**（從目前的 JWT-in-HttpOnly-cookie 模式改過來，前端要自己存 token 並每次手動帶上）                          |
| Q13 | 前端 Token 儲存    | **記憶體（Pinia store）＋ Refresh Token** 機制（非 localStorage，防 XSS 竊取；隱含後端要新增 refresh endpoint）                                                                                                              |
| Q14 | 一個月實際交付範圍 | 從「整個 Home 區域（100+ 頁）」縮小為：**登入 + 首頁 + 會員中心 + 帳單查詢**（MemberSign2/TwcaVerify 簽署驗證家族、Purchase 購物結帳、AmountUp 額度提升、ProductList/StoreList 商城，**皆排除在月 1 範圍外**）              |
| Q15 | 商品列表 API 缺口  | **排除在這個月範圍外**，等後端補齊後再排入下一輪遷移                                                                                                                                                                         |

**重要提醒：** Q10/Q11 的確認方式稍微不夠踏實（見上方註記）——下一輪一開始最好用一句話重新確認一次，而不是默默假設已經定案。

---

## 已提出但**尚未經使用者確認**的內容

以下是我用文字段落提出、而非透過 AskUserQuestion 正式提問的內容，因此**它們是等待明確拍板的提案**，不是已定案的決策：

1. **部署流程建議：** Gitea Actions（自架 runner）→ `vite build` → 用腳本把 `dist/` 複製進 IIS 的虛擬目錄 → 用 IIS URL Rewrite 模組做 SPA fallback（找不到對應路徑時導回 `index.html`，交由 vue-router 接手）。選擇此方案的原因是它不會在現有的自架 IIS 環境中額外引入 Nginx 或容器平台。**尚未詢問他們的 Gitea 實例是否真的有啟用 Gitea Actions（Q8 的待釐清子項目）。**
2. **元件樹草案**（在 Q14 縮小範圍之前寫的——需要往下修訂，只保留 Login/Index/MemberCenter/Account/MemberOrder + 共用 Layout，依 Q14 拿掉 Purchase/AmountUp/memberSign/商城相關資料夾，因為這些已不在月 1 範圍內）：
   ```
   src/
   ├── layouts/MainLayout.vue        ← 取代 _Layout.cshtml（header/nav、登入 modal、頁尾）
   ├── router/                       ← vue-router
   ├── stores/ (Pinia)
   │   └── auth.ts                   ← JWT 記憶體儲存 + refresh，取代 localStorage 的 'member' 檢查
   ├── views/
   │   ├── auth/                     ← Login（Register/Forget 是否延後？— 尚未詢問）
   │   ├── home/                     ← Index
   │   └── memberCenter/             ← MemberCenter、Account(2)、MemberOrder（帳單查詢）
   └── components/
   ```

## 尚未解決的 Frontier（下一輪必須提出的問題）

以下是這個被中斷的 session 尚未觸及的開放決策：

1. **URL/路徑切換機制** —— `HomeController` 目前用同一套路由模式，在 `www.dudupay.com.tw` 上同時服務所有 Home 底下的路徑（無論在不在遷移範圍內）。需要決定 IIS URL Rewrite 具體要把哪些路徑導給新 SPA（例如 `/`、`/Login`、`/MemberCenter`、`/Account`、`/MemberOrder`），哪些繼續留在舊有的 MVC（其餘所有：Purchase、AmountUp、MemberSign2/TwcaVerify、ProductList/StoreList、靜態頁面）。這是目前最大、尚未解決的架構問題，也卡住了部署建議的最終定案。
2. 新 Vite/Vue3 專案要用 **TypeScript 還是純 JavaScript** —— 從未詢問過。
3. **確認 Pinia** 作為狀態管理方案 —— 目前只是在草案中假設，從未正式當作決策提出讓使用者確認。
4. **Gitea Actions 是否可用** —— Q8 的子項目，仍是開放狀態（「需要從零建置」已被選定，但 Gitea Actions 這個「功能」本身是否已在他們的自架實例上啟用，從未被驗證——如果使用者能提供 repo/實例存取權限，可以派 agent 去查證事實，否則就得直接問使用者）。
5. **Register/Forget/ResetPassword 頁面** —— 屬於 `Views/Home` 底下更廣義的認證頁面，目前不確定它們算不算 Q14「登入」範圍內，還是要延後。需要明確釐清。
6. **測試策略** —— 完全還沒討論過（單元測試、e2e、還是月 1 完全不做測試）。考量到 1 人／1 個月的限制，延後或許合理，但仍應該當成一項明確的決策攤開來問，而不是悄悄跳過。
7. **重新確認 Q10/Q11**，因為上面提到那個「軟性確認」的但書。
8. Frontier 清空之後：針對符合 domain-modeling skill 三項測試（難以逆轉 + 出乎意料 + 存在真正取捨）的決策，**提議寫 ADR**——目前最強的候選項目：(a) 把認證方式從 JWT-in-cookie 改成 JWT-in-Authorization-header、(b) strangler-pattern 共存/URL 切換機制、(c) 選擇 IIS+URL-Rewrite 而非為了這個新的靜態 SPA 額外引入 Nginx/Docker。目前都還沒有寫成 ADR。

---

## 建議下一個 session 使用的 skill

- **`/grilling`** —— 從中斷處接續：先明確重新確認 Q10/Q11，接著把上面 8 項尚未解決的 frontier 當作下一輪一次全部提出（附上 ➡️ 推薦答案），持續進行直到 frontier 清空為止。
- **`/domain-modeling`** —— 一旦 frontier 清空，就把「尚未解決的 Frontier」第 8 項標記的 ADR 寫出來（格式：`.../domain-modeling/ADR-FORMAT.md`），並考慮是否有新的領域用語浮現（例如「Token_g/Token_c」「試點範圍」的精確定義）需要納入 `CONTEXT.md`（格式：`.../domain-modeling/CONTEXT-FORMAT.md`）。
- **Issue tracker skill**（`docs/agents/issue-tracker.md`）—— 決策定案後，依照這個 repo 的 `CLAUDE.md` 慣例，把整份計畫寫成 `.scratch/spa-migration/` 底下的 spec 文件，而不是只留在聊天紀錄裡。
- **Plan / general-purpose agent** —— 等 frontier 清空、使用者確認雙方理解一致之後，用這個把已定案的決策轉成具體的逐步實作計畫（scaffolding 指令、逐檔遷移順序、IIS Rewrite 規則草稿）。
