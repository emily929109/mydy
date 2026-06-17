<script setup>
import CategoryRow from './components/CategoryRow.vue'
import { useCategories } from './composables/useCategories'
import CategoryMenu from './components/CategoryMenu.vue'
import Storefront from './components/storefront/Storefront.vue'
import { ref } from 'vue'
import ProductRow from './components/ProductManagement.vue'

// 前後台切換：'admin'（後台分類管理）/ 'store'（前台商品列表）
const view = ref('admin')

// 選取/列內動作已移入 CategoryRow 自行處理，這裡只留版面與統計用到的
// 結構
const {
  currentRole,
  isAdmin,
  mainList,
  subList,
  leafList,
  selectedMain,
  selectedSub,
  getEffectiveProductCount,
  totalLeafActive,
  handleSave,
  handleAddCategory,
  dialogFormVisible,
  updateCategoryAllInOne,
  currentItem,
  form,
  formLabelWidth,
  subListForTrans,
  leafListForTrans,
  handleMainChange,
  handleSubChange,
  handleLeafChange,
} = useCategories()

const categoryTree = ref([
  {
    categoryId: 1,
    name: '服飾',
    children: [
      {
        categoryId: 2,
        name: '男裝',
        children: [
          { categoryId: 4, name: '外套' },
          { categoryId: 5, name: '牛仔褲' },
        ],
      },
      {
        categoryId: 3,
        name: '女裝',
        children: [{ categoryId: 6, name: '洋裝' }],
      },
    ],
  },
  {
    categoryId: 7,
    name: '鞋類',
    children: [
      {
        categoryId: 8,
        name: '運動鞋',
        children: [
          { categoryId: 10, name: '慢跑鞋' },
          { categoryId: 11, name: '籃球鞋' },
        ],
      },
      {
        categoryId: 9,
        name: '皮鞋',
        children: [], // 即使沒有子層，空陣列也不會讓程式崩潰
      },
    ],
  },
])

const handleSelect = (index) => {
  console.log('使用者點擊了最末端的子分類，其 categoryId 為:', index)
}
</script>

