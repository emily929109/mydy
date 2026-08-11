# DUDU 文章列表

DUDUPAY 官網的文章列表 / 內頁展示，純前端 Vue 3（CDN 版本）+ 靜態 JSON，無後端、無建置工具。

## Language

**文章 (Article)**:
`news.json` 中的一筆紀錄，同時承載列表卡片欄位（`img`、`text`、`category`、`date`）與內頁詳情欄位（`banner`、`title`、`txt`），以 `id` 為主鍵。
_Avoid_: 新聞、消息（易與 `category` 的分類值混淆）

**促銷時段 (Promotion window)**:
文章上選填的 `promoStart` / `promoEnd` 日期區間，控制該文章在列表中的可見範圍；與 `date`（顯示用發布日）是兩個互不相關的概念。時段開始前完全不顯示、無法透過連結存取；結束後從一般頁籤移除，但仍可在「已結束活動」頁籤下查看，也仍可透過原連結存取。
_Avoid_: 上下架時間、活動期間（未在程式中定義為正式詞彙）

**已結束活動 (Ended-promotions tab)**:
分類頁籤之一，顯示所有 `promoEnd` 已過期的文章（與 `category` 分類值無關），做為促銷文章的歸檔檢視。

**導向連結 (ctaLinks)**:
文章內頁 `content` 下方、待 `ctaStart` 日期到達後才整批顯示的一組 CTA 連結。`ctaStart` 與控制文章本身可見性的 `promoStart`/`promoEnd`（促銷時段）是互不相關的日期；`ctaStart` 只有開始、沒有結束，一旦顯示便不會再收回。以獨立的結構化欄位存放並由樣板渲染，不寫在 `content` 的 HTML 字串裡。
_Avoid_: 三個導向、CTA按鈕（口語說法，非程式中定義的正式詞彙）
