# 促銷文章的導向連結（ctaLinks）改用結構化欄位，不寫死在 content HTML 裡

促銷文章的 `content` 是整段 HTML 字串，透過 `v-html` 直接輸出，Vue 無法對其內部元素做反應式的顯示/隱藏控制。當文章需要在 `promoStart` 之後的另一個時間點（`ctaStart`）才顯示一組額外的 CTA 連結時，我們將這些連結抽出成獨立的結構化欄位（`ctaLinks` 陣列 + `ctaStart` 日期），由樣板另外用 `v-if` 渲染在 `content` 下方，而不是寫死在 `content` 字串裡再靠渲染後的 DOM 掃描（比對 `data-start` 屬性）來控制顯示。

這樣可以直接複用既有 `parseDateStr` 與日期比較邏輯（跟 `promoStart`/`promoEnd` 判斷同一套寫法），不用另外维护一套「渲染後掃描 DOM」的命令式邏輯。取捨是：`ctaLinks` 固定顯示在 `content` 下方，文章撰寫者無法把它們插入內文中間的特定段落。
