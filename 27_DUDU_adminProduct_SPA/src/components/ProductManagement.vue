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

  batchUpdCateForm.mainCategoryId = val
  const main = categoryListJson.value.find((c) => c.categoryId === batchUpdCateForm.mainCategoryId)
  availableSubCateList.value = main && main.children ? main.children : []
}

const handleBatchSubChange = (val) => {
  batchUpdCateForm.leafCategoryId = null

  batchUpdCateForm.subCategoryId = val
  const main = categoryListJson.value.find((c) => c.categoryId === batchUpdCateForm.mainCategoryId)
  const sub =
    main && main.children
      ? main.children.find((c) => c.categoryId === batchUpdCateForm.subCategoryId)
      : []
  availableLeafCateList.value = sub && sub.children ? sub.children : []
}

const handleBatchLeafChange = (val) => {
  batchUpdCateForm.leafCategoryId = val
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
          <button class="tab-btn tab-a"><span class="tab-label">A</span>狗飼料常用</button>
          <button class="tab-btn tab-b"><span class="tab-label">B</span>狗飼料常用</button>
          <button class="tab-btn tab-c"><span class="tab-label">C</span>狗飼料常用</button>
          <!-- 快捷鍵設定 -->
          <button class="tab-btn tab-setting" @click="handleHotkeySetupClick">
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
            @change="handleBatchLeafChange"
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
</style>
<style>
#batch-upd-cate-dialog.el-dialog {
  max-width: 500px;
}
</style>
