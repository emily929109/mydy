# Handoff: DuDuPay → Vue3 SPA Migration — Grilling Session

**Date:** 2026-08-12
**Repo:** `C:\Users\emily\Desktop\emily\04_dudupay\04_git版控\dudupay` (branch `feature/20260817`, git remote: self-hosted Gitea `http://10.2.8.17:3000/mydy/dudupay.git`)
**Session type:** `/grill-with-docs` (= `/grilling` skill + `/domain-modeling` skill), triggered by user's original ask:

> 如何將本專案在一個月內換成spa架構，大致工具如下: VUE3 composition api SPA / vite / UI框架沿用: bs element plus / deploy 方式：請推薦業界常用的方式 / 組件如何拆分：請協助我構思

**Status:** In progress. Frontier is **not** empty — do not treat this as a final plan. The `/handoff` command interrupted the session mid-round, right after Q15 was answered and before the next round of questions was asked.

**User preference noted mid-session:** user asked to switch to Traditional Chinese (中文) for all responses. Continue in Chinese.

---

## What this session is (ground rules for continuing)

This is a **grilling session** per `~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/1.2.3/skills/productivity/grilling/SKILL.md`:

- Work a design tree in rounds. The **frontier** = every open decision whose prerequisites are already settled. Ask the whole frontier at once, numbered, each with a recommended answer (➡️). Wait for answers before the next round.
- **Facts are the agent's job, never the user's.** Dispatch sub-agents (Explore/general-purpose) to find facts from the codebase; only put genuine _decisions_ to the user.
- Session ends only when the frontier is empty and the user confirms shared understanding. **We are not there yet.**
- Also running `domain-modeling` skill (`.../skills/engineering/domain-modeling/SKILL.md`): update `CONTEXT.md` inline when domain terms crystallize; offer an ADR (format in `.../domain-modeling/ADR-FORMAT.md`) only when a decision is hard-to-reverse + surprising + a real tradeoff. **No `CONTEXT.md` edits or ADRs have been written yet this session** — see "Likely ADR candidates" below.

This repo's `CLAUDE.md` also documents repo-wide conventions worth checking before continuing:

- Issue tracker: markdown files under `.scratch/<feature>/` (see `docs/agents/issue-tracker.md`) — once the grilling frontier closes, this plan probably belongs as a spec there, e.g. `.scratch/spa-migration/`.
- Triage labels doc: `docs/agents/triage-labels.md`.
- Domain docs layout: single-context — `CONTEXT.md` + `docs/adr/` at repo root (see `docs/agents/domain.md`). Existing `CONTEXT.md` at repo root currently only documents order/shipping/news-banner domain language — nothing about this migration yet.

---

## Facts established (from sub-agent research — not yet written to any file, so this is the only record)

### Current stack

- **Backend:** ASP.NET MVC 5 / Web API 2 on **.NET Framework** (not Core), C#. Solution `DuDuPay.sln`, 8 projects: `DuDuPay` (main customer-facing app, 170 views, 42 controllers, 181 JS files), `DuDuAdmin` (backoffice, 27 views), `DuDuApi`, `Einvoice`, `CallApi`, `PDF`, `AI_LOC`, `WindowsFormsApp1`.
- **Frontend:** Server-rendered Razor (`.cshtml`), jQuery 3.6.0 + Bootstrap 5.1.3, no build tooling at all (no webpack/vite/gulp, no app-level `package.json`). Bundling via ASP.NET `BundleConfig`.
- **No existing Vue, no Element UI/Plus, no client router** anywhere in the repo.
- **Deploy:** 100% manual — Visual Studio MSDeploy publish profiles (`DuDuPay/Properties/PublishProfiles/Production.pubxml`, `lab.pubxml`) to on-prem IIS (`MSDeployServiceURL: http://10.2.8.32`, site `www.dudupay.com.tw`). **No CI/CD exists at all.**
- **Domain:** `CONTEXT.md` describes DuDuPay as 無卡分期購物金流系統 (card-less installment payment system) — dealer (特約商) back-office + member (會員) storefront.

### Auth — important, non-obvious finding

