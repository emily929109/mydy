<script setup>
import { ref, computed } from 'vue'

// 商品資料（取代公司專案的 API，改 fetch 假資料）
const productListJson = ref([])
fetch('fakeProductData.json')
  .then((res) => res.json())
  .then((data) => {
    productListJson.value = data
  })
  .catch((err) => {
    console.error('Failed to load product data:', err)
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
const openBatchUpdCateDialog = () => {} // 「批次商城分類」鈕；dialog 下一步才做
</script>

<template>
  <div class="mb-3" id="ordersTable">
    <div class="d-flex justify-content-between mb-2 pt-3 px-3 flex-wrap">
      <div class="btn-wrapper d-flex gap-3 flex-wrap flex-md-nowrap w-100 w-md-auto">
        <!-- 批量更新分類 -->
        <button
          class="align-self-baseline batch-update-category-btn btn"
          type="button"
          @click="openBatchUpdCateDialog"
        >
          <i class="fa-solid fa-layer-group me-1"></i>
          <span class="d-none d-md-inline-block">批次商城分類</span>
          <span class="d-inline-block d-md-none">批次分類</span>
        </button>
      </div>
    </div>

    <div class="card-body p-0">
      <div class="table-responsive scrollbar">
        <table
          class="product-list-table table table-sm table-striped overflow-hidden"
          style="min-width: 900px"
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
</template>
