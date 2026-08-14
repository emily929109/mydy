# News Data Standardization Skill

此 Skill 旨在規範文章內容格式標準化 。

## 版本: v2.1

`news.json` 是文章列表頁、內頁、首頁三個區塊共用的單一資料來源，每篇文章需同時包含「列表卡片」與「內頁詳情」兩組欄位。

## 資料結構定義 (Schema)

每篇文章應包含以下欄位：

| 欄位名稱        | 類型    | 說明                                                                                                                                                                      |
| :-------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`            | String  | 文章唯一識別碼（建議使用原始檔名），列表 `href` 與內頁查找都以此為主鍵。                                                                                                  |
| `href`          | String  | 卡片點擊連結。一般文章固定格式 `/Home/News?id={id}`；若此筆資料是導向站內其他頁面（見 `isNotNews`），則填該頁面實際路徑（例如 `/Home/Travel`）。                          |
| `img`           | String  | 列表卡片縮圖路徑（統一使用 `/` 開頭）。                                                                                                                                   |
| `listTitle`     | String  | 列表卡片顯示標題（同時作為卡片摘要文字，非文章全文）。                                                                                                                    |
| `category`      | String  | 文章分類，實際可用值：`promotion`（活動訊息）、`announcement`（重要公告）、`pet-life`（萌寵生活）、`explore`（探索旅程）。                                                |
| `releaseDate`   | String  | 顯示用發布日期，格式 `YYYY/MM/DD`。與 `promoStart`/`promoEnd` 無關。                                                                                                      |
| `banner`        | String  | 文章內頁頂部橫幅圖片路徑（統一使用 `/` 開頭）。                                                                                                                           |
| `contentTitle`  | String  | 文章內頁主標題。                                                                                                                                                          |
| `content`       | String  | 內頁內容主體，使用簡化 Markdown 與基礎 HTML 標籤。                                                                                                                        |
| `promoStart`    | String  | （選填）促銷可見時段起始日，格式 `YYYY/MM/DD`。未到此日期前，文章完全不顯示、也無法透過連結存取。                                                                         |
| `promoEnd`      | String  | （選填）促銷可見時段結束日，格式 `YYYY/MM/DD`，含當天整天有效（到 23:59:59）。過此日期後，文章會有「已結束」CSS 標示，並可透過原連結存取。首頁則不顯示                    |
| `isHomeBanner`  | Boolean | （選填）是否顯示於首頁大圖輪播 banner。設為 `true` 時須同時提供 `homeBannerSeq`。                                                                                         |
| `homeBannerSeq` | Number  | （選填）`isHomeBanner` 為 `true` 時的輪播排序，數字越小越優先顯示。                                                                                                       |
| `isNewsBanner`  | Boolean | （選填）是否顯示於「消息中心」頁頂輪播 banner。設為 `true` 時須同時提供 `newsBannerSeq`。                                                                                 |
| `newsBannerSeq` | Number  | （選填）`isNewsBanner` 為 `true` 時的輪播排序，數字越小越優先顯示。                                                                                                       |
| `isNotNews`     | Boolean | （選填）標記此筆資料並非站內文章，僅作為列表／首頁的導流入口（`href` 指向其他頁面）。設為 `true` 時可省略 `contentTitle` 與 `content`，且不會出現在文章列表與分類頁籤中。 |

`promoStart`/`promoEnd` 只在需要限時顯示的文章上加註；一般文章不需要這兩個欄位。`homeBannerSeq`/`newsBannerSeq` 僅在對應的 `isHomeBanner`/`isNewsBanner` 為 `true` 時才需要填寫。

## `content` 內容規範

為了保持結構簡潔，`content` 欄位應遵循以下標記規則：

1. **重構原則** : 請忽略原始 HTML 結構、乎略原始class與符號（如 `row`, `col`, `fs-1` , `#` , `* `等），重新判斷何為子標題、何為條列清單。
2. **子標題**：請使用粗體、字體大小為1.1rem、顏色為主題色 (#00ab98)。
3. **條列清單**：無序標記請使用 Bullet Point ，有序標記請使用編號，若已有特殊的icon則保留icon 無須 Bullet Point
4. **圖片嵌入**：使用 `<img src="..." />` 標籤，路徑應為相對根目錄的路徑。
5. **重點強調**：使用 `<strong>` 或行內樣式 ( 例如 `style="color:red"`)。
6. **基本樣式** : 行與行需保持一定的間距，文本字體大小為1rem，其餘請自行發揮。
7. **遇到連結** : 例如文章底部有立即申辦、立即購買、立即了解申辦流程等類似連結，請以以下結構作重構:
   `<p style=\"margin-bottom: 1.5rem; font-size: 1rem;\"><a href=\"/Home/Register\">立即申辦</a></p>`
8. 請完全依照文案轉化，勿自行新增文字內容

## 驗證格式

1. 確保產出的 JSON 符合 RFC 8259 規範，且編碼為 UTF-8。
