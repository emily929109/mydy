<script setup>
import { ref, computed, reactive } from 'vue'

// 商品資料（fetch 假資料）
const productListJson = ref([])
fetch('fakeProductData.json')
  .then((res) => res.json())
  .then((data) => {
    productListJson.value = data
  })
  .catch((err) => {
    console.error('Failed to load product data:', err)
  })

// 分類資料（fetch 假資料）
const categoryListJson = ref([])
fetch('fakeCategoryTreeData.json')
  .then((res) => res.json())
  .then((data) => {
    categoryListJson.value = data.categories
  })
  .catch((err) => {
    console.error('Failed to load category data:', err)
  })

// ------ 多選功能（沿用 dealerProduct.js）------
const selectedIds = ref([])

const toggleItem = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const isAllSelected = computed(() => {
  return (
    productListJson.value.length > 0 && selectedIds.value.length === productListJson.value.length
  )
})

const toggleAll = (checked) => {
  selectedIds.value = checked ? productListJson.value.map((item) => item.product_id) : []
}

// ------ 以下功能本次留空 ------
const setProductStatus = (v) => {} // 原本打 API，本機無 API → 留空
const showEditProduct = (v) => {} // 列內「編輯」鈕
const toFirstUp = (id) => {} // 列內「置頂」鈕
const delProduct = (id) => {} // 列內「刪除」鈕

// ------ 批次修改分類 ------
// ------ 批量更新分類 ------
const availableSubCateList = ref([])
const availableLeafCateList = ref([])
const batchUpdateCateDialogVisible = ref(false)
const batchUpdCateForm = reactive({
  mainCategoryId: null,
  subCategoryId: null,
  leafCategoryId: null,
})

const openBatchUpdCateDialog = () => {
  batchUpdateCateDialogVisible.value = true
  resetBatchUpdCateForm()
}

const resetBatchUpdCateForm = () => {
  batchUpdCateForm.mainCategoryId = null
  batchUpdCateForm.subCategoryId = null
  batchUpdCateForm.leafCategoryId = null

  availableSubCateList.value = []
  availableLeafCateList.value = []
}

// EP 預設會傳新值，value 是綁定 categoryId
const handleBatchMainChange = (val) => {
  // 清空
  batchUpdCateForm.subCategoryId = null
  batchUpdCateForm.leafCategoryId = null
  availableSubCateList.value = []
  availableLeafCateList.value = []

  const main = categoryListJson.value.find((c) => c.categoryId === batchUpdCateForm.mainCategoryId)
  availableSubCateList.value = main && main.children ? main.children : []
}

const handleBatchSubChange = (val) => {
  batchUpdCateForm.leafCategoryId = null

  const main = categoryListJson.value.find((c) => c.categoryId === batchUpdCateForm.mainCategoryId)
  const sub =
    main && main.children
      ? main.children.find((c) => c.categoryId === batchUpdCateForm.subCategoryId)
      : []
  availableLeafCateList.value = sub && sub.children ? sub.children : []
}

// ------ 商城分類常用設定（A/B/C 快捷）------
// 已儲存的常用分類清單（純記憶體 state，驅動上方 A/B/C 快捷按鈕）
const categoryPresets = ref([])
const committedDefaultId = ref(null)

// dialog 編輯用的草稿（取消即丟棄、儲存才寫回 committed）
const hotkeyDialogVisible = ref(false)
const presetDraft = ref([])
const draftDefaultId = ref(null)
let presetSeq = 0

// ---- 分類查找工具 ----
const findMainCate = (mainId) => categoryListJson.value.find((c) => c.categoryId === mainId)
const findSubCate = (mainId, subId) => {
  const main = findMainCate(mainId)
  return main && main.children ? main.children.find((c) => c.categoryId === subId) : undefined
}
const findLeafCate = (mainId, subId, leafId) => {
  const sub = findSubCate(mainId, subId)
  return sub && sub.children ? sub.children.find((c) => c.categoryId === leafId) : undefined
}