This is **not** two parallel auth systems (cookie vs JWT). It's **one custom scheme: JWT stored inside an HttpOnly cookie**, not the `Authorization` header:

- `DuDuPay/App_Start/Startup.Auth.cs:40-41,58` — `UseCookieAuthentication`/`UseExternalSignInCookie`/`UseOAuthBearerTokens` — this is unused ASP.NET Identity scaffolding, nothing in the controllers relies on it.
- `DuDuPay/Controllers/AuthCookieHelper.cs` — real mechanism. On login, builds a JWT (`Jose.JWT.Encode`, HS256, secret from `Web.config` `Encryption_Decryption_key`) with payload `member_id/role/idno/mobileno/expiredTime/...`. Two tokens: `Token_g` (general, 24h) and `Token_c` (consume-scoped, ~2h). Written as `HttpOnly; Secure` cookies.
- `DuDuPay/Controllers/JwtAuthActionFilter_General.cs` (and sibling `_Consume`, and a separate copy in `DuDuApi/Controllers/JwtAuthActionFilter_API.cs`) — Web API `ActionFilterAttribute`. Checks `Authorization: Bearer` header is _present_ (line 21) as a gate, but the **actual token it decodes comes from the `Token_g` cookie** (lines 33-37), not the header value. Decoded payload stashed into `RouteData.Values["AuthMember"]`.
- `DuDuPay/Layout/JwtAuthObject.cs` — the JWT payload shape.

### Home / 會員前台 (the chosen pilot area) — detailed inventory

- `HomeController.cs` (750 lines) has **no `[Authorize]`, no server model binding** — every action is `return View()`. All real data comes from client-side axios. This is favorable for SPA migration (routing can become pure client routes).
- **~140 `.cshtml` files** under `Views/Home`, of which ~25 are `Test*`/dev-only (excluded), and a chunk are dealer-adjacent (excluded — separate "Dealer" area). Real member-storefront surface is **100+ pages**, including: MemberSign2/TwcaVerify family (multi-step e-signature + TWCA identity verification, reused across signup/credit-increase/ID-change/mobile-change scenarios), MemberCenter/Account/MemberOrder, Purchase (cart/checkout), ProductList/StoreList/OnlineStore (catalog), AmountUp (credit-limit increase), PayBank/PayStore (repayment), static/CMS pages (About/News/Faq/Privacy/etc.), Login/Register/Forget/ResetPassword.
- **Existing JSON APIs already cover most of this**: `MemberController`, `MemberCenterController`, `OrderController`, `AccountController`, `TwcaController`, `UploadController`, `AnonymousOTPController`, `ForgetController` are all `ApiController`s already gated by `JwtAuthActionFilter_General`/`_Consume`.
- **Known API gap:** `ProductList.cshtml`/`StoreList.cshtml` — no working JSON endpoint found (`productList.js`/`storeList.js` show no axios calls in a quick scan; may be static/hardcoded). **User decided (Q15) to exclude this from month 1.**
- **Big head start:** `header.js` (603 lines, nav/login/cart-badge/member-state), `memberSign2.js` (925 lines, multi-step wizard state machine), `purchase.js` (859 lines, cart/checkout, reads `member` from `localStorage`), `common.js` (691 lines, shared utils/axios interceptors), `memberCenter.js` — **these are already written in Vue 3 Composition API** (`ref`/`reactive`), just mounted per-`<div id="xxxApp">` via non-bundled `<script>` tags. Migration is largely "restructure into SFCs + Vite build," not "rewrite from scratch."
- `_Layout.cshtml` — global CSS, left nav Vue app (`#menuLeftApp`), top nav Vue app (`#menuTopApp`) with **login/dealer-login modals embedded inline**, cart drawer, footer. A new SPA layout needs: auth-aware header/nav, login modal, footer, cart drawer as shared components.
- Auth enforcement today is **client-side** (`localStorage.getItem('member')` checks in `header.js`/`memberCenter.js`/`purchase.js`) plus **server-side at the API layer** via the JWT filters. Razor views themselves render for anyone; gating happens at API-call time.

---

## Decisions settled this session (numbered Q1–Q15, in order asked)

