# 註冊流程 Guard / 導頁邏輯筆記

Status: 已完成調查

範圍：`Register` → `UploadFile` → `MemberInfo` → `TwcaVerify_1/2/3` → `MemberSign2` 這條註冊精靈，
記錄「使用者填到一半時，各頁如何判斷該不該擋下來、該導去哪」的實際運作方式，以及過程中發現的一個
死碼不一致問題。

## 1. 頁面流程總覽

Controller 端全部是薄 Action（`DuDuPay/Controllers/HomeController.cs`），本身完全沒有導頁/守衛邏輯，
只是 `return View()`。所有「這步驟填完了沒」的判斷都在**前端 JS**（Vue，各頁自己的 `onMounted` /
送出時檢查）。

```
Register (建帳號: 手機/密碼/OTP)
   ↓
UploadFile (上傳證件照)
   ↓
MemberInfo (基本資料)
   ↓
TwcaVerify_1 → TwcaVerify_2 → TwcaVerify_3 (TWCA 身分驗證，門號非本人可跳過 2/3 直接到 MemberSign2)
   ↓
MemberSign2 (約定書簽署 → 完成註冊)
```

## 2. 核心欄位：`member` / `login_ok_msg` / `register_step`

`member` 是快取在瀏覽器 `localStorage` 裡的一份物件，內容來自後端兩支 API 的回傳值：

- `POST /api/Member/Register_2`（Register 頁送出時）
- `POST /api/Member/Login`（登入時）

**重點：`localStorage.member` 有值 ≠ 已登入。** 兩者是不同概念：

| 欄位 | 意義 |
|---|---|
| `member` 是否為 `null` | 這個瀏覽器有沒有快取過某個帳號的資料（可能只是剛建完帳號，還沒真的登入過） |
| `member.login_ok_msg == '*'` | 帳號是否**完成整個註冊流程**（=「已登入」狀態的真正判準） |
| `member.register_step` | 目前卡在精靈的第幾步（用來決定「該導去哪一頁」） |

### `register_step` 的實際寫入點

| register_step | 何時被寫入 | 位置 |
|---|---|---|
| `0` | Register 頁送出、帳號剛建立 | `MemberController.cs:1107, 1302`（`Register_2` / 另一支建帳號 API） |
| `1` | UploadFile 上傳完成 | `Models/FileUploadDA.cs:30` |
| `2` | MemberInfo 資料填完 | `Models/MemberDA.cs:211 / 328 / 422` |
| `3` | MemberSign2 簽署完成（`FinishRegister`），**且** `order_type` 為「註冊帶訂單」或「綜合」 | `Models/MemberDA.cs:1270-1282` |
| `12` | 簡易註冊填完基本資料 | `Models/MemberDA.cs:2633` |
| `13` | 簡易註冊完成（`FinishEasyRegister`） | `Models/MemberDA.cs:1566-1646` |

### `login_ok_msg` 何時才會變成 `'*'`

只有在 `FinishRegister`／`FinishEasyRegister` 真正跑完時才會被設成 `'*'`
（`Models/MemberDA.cs:1439, 1642`）。**例外：`order_type == "超額"`（超額額度申請）**
——這個分支的 `register_step` / `login_ok_msg` 賦值整段被註解掉
（`Models/MemberDA.cs:1296-1297`），代表超額申請的人**就算把精靈全部填完、簽完約定書，
帳號還是會停在 `login_ok_msg != '*'`**，因為要等後台人工審核，不是流程沒填完。

## 3. 「`member != null && login_ok_msg != '*'`」不是只有剛建帳號才會出現

原本的疑問：這個狀態是不是只存在「剛建立帳號」那一瞬間？

**不是。** 從上面 `register_step` 的寫入點可以看到，`login_ok_msg != '*'` 這個狀態，
從 `register_step = 0`（剛建帳號）一路延續到 `register_step = 2`（資料填完、還沒簽約定書），
甚至完整簽完約定書後，只要是「超額」案件也會持續停留在這個狀態（等審核）。

所以 `member != null && login_ok_msg != '*'` 涵蓋的實際情境包括：

1. 剛完成 Register（`register_step = 0`），連 UploadFile 都還沒開始。
2. 上傳完照片、還沒填基本資料（`register_step = 1`）。
3. 基本資料填完、還沒完成 TWCA 驗證 + 簽署（`register_step = 2`）。
4. 已完整簽署，但因為是「超額」額度申請，卡在後台審核中（`register_step = 3`，但 `login_ok_msg` 沒被設 `'*'`）。

換句話說，這個判斷式代表的是「**這個帳號存在，但註冊流程還沒走完（或還在審核）**」，
是一個橫跨整個精靈生命週期的狀態，不是單一時間點。