// 各列的次/子分類選項（依該列已選主/次分類動態取得）
const getPresetSubOptions = (p) => {
  const main = findMainCate(p.mainCategoryId)
  return main && main.children ? main.children : []
}
const getPresetLeafOptions = (p) => {
  const sub = findSubCate(p.mainCategoryId, p.subCategoryId)
  return sub && sub.children ? sub.children : []
}

// ---- 開啟 / 列操作 ----
const handleHotkeySetupClick = () => {
  // categoryPresets 是「已儲存的常用分類清單」，presetDraft 是「dialog 編輯用的草稿」
  presetDraft.value = JSON.parse(JSON.stringify(categoryPresets.value))
  draftDefaultId.value = committedDefaultId.value
  if (presetDraft.value.length === 0) addPreset()
  hotkeyDialogVisible.value = true
}

const addPreset = () => {
  presetDraft.value.push({
    id: ++presetSeq,
    name: '',
    mainCategoryId: null,
    subCategoryId: null,
    leafCategoryId: null,
    hotkey: '', // '' | 'A' | 'B' | 'C'
  })
}

const removePreset = (id) => {
  presetDraft.value = presetDraft.value.filter((p) => p.id !== id)
  if (draftDefaultId.value === id) draftDefaultId.value = null
}

// 該列主分類變更 → 清掉次/子分類
const onPresetMainChange = (p) => {
  p.subCategoryId = null
  p.leafCategoryId = null
}
// 該列次分類變更 → 清掉子分類
const onPresetSubChange = (p) => {
  p.leafCategoryId = null
}

// 快捷碼為單選不重複：選了已被別列使用的字母，先清掉別列
const onPresetHotkeyChange = (p) => {
  if (!p.hotkey) return
  presetDraft.value.forEach((o) => {
    if (o.id !== p.id && o.hotkey === p.hotkey) o.hotkey = ''
  })
}

// ---- 驗證：以 isVisible 判斷是否「店家許可」----
const getPresetError = (p) => {
  const main = findMainCate(p.mainCategoryId)
  if (main && main.isVisible === false)
    return `主分類「${main.name}」超出可用範圍，請修改後才可儲存`
  const sub = findSubCate(p.mainCategoryId, p.subCategoryId)
  if (sub && sub.isVisible === false) return `次分類「${sub.name}」超出可用範圍，請修改後才可儲存`
  const leaf = findLeafCate(p.mainCategoryId, p.subCategoryId, p.leafCategoryId)
  if (leaf && leaf.isVisible === false)
    return `子分類「${leaf.name}」超出可用範圍，請修改後才可儲存`
  return ''
}

const hotkeyHasError = computed(() => presetDraft.value.some((p) => getPresetError(p) !== ''))

// ---- 儲存 / 取消 ----
const saveHotkeySettings = () => {
  if (hotkeyHasError.value) return
  categoryPresets.value = JSON.parse(JSON.stringify(presetDraft.value))
  committedDefaultId.value = draftDefaultId.value
  hotkeyDialogVisible.value = false
}

const cancelHotkeySettings = () => {
  hotkeyDialogVisible.value = false
}

// ---- 上方 A/B/C 快捷按鈕（連動 committed 設定）----
const quickButtons = computed(() =>
  ['A', 'B', 'C']
    .map((letter) => ({
      letter,
      preset: categoryPresets.value.find((p) => p.hotkey === letter) || null,
    }))
    .filter((q) => q.preset),
)

// 點快捷按鈕 → 帶入批次修改表單
const applyPreset = (preset) => {
  batchUpdCateForm.mainCategoryId = preset.mainCategoryId
  const main = findMainCate(preset.mainCategoryId)
  availableSubCateList.value = main && main.children ? main.children : []

  batchUpdCateForm.subCategoryId = preset.subCategoryId
  const sub = findSubCate(preset.mainCategoryId, preset.subCategoryId)
  availableLeafCateList.value = sub && sub.children ? sub.children : []

  batchUpdCateForm.leafCategoryId = preset.leafCategoryId
}
</script>