| #   | Topic              | Decision                                                                                                                                                                                                                                                                                 |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | 遷移範圍           | **漸進式（strangler pattern）** — 新舊並存，逐步蠶食，非整站重寫                                                                                                                                                                                                                         |
| Q2  | 團隊時程           | **1人全職一個月**（後由 Q10 釐清：僅限前端）                                                                                                                                                                                                                                             |
| Q3  | 部署環境限制       | **公司內部機房/自架主機**（on-prem IIS，非雲端）                                                                                                                                                                                                                                         |
| Q4  | 瀏覽器支援         | **不需要 IE11**，現代瀏覽器即可（Vite 原生 ESM，無需 legacy build）                                                                                                                                                                                                                      |
| Q5  | 程式碼庫結構       | **獨立新 repo**（非 monorepo）                                                                                                                                                                                                                                                           |
| Q6  | 共存＋認證方向     | （原三選一被使用者用自由文字回答取代）**後端也會同時升級成 ASP.NET Core Web API**                                                                                                                                                                                                        |
| Q7  | API 缺口範圍       | **後端會做新的 API**（隱含：由另一團隊/人力負責，不算進這位前端工程師的一個月範圍——Q10 確認）                                                                                                                                                                                            |
| Q8  | CI/CD 工具鏈       | **都沒有，需要從零建置**（自架 Gitea `10.2.8.17:3000`，是否已啟用 Gitea Actions **尚未確認**）                                                                                                                                                                                           |
| Q9  | 試點業務優先序     | 原選 **Home／會員前台**（消費者常用頁）→ 後由 Q14 進一步縮小                                                                                                                                                                                                                             |
| Q10 | 團隊分工           | **使用者只負責前端 SPA**，後端 Core API 由別的人/團隊同步做（⚠️ 此題透過 AskUserQuestion 送出時被使用者以 `/handoff` 前一輪的「請求釐清」中斷，答案是從被拒絕的 tool call 中使用者已勾選的草稿值取得，我在對話中口頭覆述過一次、使用者未糾正，視為已確認但**建議下一輪再明確覆核一次**） |
| Q11 | Core API 部署方式  | **繼續用 IIS 托管（ASP.NET Core Module），不用 Docker**（同 Q10，來源與確認狀態相同，**建議覆核**）                                                                                                                                                                                      |
| Q12 | 認證機制           | 使用者主動追問「本專案從哪裡看出 cookie 和 jwt 驗證」→ 我讀碼給出上方「JWT-in-cookie」的具體證據 → 使用者決定：**改成 JWT-in-Authorization-header**（從目前的 JWT-in-HttpOnly-cookie 模式改過來，前端要自己存 token 並每次手動帶上）                                                     |
| Q13 | 前端 Token 儲存    | **記憶體（Pinia store）＋ Refresh Token** 機制（非 localStorage，防 XSS 竊取；隱含後端要新增 refresh endpoint）                                                                                                                                                                          |
| Q14 | 一個月實際交付範圍 | 從「整個 Home 區域（100+ 頁）」縮小為：**登入 + 首頁 + 會員中心 + 帳單查詢**（MemberSign2/TwcaVerify 簽署驗證家族、Purchase 購物結帳、AmountUp 額度提升、ProductList/StoreList 商城，**皆排除在月 1 範圍外**）                                                                           |
| Q15 | 商品列表 API 缺口  | **排除在這個月範圍外**，等後端補齊後再排入下一輪遷移                                                                                                                                                                                                                                     |

**Important:** Q10/Q11 confirmation is slightly soft (see note above) — worth a one-line re-confirmation at the start of the next round rather than assuming silently.

---

## Proposed but NOT yet confirmed by user

I drafted these and presented them in prose (not as an AskUserQuestion), so **they are proposals awaiting explicit sign-off**, not settled decisions:

