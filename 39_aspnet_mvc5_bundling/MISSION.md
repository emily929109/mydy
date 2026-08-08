# Mission: ASP.NET MVC 5 Bundling and Minification（解決 JS 快取版號問題）

## Why
公司專案（ASP.NET Framework 4.8 + MVC 5）每次發佈都要手動改 JS 版號，兩個先前方案都失敗：時間戳版號讓快取完全失效，`fetch HEAD` 比對 `Last-Modified` 造成首頁白屏約 3 秒。已確定改用內建的 Bundling and Minification（`System.Web.Optimization`），下週一回公司要能實際查證環境現況並動手設定。詳見 [[../99_memories/ASPNET_MVC5_JS快取版號問題_handoff.md]]（前次諮詢紀錄）。

## Success looks like
- 能解釋 bundle 的雜湊版號（`?v=...`）如何在伺服器端算出，為什麼「內容不變網址不變（吃快取）、內容一變網址就變（自動破快取）」
- 能讀懂並修改 `App_Start/BundleConfig.cs`，依「共用 bundle + 各頁專屬 bundle」架構分組
- 能準確判斷 `<compilation debug="...">` 與 `BundleTable.EnableOptimizations` 兩者如何共同決定 bundling 是否生效，並在測試環境（Debug）、正式環境（Release）分別確認
- 能判斷哪些快取行為是 bundling 框架自動處理的（bundle 回應本身的 Expires header），哪些需要額外在 IIS `web.config` 的 `<staticContent><clientCache>` 補設定（非 bundle 的靜態檔案，例如圖片）
- 能把現有手動 `?v=...` 版號的頁面逐一改成 `@Scripts.Render(...)`，並移除白屏根源的 fetch HEAD 比對邏輯

## Constraints
- 顧問性質討論，目標專案不在這台機器的任何 repo 內；沒有工具可以讀取實際專案程式碼，一切依賴使用者回報與下週一現場查證
- 使用者不熟 C#／後端，需要從基礎解釋 `System.Web.Optimization` 的行為，不能預設既有知識
- 公司伺服器效能吃緊，任何方案都要考慮降低 request 數 / 負載
- 下週一（2026-08-10）才能查證 `App_Start/BundleConfig.cs` 現況與 IIS 靜態快取設定

## Out of scope
- 不追求精通整個 ASP.NET MVC 5 framework，聚焦在 Bundling and Minification 這個功能
- CDN、reverse proxy、多台 IIS 負載平衡等進階情境，除非查證後發現真的用到