另有一個佐證：`duduapiController.cs:174-190`（BOBO 會員自動寫入 DUDU 的流程）也把
`login_ok_msg != '*'` 當作「註冊到一半」的通用判斷依據，遇到這種舊資料會直接刪除重建，
可見這是整個系統共用的「未完成註冊」語義，不是 Register 頁自己發明的規則。

## 4. 各頁 Guard 邏輯

| 頁面 | 檔案 | 邏輯 |
|---|---|---|
| Register | `js/register.js:39-49` | `member != null` 時一律擋：`login_ok_msg == '*'` → 「已登入，請先登出」；`!= '*'` → 「已有帳號，請先登入」。兩種情況都導回 `Home/Index`。**不做 step 路由**，因為 Register 頁的用途只是防止重複建帳號/撞號，不負責接續流程。 |
| UploadFile | `js/uploadFile.js:24-27` | `member == null` → 導回 `Home/Index`（必須先完成 Register）。 |
| MemberInfo | `js/memberInfo.js:63-66` | 同上 `member == null` 守衛；另外呼叫 `/api/Member/MemberInfoInit` 撈回已存資料做預填（伺服器端的「續填」機制）。 |
| TwcaVerify_1 | `js/twcaVerify_1.js` | `onMounted` **沒有**守衛（信任前面頁面已把關）。 |
| TwcaVerify_2 | `js/twcaVerify_2.js` | `onMounted` 同樣沒有守衛，讀條款 html 並把 `clausever` 存進 `localStorage.twca`。 |
| TwcaVerify_3 | `js/twcaVerify_3.js:76-87` | 送出時檢查 `localStorage.twca`，沒有或 `clausever == ''` → 導回 `TwcaVerify_1`。 |
| MemberSign2 | `js/memberSign2.js:86-95, 806-834` | PC 流程下檢查 `member == null` → 導回 `Home/Index`；並處理 TWID Portal 回傳的 `twca_msg`（取消簽章要導回 `TwcaVerify_1`）。 |

**已知缺口**：`TwcaVerify_1` / `TwcaVerify_2` 沒有 `member == null` 守衛，跟其他頁不一致。
如果有人跳過 Register 直接帶網址進這兩頁，要到 `TwcaVerify_3` 送出時才會因為 `twca` 是空的被攔下
（導回 `TwcaVerify_1`，不是導回 `Index` 重新註冊）。

## 5. 真正「依未完成步驟導向正確頁面」的邏輯在哪

不在上面任何一個「頁面自己的守衛」，而是在**登入流程**，依伺服器回傳的 `register_step` 決定要導去哪：

### ✅ 有效：`js/menu_top.js:144-183`（頁首共用登入 modal）

```js
switch (response.data.value.register_step) {
    case 0:  register_url.value = '/Home/UploadFile'; break;
    case 1:  register_url.value = '/Home/MemberInfo'; break;
    case 2:  register_url.value = '/Home/MemberSign2'; break;   // 另有轉手機簽署特例
    case 12: register_url.value = '/Home/MemberInfo_easy'; break;   // 簡易註冊
    case 13: register_url.value = '/Home/TwcaVerify_1_easy'; break;
    default: register_url.value = '/Home/MemberInfo';
}
```
登入成功、`login_ok_msg != '*'` 時彈出 `#regist-notfinsh-modal`，帶上對應連結讓使用者自己點過去。

### ❌ 死碼：`js/bobo_login.js:78-101`、`js/bobo_login_2.js:81-`（獨立登入頁）

同一段 `register_step` switch 被**整段註解掉**，`if (login_ok_msg != '*') { ... }` 裡面是空的。
從這兩支獨立登入頁登入、帳號還沒註冊完成時：**不會彈窗、不會導頁**，`member` 被存進
localStorage 後就停在原地，使用者只能自己想辦法回到正確步驟。

### 影響

同一件事「登入後導去未完成步驟」，依登入入口不同，行為不一致：

- 從**頁首登入 modal**進 → 正確導向未完成步驟。
- 從**獨立 Login 頁**進 → 邏輯是死碼，沒有任何導頁行為。

## 6. 建議（尚未執行）

把 `bobo_login.js` / `bobo_login_2.js` 裡註解掉的 `register_step` switch，比照
`menu_top.js:144-183` 補回去，讓兩個登入入口行為一致。順便可以考慮：

- 幫 `TwcaVerify_1` / `TwcaVerify_2` 補上跟其他頁一致的 `member == null` 守衛（見第 4 節缺口）。
- 「超額」案件因為卡在 `login_ok_msg != '*'`，會被現有邏輯誤判成「註冊未完成」而非「審核中」，
  UI 文案上可能需要跟未完成註冊做區分（目前程式碼層面沒有區分這兩種狀態的欄位）。