<template>
  <!-- ===== 共用 Navbar ===== -->
  <nav class="app-navbar">
    <div class="app-navbar__logo">
      <span class="logo-mark">
        <i class="fa-solid fa-cart-shopping"></i>
      </span>
      <span>DUDU<span class="logo-text-pay">PAY</span></span>
    </div>

    <div class="app-navbar__menu">
      <a
        v-if="isAdmin"
        href="#"
        class="app-navbar__link app-navbar__link--admin"
        :class="{ 'is-active': view === 'admin' }"
        @click.prevent="view = 'admin'"
      >
        <i class="fa-solid fa-circle-user"></i>
        系統總後台
      </a>
      <a
        href="#"
        class="app-navbar__link"
        :class="{ 'is-active': view === 'dealer' }"
        @click.prevent="view = 'dealer'"
      >
        店家後台
      </a>
      <a
        href="#"
        class="app-navbar__cta"
        :class="{ 'is-active': view === 'store' }"
        @click.prevent="view = 'store'"
      >
        <i class="fa-solid fa-bag-shopping"></i>
        購物專區
      </a>
    </div>
  </nav>

  <!-- ===== 總後台 : 分類管理 ===== -->
  <template v-if="view === 'admin'">
    <!-- ===== Page Banner ===== -->
    <div class="page-banner">
      <div class="page-banner__title">
        <i class="fa-solid fa-sitemap"></i>
        商城分類管理
        <i class="fa-solid fa-circle-info"></i>
      </div>
      <el-button type="warning" round @click="handleSave">
        <i class="fa-solid fa-floppy-disk" style="margin-right: 6px"></i>
        儲存所有變更
      </el-button>
    </div>

    <!-- ===== 三欄分類管理 ===== -->
    <div class="category-board">
      <!-- 主分類 -->
      <div class="category-column">
        <div class="category-column__header">主分類(全 {{ mainList.length }} 項)</div>
        <div class="category-column__body">
          <CategoryRow
            v-for="(item, idx) in mainList"
            :key="item.id"
            :item="item"
            :index="idx"
            :level="1"
          />
        </div>
        <!-- <div class="category-column__footer">
          <span
            >主類別: <b>{{ mainList.length }}</b> 項</span
          >
          <span class="divider"></span>
          <span
            >全站上架數: <b>{{ totalLeafActive }}</b> 件</span
          >
        </div> -->
        <!-- <div class="category-column__action">
          <el-button @click="handleAddCategory('主')">+ 新增主分類</el-button>
        </div> -->
      </div>

      <!-- 次分類 -->
      <div class="category-column">
        <div class="category-column__header">次分類(全 {{ subList.length }} 項)</div>
        <div class="category-column__body">
          <CategoryRow
            v-for="(item, idx) in subList"
            :key="item.id"
            :item="item"
            :index="idx"
            :level="2"
          />
        </div>
        <!-- <div class="category-column__footer">
          <span
            >次類別小計: <b>{{ subList.length }}</b> 項</span
          >
          <span class="divider"></span>
          <span>
            主類別上架數:
            <b>{{ selectedMain ? getEffectiveProductCount(selectedMain) : 0 }}</b>
            件
          </span>
        </div> -->
        <!-- <div class="category-column__action">
          <el-button @click="handleAddCategory('次')">+ 新增次分類</el-button>
        </div> -->
      </div>

      <!-- 子分類 -->
      <div class="category-column">
        <div class="category-column__header">子分類(全 {{ leafList.length }} 項)</div>
        <div class="category-column__body">
          <CategoryRow
            v-for="(item, idx) in leafList"
            :key="item.id"
            :item="item"
            :index="idx"
            :level="3"
          />
        </div>
        <!-- <div class="category-column__footer">
          <span
            >子分類小計: <b>{{ leafList.length }}</b> 項</span
          >
          <span class="divider"></span>
          <span>
            次類別內上架數:
            <b>{{ selectedSub ? getEffectiveProductCount(selectedSub) : 0 }}</b>
            件
          </span>
        </div> -->
        <!-- <div class="category-column__action">
          <el-button @click="handleAddCategory('子')">+ 新增子分類</el-button>
        </div> -->
      </div>
    </div>
  </template>

  <!-- ===== 前台：商品列表 ===== -->
  <Storefront v-if="view === 'store'" :tree="categoryTree" />

  <!-- ===== Demo 角色切換器 ===== -->
  <div class="role-switcher">
    <span class="role-switcher__label">Demo 角色切換</span>
    <el-radio-group v-model="currentRole" size="small">
      <el-radio-button value="admin">admin</el-radio-button>
      <el-radio-button value="user">user</el-radio-button>
      <el-radio-button value="guest">guest</el-radio-button>
    </el-radio-group>
  </div>

  <!-- ===== 轉移modal 開始 ===== -->
  <!--原本想放在 useCategories.js 內，但因只需render一次，且要用到 App.vue 的 mainList/subList/leafList，所以還是放在 App.vue 內-->
  <el-dialog v-model="dialogFormVisible" width="500px" custom-class="custom-category-dialog">
    <template #header>
      <div class="my-dialog-header">
        <i class="fa-solid fa-truck-moving me-2" style="color: rgb(217 119 6); font-size: 18px"></i>
        <span>隱藏分類與商品處理</span>
      </div>
    </template>

    <div class="mb-3">
      隱藏：「 <strong>{{ currentItem?.nickName || currentItem?.name }}</strong> 」
    </div>

    <el-radio-group v-model="form.actionType" class="dialog-radio-group">
      <div class="action-card" :class="{ active: form.actionType === 'TRANSFER' }">
        <el-radio value="TRANSFER">
          <span class="action-card-title">隱藏分類，並轉移商品至指定分類</span>
        </el-radio>

        <div class="card-content" v-if="form.actionType === 'TRANSFER'">
          <div class="form-item">
            <label>目標主分類 <span class="required">(必填)</span></label>
            <el-select
              v-model="form.mainCategoryId"
              placeholder="— 請選擇主分類 —"
              @change="handleMainChange"
            >
              <el-option
                v-for="c in mainList"
                :key="c.categoryId"
                :label="c.nickName || c.name"
                :value="c.categoryId"
              />
            </el-select>
          </div>

          <div class="form-item">
            <label>目標次分類 <span class="hint">(不選則預設「其他」)</span></label>
            <el-select
              v-model="form.subCategoryId"
              :disabled="!form.mainCategoryId"
              :placeholder="form.mainCategoryId ? '— 請選擇次分類 —' : '— 先選主分類 —'"
              @change="handleSubChange"
            >
              <el-option
                v-for="c in subListForTrans"
                :key="c.categoryId"
                :label="c.nickName || c.name"
                :value="c.categoryId"
              />
            </el-select>
          </div>

          <div class="form-item">
            <label>目標子分類 <span class="hint">(不選則預設「其他」)</span></label>
            <el-select
              v-model="form.leafCategoryId"
              :disabled="!form.subCategoryId"
              :placeholder="form.subCategoryId ? '— 請選擇子分類 —' : '— 先選次分類 —'"
              @change="handleLeafChange"
            >
              <el-option
                v-for="c in leafListForTrans"
                :key="c.categoryId"
                :label="c.nickName || c.name"
                :value="c.categoryId"
              />
            </el-select>
          </div>
        </div>
      </div>
      <div class="action-card danger-card" :class="{ active: form.actionType === 'DISMISS' }">
        <el-radio value="DISMISS">
          <span class="action-card-title danger-text">隱藏分類，並強制下架所屬商品</span>
        </el-radio>
        <div class="card-desc">強制下架所有此分類下商品，重新上架時需要商家重新設定分類。</div>
      </div>
    </el-radio-group>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateCategoryAllInOne"> 確定執行 </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- ===== 店家後台 : 商品管理、分類管理===== -->
  <ProductRow v-if="view === 'dealer'" />