<template>
  <div class="mb-3" id="prdList">
    <div class="d-flex justify-content-between mb-2 pt-3 px-3 flex-wrap">
      <div class="btn-wrapper d-flex gap-3 flex-wrap flex-md-nowrap w-100 w-md-auto">
        <!-- 批量更新分類 -->
        <button
          class="align-self-baseline batch-update-category-btn btn"
          type="button"
          @click="openBatchUpdCateDialog"
        >
          <i class="fa-solid fa-layer-group me-1"></i>
          <span>批次商城分類</span>
        </button>
      </div>
    </div>

    <div class="card-body p-0">
      <div class="table-responsive scrollbar">
        <table
          class="product-list-table table table-sm table-striped overflow-hidden"
          style="min-width: 900px"
          id="tab-productList"
        >
          <!-- 7欄表格集中管理 -->
          <colgroup>
            <col style="width: 1%" />
            <col style="width: 100px" />
            <col style="width: 150px" />
            <col />
            <col span="3" style="width: 150px" />
          </colgroup>

          <thead class="bg-200 text-900">
            <tr>
              <th>
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleAll($event.target.checked)"
                />
              </th>
              <th class="text-center">上/下架</th>
              <th class="text-center">圖片</th>
              <th>商品名稱</th>
              <th>分類</th>
              <th>連結時效</th>
              <th>編輯</th>
            </tr>
          </thead>
          <tbody class="list" id="table-orders-body">
            <tr class="btn-reveal-trigger" v-for="v in productListJson" :key="v.product_id">
              <td>
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="selectedIds.includes(v.product_id)"
                  @change="toggleItem(v.product_id)"
                />
              </td>
              <td>
                <div class="form-switch text-center">
                  <input
                    @click="setProductStatus(v)"
                    class="form-check-input"
                    type="checkbox"
                    v-model="v.product_status"
                  />
                </div>
              </td>
              <td class="text-center">
                <img :src="v.product_imagebase64" />
              </td>
              <td>{{ v.product_name }}</td>
              <td>
                <span v-if="v.product_class != null">
                  <span v-for="vv in v.product_class"
                    ><span v-if="vv.ClassChecked">#{{ vv.ClassName }}<br /></span
                  ></span>
                </span>
              </td>
              <td>{{ v.date_s }}~<br />{{ v.date_e }}</td>
              <td>
                <!-- 編輯 -->
                <button class="btn-edit" @click="showEditProduct(v)" title="編輯">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <!-- 置頂 -->
                <button class="btn-fixed" @click="toFirstUp(v.product_id)" title="置頂">
                  <i class="fa-solid fa-thumbtack"></i>
                </button>
                <!-- 刪除 -->
                <button class="btn-remove" @click="delProduct(v.product_id)" title="移除">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- 批次更新分類modal -->
  <el-dialog v-model="batchUpdateCateDialogVisible" width="90%" id="batch-upd-cate-dialog">
    <template #header>
      <div class="my-dialog-header">
        <i class="fa-solid fa-layer-group me-2"></i>
        <span>批次修改商城分類</span>
      </div>
    </template>

    <div class="mb-3">
      即將更新 <strong>{{ selectedIds.length }}</strong> 件商品的商城分類
    </div>

    <div class="dialog-content-wrapper">
      <!-- 快捷鍵設定 -->
      <div class="tab-button-wrapper d-flex justify-content-between">
        <div><i class="fa-solid fa-layer-group me-2"></i> 新分類設定</div>
        <div class="tab-button-group d-flex">
          <button
            v-for="q in quickButtons"
            :key="q.letter"
            class="tab-btn"
            :class="`tab-${q.letter.toLowerCase()}`"
            type="button"
            @click="applyPreset(q.preset)"
          >
            <span class="tab-label">{{ q.letter }}</span
            >{{ q.preset.name }}
          </button>
          <!-- 快捷鍵設定 -->
          <button class="tab-btn tab-setting" type="button" @click="handleHotkeySetupClick">
            <i class="fa-solid fa-gear"></i>
          </button>
        </div>
      </div>
      <!-- 下拉選單 -->
      <!-- todos : 串API => 店家許可的分類 -->
      <el-form :model="batchUpdCateForm" label-position="top">
        <!-- 主分類 -->
        <el-form-item label="主分類" required>
          <el-select
            v-model="batchUpdCateForm.mainCategoryId"
            placeholder="請選擇主分類"
            @change="handleBatchMainChange"
          >
            <el-option
              v-for="main in categoryListJson"
              :key="main.categoryId"
              :label="main.name"
              :value="main.categoryId"
            />
          </el-select>
        </el-form-item>

        <!-- 次分類 -->
        <el-form-item label="次分類" required>
          <el-select
            v-model="batchUpdCateForm.subCategoryId"
            :disabled="!batchUpdCateForm.mainCategoryId"
            :placeholder="batchUpdCateForm.mainCategory ? '— 請選擇次分類 —' : '— 請先選擇主分類 —'"
            @change="handleBatchSubChange"
          >
            <el-option
              v-for="sub in availableSubCateList"
              :key="sub.categoryId"
              :label="sub.name"
              :value="sub.categoryId"
            />
          </el-select>
        </el-form-item>

        <!-- 子分類 -->
        <el-form-item label="子分類" required>
          <el-select
            v-model="batchUpdCateForm.leafCategoryId"
            :disabled="!batchUpdCateForm.subCategoryId"
            :placeholder="batchUpdCateForm.subCategory ? '— 請選擇子分類 —' : '— 請先選擇次分類 —'"
          >
            <el-option
              v-for="leaf in availableLeafCateList"
              :key="leaf.categoryId"
              :label="leaf.name"
              :value="leaf.categoryId"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="batchUpdateCateDialogVisible = false">取消</el-button>
        <el-button type="primary"> 確定執行 </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 商城分類常用設定 dialog -->
  <el-dialog v-model="hotkeyDialogVisible" width="90%" id="hotkey-setup-dialog">
    <template #header>
      <div class="my-dialog-header">
        <i class="fa-solid fa-gear me-2"></i>
        <span>商城分類常用設定</span>
      </div>
    </template>

    <div class="hotkey-info">
      <i class="fa-solid fa-circle-info me-2"></i>
      新增多組常用分類後，最多可指定 3 組作為快速按鈕（A／B／C）顯示在新增商品或批次修改時。並可勾選
      1 組為預設，新增商品時會自動帶入。
    </div>

    <table class="hotkey-table">
      <thead>
        <tr>
          <th class="col-default">預設</th>
          <th class="col-name">名稱</th>
          <th>主分類</th>
          <th>次分類</th>
          <th>子分類</th>
          <th class="col-hotkey">快捷</th>
          <th class="col-del">刪除</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="p in presetDraft" :key="p.id">
          <!-- 超出可用範圍警告列 -->
          <tr v-if="getPresetError(p)" class="hotkey-warning-row">
            <td colspan="7">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>{{ getPresetError(p) }}
            </td>
          </tr>
          <tr :class="{ 'has-error': getPresetError(p) }">
            <td class="col-default">
              <el-radio v-model="draftDefaultId" :value="p.id">
                <span class="visually-hidden">設為預設</span>
              </el-radio>
            </td>
            <td class="col-name">
              <el-input v-model="p.name" placeholder="名稱" />
            </td>
            <td>
              <el-select
                v-model="p.mainCategoryId"
                placeholder="請選擇主分類"
                :class="{ 'is-invalid-cate': findMainCate(p.mainCategoryId)?.isVisible === false }"
                @change="onPresetMainChange(p)"
              >
                <el-option
                  v-for="main in categoryListJson"
                  :key="main.categoryId"
                  :label="main.name"
                  :value="main.categoryId"
                />
              </el-select>
            </td>
            <td>
              <el-select
                v-model="p.subCategoryId"
                placeholder="請選擇次分類"
                :disabled="!p.mainCategoryId"
                @change="onPresetSubChange(p)"
              >
                <el-option
                  v-for="sub in getPresetSubOptions(p)"
                  :key="sub.categoryId"
                  :label="sub.name"
                  :value="sub.categoryId"
                />
              </el-select>
            </td>
            <td>
              <el-select
                v-model="p.leafCategoryId"
                placeholder="請選擇子分類"
                :disabled="!p.subCategoryId"
              >
                <el-option
                  v-for="leaf in getPresetLeafOptions(p)"
                  :key="leaf.categoryId"
                  :label="leaf.name"
                  :value="leaf.categoryId"
                />
              </el-select>
            </td>
            <td class="col-hotkey">
              <el-select
                v-model="p.hotkey"
                placeholder="—"
                clearable
                @change="onPresetHotkeyChange(p)"
              >
                <el-option label="A" value="A" />
                <el-option label="B" value="B" />
                <el-option label="C" value="C" />
              </el-select>
            </td>
            <td class="col-del">
              <button class="hotkey-del-btn" type="button" title="刪除" @click="removePreset(p.id)">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <div class="hotkey-add-wrapper">
      <button class="hotkey-add-btn" type="button" @click="addPreset">
        <i class="fa-solid fa-plus me-1"></i>新增一組常用分類
      </button>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelHotkeySettings">取消</el-button>
        <el-button type="success" :disabled="hotkeyHasError" @click="saveHotkeySettings">
          <i class="fa-solid fa-floppy-disk me-1"></i>儲存設定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
