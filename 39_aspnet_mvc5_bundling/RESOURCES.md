# ASP.NET MVC 5 Bundling and Minification Resources

## Knowledge

- [Bundling and Minification — Microsoft Learn (Rick Anderson, ASP.NET docs)](https://learn.microsoft.com/en-us/aspnet/mvc/overview/performance/bundling-and-minification)
  官方主文件。涵蓋 `ScriptBundle`/`StyleBundle` 建立方式、`@Scripts.Render`/`@Styles.Render`、`{version}` 萬用字元、`EnableOptimizations` 與 `debug` 屬性的關係、bundle 的 `?v=` 雜湊版號原理、bundle 回應自動帶一年份 Expires header、CDN fallback 寫法。Use for：任何 bundling 機制本身的權威定義與程式碼範例。
- [BundleTable Class — Microsoft Learn (previous-versions/aspnet)](https://learn.microsoft.com/en-us/previous-versions/aspnet/hh195143(v=vs.110))
  `BundleTable`/`EnableOptimizations` 的 API 參考。Use for：確認 `BundleTable.EnableOptimizations` 的預設值與行為細節。
- [Client Cache `<clientCache>` — Microsoft Learn (IIS docs)](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/clientcache)
  IIS `<staticContent><clientCache>` 的權威參考：`cacheControlMode`（`NoControl`/`DisableCache`/`UseMaxAge`/`UseExpires`）、`cacheControlMaxAge`、`httpExpires`、`setEtag`。Use for：設定「非 bundle 的靜態檔案」（圖片、字型等）的長效快取 header。**注意**：bundle 本身的回應不需要靠這個設定取得長效快取，框架已自動帶一年 Expires（見上一條資源）。

## Gaps

- 尚未找到「Web Deploy 兩套 Publish Profile（測試/正式）如何確保正式環境組態一定是 Release + `debug="false"`」的操作指引 — 這是下週一要現場查證的項目（handoff 的 checklist），查證後若需要通用作法再補資源。
- 尚未找到公司實際專案的 `App_Start/BundleConfig.cs` 或 `web.config`（不在此機器上），所有範例程式碼目前都只是原理示範，非實際專案程式碼。

## Wisdom (Communities)

- 尚未探索。使用者目前是諮詢單一具體問題，還沒有表達加入社群的需求。若後續想找地方驗證作法或問進階問題，可以考慮 [ASP.NET 官方 Microsoft Q&A](https://learn.microsoft.com/en-us/answers/tags/174/aspnet)（官方文件內附的討論區，訊噪比較高，MVC 5 雖是舊框架但社群仍會回覆）。