</template>

<style scoped>
/* ---------- Navbar ---------- */
.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 14px 36px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}
.app-navbar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 20px;
  color: #2c2f48;
}
.app-navbar__logo .logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #6e5cf7, #b06bff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}
.app-navbar__logo .logo-text-pay {
  color: #6e5cf7;
}
.app-navbar__menu {
  display: flex;
  align-items: center;
  gap: 28px;
}
.app-navbar__link {
  font-size: 14px;
  color: #2c2f48;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;
}
.app-navbar__link:hover {
  color: #6e5cf7;
}
.app-navbar__link.is-active {
  color: #6e5cf7;
  font-weight: bold;
  text-decoration: underline;
}
.app-navbar__cta {
  background: #ffc23c;
  color: #2c2f48;
  border-radius: 24px;
  padding: 8px 18px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  transition: background 0.15s;
}
.app-navbar__cta:hover {
  background: #ffb420;
}
.app-navbar__cta.is-active {
  background: #ffb420;
  box-shadow: 0 0 0 3px rgba(255, 180, 32, 0.35);
}

/* ---------- Page banner ---------- */
.page-banner {
  background: linear-gradient(135deg, #6e5cf7, #8a6df9);
  color: #fff;
  padding: 22px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-banner__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
}
.page-banner__title i.fa-circle-info {
  font-size: 14px;
  opacity: 0.8;
}

/* ---------- Category board (three columns) ---------- */
.category-board {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  padding: 24px 36px 36px;
  max-width: 1200px;
  margin: 0 auto;
}
.category-column {
  background: #f0f1f7;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
}
.category-column__header {
  font-size: 13px;
  font-weight: 600;
  color: #6c7090;
  padding: 6px 10px 12px;
}
.category-column__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  margin-bottom: 12px;
}
.category-column__footer {
  font-size: 12px;
  color: #6c7090;
  background: #ffffff;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.category-column__footer b {
  color: #2c2f48;
}
.category-column__footer .divider {
  width: 1px;
  height: 12px;
  background: #d3d6e3;
  margin: 0 8px;
}
.category-column__action :deep(.el-button) {
  width: 100%;
  background: #fff;
  border: 1px dashed #b8bcd0;
  color: #6e5cf7;
}
.category-column__action :deep(.el-button:hover) {
  background: #f4f5ff;
  border-color: #6e5cf7;
}

/* ---------- Role switcher (demo only) ---------- */
.role-switcher {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: #fff;
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(44, 47, 72, 0.15);
  z-index: 1000;
}
.role-switcher__label {
  font-size: 12px;
  color: #8a8fa3;
  margin-bottom: 6px;
  display: block;
}

/* ---------- 轉移modal ---------- */
.el-modal-dialog .el-dialog {
  width: 90%;
  max-width: 500px;
}

.dialog-radio-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  align-items: stretch;
}

.action-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
  transition: all 0.2s;
}

.action-card.active {
  background-color: #fffbeb;
  border-color: #fde047;
}

/* 第二個卡片選中時的淡灰色背景 */
.danger-card.active {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

/* 標題與標籤排版 */
.action-card-title {
  font-weight: bold;
  color: #c2410c;
}

.danger-text {
  color: #dc2626;
}

.card-content {
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-item label {
  font-size: 13px;
  color: #4b5563;
}

.form-item .required {
  color: #dc2626;
}

.form-item .hint {
  color: #9ca3af;
}

/* 下拉選單強制撐滿 */
.form-item .el-select {
  width: 100%;
}

.card-desc {
  margin-top: 6px;
  padding-left: 24px;
  font-size: 13px;
  color: #6b7280;
}

/* 按鈕顏色調配 */
.btn-submit {
  background-color: #f59e0b !important;
  border-color: #f59e0b !important;
  color: white !important;
}
</style>

<style>
/* ---------- Global resets（非 scoped）---------- */
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: 'Microsoft JhengHei', 'PingFang TC', sans-serif;
  background: #f5f6fa;
  color: #2c2f48;
}
</style>
