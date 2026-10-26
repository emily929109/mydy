# 滑鼠視差方塊：原理筆記

分析對象：codewars.com 首頁 banner 背景的小圖片（程式語言 icon 和小方塊）。
這些圖片會跟著滑鼠往大致相同的方向移動，但每顆的速度不一樣。

Demo：同資料夾的 `parallax.html`，直接雙擊就能打開。

---

## 一句話結論

- 所有方塊被套用**完全相同**的位移。
- 速度不同是 **CSS 3D 透視**（`perspective`）造成的：離你越近的方塊，看起來移動得越多、也越大。
- 「隨機」佈局其實是整齊的 **8 欄 × 4 列 CSS Grid**，只是被透視推歪了。

---

## 1. 原站用了什麼技術

| 項目 | 結果 |
|---|---|
| 建站工具 | **Webflow**（網頁設計工具，不用手寫程式碼） |
| 滑鼠動畫 | **Webflow Interactions**：在 Webflow 介面上設定的互動動畫，沒有手寫 JS |
| 速度差 | 純 CSS：`perspective` + `translateZ` |
| 佈局 | 純 CSS：`display: grid` |
| 其他載入的函式庫 | GSAP 3.15、jQuery 3.5.1（這個效果沒用到） |

### Webflow 的互動設定（從網站的 JS 裡找到）

```js
// 動畫名稱："Header Mouse Animation"
// 觸發：滑鼠在頁面上移動，只在桌機版（寬度 ≥ 992px）生效
eventTypeId: "MOUSE_MOVE",
config: [
  { selectedAxis: "X_AXIS", basedOn: "VIEWPORT", smoothing: 97, restingState: 50 },
  { selectedAxis: "Y_AXIS", basedOn: "VIEWPORT", smoothing: 97, restingState: 50 },
]

// 動作：滑鼠在畫面最左 → 最右，方塊從 translateX(-6rem) → translateX(6rem)
// Y 軸相同：滑鼠在最上 → 最下，方塊從 translateY(-6rem) → translateY(6rem)
target: ".header_floating-langs-item-x-y"   // 所有方塊共用同一個 class
keyframe 0:   xValue: -6 rem
keyframe 100: xValue:  6 rem
```

重點：

- `target` 是一個 class，所以**所有方塊收到的位移完全一樣**。
- `smoothing: 97` 代表方塊不會立刻跳到目標位置，每一幀只追上剩下距離的 3%，所以有「漂浮」的延遲感。

---

## 2. 速度不同的原理：3D 透視

### HTML 結構：每顆方塊有兩層 div

```html
<div class="header_floating-langs-grid">           <!-- 容器：perspective: 350px -->
  <div class="...item-z is-depth-plus-2">         <!-- 外層：只負責深度（translateZ） -->
    <div class="...item-x-y">icon</div>           <!-- 內層：跟著滑鼠移動（translate x/y） -->
  </div>
</div>
```

為什麼要分兩層？因為一個元素只有一個 `transform`。如果深度和移動寫在同一層，JS 改位移時會把 `translateZ` 蓋掉。

### CSS

```css
.header_floating-langs-grid { perspective: 350px; }

.item-z.is-depth-plus-2  { transform: translate3d(0, 0,  6rem); }  /* 最靠近你 */
.item-z.is-depth-plus-1  { transform: translate3d(0, 0,  3rem); }
/* 沒有深度 class = 0 */
.item-z.is-depth-minus-1 { transform: translate3d(0, 0, -3rem); }
.item-z.is-depth-minus-2 { transform: translate3d(0, 0, -6rem); }  /* 最遠 */
```

### 為什麼會變快或變慢

在 `perspective` 底下，元素在畫面上的大小和位移會被放大成：

```
倍率 = perspective ÷ (perspective − z)
```

- `z` 是正的（靠近你）→ 分母變小 → 倍率 > 1 → 看起來**比較大、移動比較多**
- `z` 是負的（離你遠）→ 分母變大 → 倍率 < 1 → 看起來**比較小、移動比較少**

位移只有一組，速度差全部由瀏覽器的透視計算自動產生，就像現實中近的東西看起來移動得比遠的快。

### 實測數據

用瀏覽器實際把滑鼠從最左移到最右，量每顆方塊在畫面上移動多少（perspective = 350px）：