div#prdList {
  max-width: 1200px;
  margin: 0 auto;
}

#tab-productList thead th,
#tab-productList td {
  /* 因需套用table.scss樣式 故只能分開寫 */
  padding-top: 20px;
  padding-bottom: 20px;
}

#tab-productList th,
#tab-productList td {
  vertical-align: middle;
}

#tab-productList th {
  white-space: nowrap;
}

#tab-productList .form-check-input {
  cursor: pointer;
}

#tab-productList .product-list-table img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

/* 操作列 */
#tab-productList .btn-remove,
#tab-productList .btn-edit,
#tab-productList .btn-fixed {
  color: #bbb;
  cursor: pointer;
  background: none;
  border: none;
  font-size: 1.1rem;
}

@media (hover: hover) and (pointer: fine) {
  #tab-productList .btn-remove:hover {
    color: #e54623;
  }

  #tab-productList .btn-edit:hover {
    color: rgb(22 163 74);
  }

  #tab-productList .btn-fixed:hover {
    color: rgb(56 189 248);
  }
}

:root {
  --blue-primary: #3b82f6;
  --el-dialog-border: #bcd9ff;
  --el-dialog-content-bg: #fafcff;
  --bright-yellow: rgb(251 191 36);
  --dark-brown: rgb(113 63 18);
}

