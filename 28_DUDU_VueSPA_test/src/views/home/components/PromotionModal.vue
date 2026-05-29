<script setup>
const visible = defineModel({ type: Boolean, default: false })

// 對應原站 index.js clickPromotionDetail / clickPromotionStore（維持導向正式站）
function clickPromotionDetail() {
  window.location.href = 'https://www.dudupay.com.tw/Home/StoreList'
}
function clickPromotionStore() {
  window.location.href = 'https://www.dudupay.com.tw/Home/Travel'
}
</script>

<template>
  <el-dialog v-model="visible" :modal="true" class="promotion-modal">
    <a href="https://www.dudupay.com.tw/Home/Travel">
      <picture>
        <source media="(min-width:768px)" srcset="/img/travel/promotion20260518/index_modal.jpg" />
        <img src="/img/travel/promotion20260518/index_modalMb.jpg" alt="promotion_travel" />
      </picture>
    </a>
    <template #footer>
      <div class="dialog-footer d-flex flex-column-reverse flex-md-row justify-content-between align-items-center">
        <span @click="visible = false" class="missed" style="cursor: pointer">略過</span>
        <div>
          <el-button type="primary" class="w-100 w-md-auto mb-2 mb-md-0" @click="clickPromotionDetail">機酒推薦</el-button>
          <el-button type="primary" class="w-100 w-md-auto" @click="clickPromotionStore">立即訂票</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style>
/* 由原站 Index.cshtml「促銷活動modal」CSS 搬移 */
.promotion-modal {
  border-radius: 1em;
}

.promotion-modal img {
  width: 100%;
  border-radius: 1em;
}

.promotion-modal header {
  margin-bottom: 10px;
}

.promotion-modal .el-dialog__footer {
  padding-top: 2rem;
}

.promotion-modal .el-button {
  padding: 20px 40px;
  font-size: 1rem;
}

.promotion-modal .dialog-footer {
  gap: 12px;
}

.promotion-modal .el-dialog__header {
  display: none;
}

.promotion-modal .missed:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .el-button + .el-button {
    margin-left: 0px;
  }
  .el-dialog {
    --el-dialog-width: 70%;
  }
}
</style>