| 深度 | translateZ | 公式預測 | 實際移動 | 外觀大小 |
|---|---|---|---|---|
| +2 | +96px | ×1.38 → 265px | **264px** | 88px |
| +1 | +48px | ×1.16 → 223px | **222px** | 74px |
| 0 | 0 | ×1.00 → 192px | **192px** | 64px |
| −1 | −48px | ×0.88 → 169px | **168px** | 56px |
| −2 | −96px | ×0.78 → 151px | **150px** | 50px |

192px = 從 −6rem 到 +6rem（1rem = 16px）。實測和公式完全吻合。

---

## 3. 「隨機」佈局的原理

### 其實是整齊的 Grid

```css
.header_floating-langs-grid {
  position: absolute;
  inset: 0;                                     /* 鋪滿整個 banner */
  overflow: hidden;
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto auto;  /* 8 欄 */
  place-items: center;                          /* 每顆放在格子中央 */
  perspective: 350px;
}
```

32 個方塊依序填進 8 欄 × 4 列的格子。

### 為什麼看起來不整齊

1. **很多格是空的或很淡**：32 格裡只有 11 格有語言 icon，其他是不同樣式的空方塊。
   | class | 外觀 |
   |---|---|
   | （預設） | 白色 10% 透明度的方塊 |
   | `is-blank-bright` | 比較淡的方塊 |
   | `is-blank-dull` | 更淡的方塊 |
   | `is-blank-outline` | 只有框線 |
   | `is-blank` | 完全透明，等於留白 |
2. **每格的深度不同**：深度是手動挑的，寫死在 HTML 裡，不是每次載入隨機產生。
3. **透視把位置推歪**：`perspective` 以畫面中心為消失點。深度不同的方塊會被往外推或往內拉，離中心越遠偏移越多，所以原本的格線對不齊了。大小也跟著變，看起來就像散落的方塊。
4. **背景混色**：外層容器用 `mix-blend-mode: hard-light` 和背景的漸層光暈混色，增加層次感。

### 手機版的處理

- 寬度 < 992px：滑鼠動畫關閉（手機沒有滑鼠）。
- 寬度 < 768px：方塊縮小到 2rem，整個容器 `opacity: 0.6`，避免干擾文字。

---

## 4. 不用 Webflow，自己實作

`parallax.html` 就是完整實作，核心只有這些：

```css
.tiles {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  place-items: center;
  perspective: 350px;
}
.z { transform-style: preserve-3d; }
.z[data-d="2"]  { transform: translateZ(96px); }
.z[data-d="-2"] { transform: translateZ(-96px); }
.xy { transform: translate(var(--mx), var(--my)); }   /* 所有方塊共用同一組變數 */
```

```js
const R = 96;   // 最大位移 ±6rem
let tx = 0, ty = 0, x = 0, y = 0;

// 滑鼠位置 → 目標位移（畫面中央為 0，左右兩端為 ±R）
addEventListener('pointermove', e => {
  tx = (e.clientX / innerWidth  * 2 - 1) * R;
  ty = (e.clientY / innerHeight * 2 - 1) * R;
});

// 每一幀往目標靠近 3%（等同 Webflow 的 smoothing: 97）
(function tick() {
  x += (tx - x) * 0.03;
  y += (ty - y) * 0.03;
  tiles.style.setProperty('--mx', x + 'px');
  tiles.style.setProperty('--my', y + 'px');
  requestAnimationFrame(tick);
})();
```

### 這個寫法的好處

- **效能好**：每一幀只改容器上的兩個 CSS 變數，不用逐一設定每顆方塊。
- **程式簡單**：JS 完全不用知道每顆方塊的深度，速度差交給 CSS 透視處理。
- **好調整**：改 `perspective` 就能調整整體的立體感；改某顆的 `data-d` 就能調整它的速度。

### 建議加上的細節

- 只在桌機啟用：`matchMedia('(min-width: 992px)')`
- 尊重使用者的「減少動態效果」設定：`matchMedia('(prefers-reduced-motion: reduce)')`
- 方塊容器加 `pointer-events: none`，才不會擋住底下的按鈕和連結。

---

## 5. 分析方式

1. 用 REA（逆向分析工具）開一個 headless Chrome 載入首頁，錄下所有網路請求，取得 HTML、CSS、JS。
2. 在 Webflow 的 JS 裡搜尋 `MOUSE_MOVE`，找到互動設定 `"Header Mouse Animation"`。
3. 從 HTML 找到方塊的 class 結構，再到 CSS 找對應的 Grid 和 `translateZ` 規則。
4. 用 Chrome DevTools Protocol 模擬滑鼠從最左移到最右，量每顆方塊的實際位移，驗證透視公式。