/* 批次修改分類dialog */
#batch-upd-cate-dialog.el-dialog {
  max-width: 500px;
}

#batch-upd-cate-dialog .el-dialog__body > div:first-child strong {
  font-size: 24px;
  font-weight: bold;
  color: var(--blue-primary);
  margin: 0 4px;
}

#batch-upd-cate-dialog .tab-button-wrapper > div:first-child {
  border-radius: 9999px;
  border: 1px solid var(--el-dialog-border);
  padding: 0 16px;
  line-height: 180%;
  background-color: #dbeafe;
  color: var(--blue-primary);
}

#batch-upd-cate-dialog .dialog-content-wrapper {
  border: 1px solid var(--el-dialog-border);
  border-radius: 0.5rem;
  padding: 16px;
  background-color: var(--el-dialog-content-bg);
}

#batch-upd-cate-dialog .tab-button-wrapper {
  margin-top: -16px;
  transform: translateY(-50%);
}

.tab-button-group {
  flex-wrap: wrap; /* 擠不下就換行 */
  gap: 0.5rem; /* 按鈕間距 */
  justify-content: flex-end; /* 桌機靠右，與標籤分置兩端 */
}

.tab-button-group .tab-btn {
  border: none;
  background: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.6rem;
  white-space: nowrap; /* 整顆按鈕一起換行，內文不斷字 */
  line-height: 1.2;
}

.tab-button-group .tab-btn.tab-setting {
  background-color: var(--bright-yellow);
  color: var(--dark-brown);
  border: 1px solid rgb(234 179 8);
}

