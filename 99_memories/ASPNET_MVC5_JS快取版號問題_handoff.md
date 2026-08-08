# Handoff: ASP.NET MVC 5 JS 快取版號問題

## 背景

公司專案環境：ASP.NET Framework 4.8 + MVC 5。這是**諮詢/顧問性質的討論**，不是在此 repo（`07_mydy`，個人練習用 repo）內的實作 — 目標專案的實際程式碼不在這台機器上，之前的 session 無法用 subagent 讀檔查證任何專案現況，所有事實都是使用者親口回報的。

### 原始問題

每次發佈都要手動改 JS 版號（`<script src="~/Scripts/site.js?v=1.123456">`），否則使用者端會吃到舊版快取。使用者試過兩個方案，都有問題：

1. `?v=` 接 `Date()` 時間戳 → 每次都不同，等於快取完全失效（cache 永遠 miss，起不到快取效果）。
2. 純前端用 `fetch HEAD` 打 IIS 拿 `Last-Modified`，跟本地存的值比對決定要不要吃快取 → 首頁初載時同步等待這次 fetch 完成才敢渲染，造成**白屏約 3 秒**，體驗很差。且據使用者所知公司伺服器目前效能吃緊（「快掛了」），這個額外的 round-trip 雪上加霜。

## 已達成的共識（決策，不需重新討論）

- **解法方向確定**：改用 ASP.NET MVC 5 內建的 **Bundling and Minification**（`System.Web.Optimization`）。原理：`@Scripts.Render(...)` 依 bundle 內檔案「內容雜湊」自動產生版號（不是時間戳），內容不變網址不變（吃快取），內容一變網址就變（自動破快取）。版號在伺服器產生 HTML 當下就已內嵌，**不需要任何 runtime JS 判斷或額外 request**，因此不會白屏，也順帶減少 request 數（緩解伺服器負載疑慮）。
- 使用者**不排斥碰後端/C#**（一開始講的「不想碰後端」只是因為不熟 C#，非硬限制）。
- 部署方式：Web Deploy，兩套 Publish Profile（測試環境、正式環境）。使用者推測測試環境連 Debug 組態、正式環境連 Release 組態，但**尚未實際確認**組態名稱。
- **Debug/Release 是這個方案能否生效的關鍵地雷**：`web.config` 的 `<compilation debug="true">` 時，`BundleTable.EnableOptimizations` 預設關閉 → 不合併、不壓縮、**不產生 hash 版號**，等於方案沒作用。測試環境用 Debug 沒關係（開發方便除錯），但正式環境必須確認是 Release + `debug="false"`。
- **JS 載入模式**：不同頁面載入不同的 script 子集合，有共用的 script，也有各頁獨立的 script → bundle 需要拆成「共用 bundle」+「各頁專屬 bundle」的架構，不是單一大 bundle。範例架構（尚未套用到實際專案，僅為原理示範）：
  ```csharp
  // App_Start/BundleConfig.cs
  bundles.Add(new ScriptBundle("~/bundles/common").Include(
      "~/Scripts/jquery-{version}.js",
      "~/Scripts/site.js"));
  bundles.Add(new ScriptBundle("~/bundles/productPage").Include(
      "~/Scripts/product-detail.js"));
  ```

## 尚未解決 / 卡住的問題

使用者要下週一（下次回公司）才能查證，本次 session 到此為止：

- **Q5**：專案裡 `App_Start/BundleConfig.cs` 存不存在？（MVC 5 範本預設會生成）有沒有已經被拿來管理部分 CSS/JS，還是完全沒用過？
- **Q8**：IIS / `web.config` 的 `<system.webServer><staticContent><clientCache>` 有沒有設定過 `Cache-Control` / `Expires`？Bundling 的雜湊版號要搭配長效快取（例如 `max-age` 一年）才是完整解法，沒設定的話這部分也要一併補上。

## 下週一到公司的 checklist

- [ ] 確認 `App_Start/BundleConfig.cs` 現況（對應 Q5）
- [ ] 確認 IIS/`web.config` 的靜態檔案快取設定（對應 Q8）
- [ ] 打開正式環境 `.pubxml`，確認組態名稱確實對到 Release + `debug="false"`
- [ ] 盤點所有手動 `<script src="...?v=...">` 的頁面清單，準備逐一改成 `@Scripts.Render(...)`
- [ ] 找到並準備移除現有 fetch HEAD 比對 Last-Modified 的那段 JS（改用 Bundling 後不需要，也是白屏根源）

## 下一輪 session 的目標

拿到上述查證結果後，把 Q5、Q8 補完，確認最終 bundle 分組與部署細節，讓這個諮詢收斂成一個可執行的實作步驟（此專案不在任何 repo 內，所以最終產出預期是「操作指引」而非程式碼變更，除非使用者之後開一個對應該專案的 repo/working directory）。

## Suggested skills for next session

- **`/grill-with-docs`**（如果下次是在對應該 ASP.NET 專案的實際 repo 內）或 **`/grill-me`**（如果仍是無 repo 的純諮詢）— 用來續問 Q5、Q8，並把剩餘的 bundle 分組、部署細節問清楚。優先用 `/grill-with-docs`，因為它會把結論留存成 `CONTEXT.md`，比起這種一次性 handoff 文件更適合後續反覆參考。
- 若查證後發現還有更多待確認的環境細節（例如發現有 CDN、反向 proxy、或多台 IIS 主機做負載平衡等複雜狀況），可以考慮 **`/research`** 先讓背景 agent 查證 MVC Bundling 在該情境下的行為，再帶著結果進 `/grill-with-docs`。
- 這是單一、範圍明確的小改動（設定 Bundling + 調整 IIS 快取 header），**不需要** `/wayfinder` 或 `/to-spec` + `/to-tickets` 這種大型分票流程；一次 session 內用 `/implement`（如果屆時在對應專案的 repo 內）就能做完。