1. **Deploy pipeline recommendation:** Gitea Actions (self-hosted runner) → `vite build` → script copies `dist/` into an IIS virtual directory → IIS URL Rewrite Module does SPA fallback (unmatched paths → `index.html`, vue-router takes over). Chosen because it avoids introducing Nginx or a container platform into the existing on-prem IIS estate. **Not yet asked whether Gitea Actions is actually enabled on their instance (open sub-item of Q8).**
2. **Component tree draft** (written before Q14 narrowed scope — needs revising down to just Login/Index/MemberCenter/Account/MemberOrder + shared Layout, dropping Purchase/AmountUp/memberSign/catalog folders since those are out of month-1 scope per Q14):
   ```
   src/
   ├── layouts/MainLayout.vue        ← replaces _Layout.cshtml (header/nav, login modal, footer)
   ├── router/                       ← vue-router
   ├── stores/ (Pinia)
   │   └── auth.ts                   ← JWT in-memory + refresh, replaces localStorage 'member' checks
   ├── views/
   │   ├── auth/                     ← Login (Register/Forget deferred? — not yet asked)
   │   ├── home/                     ← Index
   │   └── memberCenter/             ← MemberCenter, Account(2), MemberOrder (帳單查詢)
   └── components/
   ```

## Unresolved frontier (what the next round must ask)

These are open decisions the interrupted session had not yet reached:

1. **URL/path cutover mechanism** — `HomeController` currently serves _all_ Home paths (in-scope and out-of-scope) from the same route pattern on `www.dudupay.com.tw`. Need to decide exactly which paths the IIS URL Rewrite hands to the new SPA (e.g. `/`, `/Login`, `/MemberCenter`, `/Account`, `/MemberOrder`) vs. which stay on legacy MVC (everything else: Purchase, AmountUp, MemberSign2/TwcaVerify, ProductList/StoreList, static pages). This is the biggest unresolved architecture question and blocks finalizing the deploy recommendation.
2. **TypeScript vs plain JavaScript** for the new Vite/Vue3 project — never asked.
3. **Confirm Pinia** as the state management choice — assumed in the draft proposal, never put to the user as an explicit decision.
4. **Gitea Actions availability** — sub-item of Q8, still open ("需要從零建置" was chosen but whether Gitea Actions the _feature_ is enabled on their self-hosted instance was never verified — could dispatch a fact-finding check if the user can give repo/instance access, otherwise must ask the user directly).
5. **Register/Forget/ResetPassword pages** — part of the broader auth pages under `Views/Home`, ambiguous whether they're in the Q14 "登入" scope or deferred. Needs explicit clarification.
6. **Testing strategy** — completely undiscussed (unit tests, e2e, none-for-month-1). Given 1-person/1-month constraint this may reasonably be deferred, but should be surfaced as an explicit decision, not silently skipped.
7. **Re-confirm Q10/Q11** given the soft-confirmation caveat above.
8. Once the frontier closes: **offer ADRs** for the decisions that meet the domain-modeling skill's 3-part test (hard to reverse + surprising + real tradeoff) — strongest candidates: (a) switching auth from JWT-in-cookie to JWT-in-Authorization-header, (b) the strangler-pattern coexistence/URL-cutover mechanism, (c) picking IIS+URL-Rewrite over introducing Nginx/Docker for the new static SPA. None have been written yet.

---

## Suggested skills for the next session

- **`/grilling`** — resume exactly where this left off: re-state Q10/Q11 for explicit confirmation, then ask the 8 unresolved frontier items above as the next numbered round (with ➡️ recommendations), continuing until the frontier is empty.
- **`/domain-modeling`** — once the frontier closes, write the ADRs flagged in "unresolved frontier" item 8 (format: `.../domain-modeling/ADR-FORMAT.md`), and consider whether any new domain terms surfaced (e.g. precise definitions of "Token_g/Token_c", "pilot scope") belong in `CONTEXT.md` (format: `.../domain-modeling/CONTEXT-FORMAT.md`).
- **Issue tracker skill** (`docs/agents/issue-tracker.md`) — once decisions are final, capture the plan as a spec under `.scratch/spa-migration/` per this repo's `CLAUDE.md` convention, rather than leaving it only in chat history.
- **Plan / general-purpose agent** — after the frontier closes and the user confirms shared understanding, use this to turn the settled decisions into a concrete step-by-step implementation plan (scaffolding commands, file-by-file migration order, IIS Rewrite rule drafts).