/* 手機：標籤與按鈕群改上下堆疊，按鈕群換行從左排起 */
@media (max-width: 768px) {
  #batch-upd-cate-dialog .tab-button-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .tab-button-group {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (hover: hover) and (pointer: fine) {
  .tab-button-group .tab-btn.tab-setting:hover {
    background-color: rgb(245 158 11);
  }

  /* 商城分類常用設定 dialog */
  .hotkey-info {
    background: #fdf6e3;
    border: 1px solid #f5e6a8;
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 0.875rem;
    color: #8a6d3b;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .hotkey-table {
    width: 100%;
    border-collapse: collapse;
  }

  .hotkey-table thead th {
    font-weight: 500;
    color: #606266;
    text-align: left;
    padding: 8px 6px;
    border-bottom: 1px solid #ebeef5;
    white-space: nowrap;
  }

  .hotkey-table tbody td {
    padding: 8px 6px;
    vertical-align: middle;
  }

  .hotkey-table .col-default,
  .hotkey-table .col-hotkey,
  .hotkey-table .col-del {
    text-align: center;
    width: 1%;
    white-space: nowrap;
  }

  .hotkey-table .col-name {
    width: 160px;
  }

  .hotkey-table .col-hotkey {
    width: 90px;
  }

  .hotkey-table tr.has-error td {
    background: #fef0f0;
  }

  .hotkey-warning-row td {
    color: #e54623;
    font-size: 0.85rem;
    padding: 8px 6px 0;
    background: #fef0f0;
  }

  .hotkey-table .is-invalid-cate :deep(.el-select__wrapper) {
    box-shadow: 0 0 0 1px #e54623 inset;
  }

  .hotkey-del-btn {
    color: #bbb;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.05rem;
  }

  .hotkey-del-btn:hover {
    color: #e54623;
  }

  .hotkey-add-wrapper {
    margin-top: 16px;
  }

  .hotkey-add-btn {
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    color: #606266;
  }

  .hotkey-add-btn:hover {
    border-color: #c0c4cc;
    color: #409eff;
  }
}

/* 快捷鍵 */
#batch-upd-cate-dialog .tab-btn {
  background-color: var(--bright-yellow);
  color: rgb(17 24 39);
}

#batch-upd-cate-dialog .tab-btn .tab-label {
  background-color: rgb(0 0 0 / 0.3);
  border-radius: 2px;
  padding: 0 4px;
  color: #fff;
  margin-right: 4px;
}
</style>
<style>
#batch-upd-cate-dialog.el-dialog {
  max-width: 500px;
}

#hotkey-setup-dialog.el-dialog {
  max-width: 900px;
}

:root {
  --blue-primary: #3b82f6;
  --el-dialog-border: #bcd9ff;
  --el-dialog-content-bg: #fafcff;
  --bright-yellow: rgb(251 191 36);
  --dark-brown: rgb(113 63 18);
}

/* dialog共用 因ep-dialog 沒有data-v 屬性，故要放在style標籤內 */
#batch-upd-cate-dialog.el-dialog,
#hotkey-setup-dialog.el-dialog {
  --el-dialog-padding-primary: 0;
}

#batch-upd-cate-dialog.el-dialog .el-dialog__header,
#hotkey-setup-dialog.el-dialog .el-dialog__header {
  padding: 16px;
  font-weight: bold;
  border-top-left-radius: var(--el-dialog-border-radius);
  border-top-right-radius: var(--el-dialog-border-radius);
}

#batch-upd-cate-dialog.el-dialog .el-dialog__body,
#hotkey-setup-dialog.el-dialog .el-dialog__body {
  padding: 16px;
}

#batch-upd-cate-dialog.el-dialog .el-dialog__footer,
#hotkey-setup-dialog.el-dialog .el-dialog__footer {
  padding: 16px;
  padding-top: 0;
}

#batch-upd-cate-dialog .el-dialog__header {
  background-color: var(--blue-primary);
  color: #fff;
}
</style>
