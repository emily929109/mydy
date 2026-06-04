<script setup>
import CategoryRow from './components/CategoryRow.vue'
import { useCategories } from './composables/useCategories'

// 選取/列內動作已移入 CategoryRow 自行處理，這裡只留版面與統計用到的
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
} = useCategories()
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
      <a v-if="isAdmin" href="#" class="app-navbar__link app-navbar__link--admin">
        <i class="fa-solid fa-circle-user"></i>
        系統總後台
      </a>
      <a href="#" class="app-navbar__link">DUDUPAY介紹</a>
      <a href="#" class="app-navbar__link">最新消息</a>
      <a href="#" class="app-navbar__link">旅遊好康</a>
      <a href="#" class="app-navbar__cta">
        <i class="fa-solid fa-bag-shopping"></i>
        購物專區
      </a>
    </div>
  </nav>

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
        <CategoryRow v-for="(item, idx) in mainList" :key="item.id" :item="item" :index="idx" />
      </div>
      <div class="category-column__footer">
        <span
          >主類別: <b>{{ mainList.length }}</b> 項</span
        >
        <span class="divider"></span>
        <span
          >全站上架數: <b>{{ totalLeafActive }}</b> 件</span
        >
      </div>
      <div class="category-column__action">
        <el-button @click="handleAddCategory('主')">+ 新增主分類</el-button>
      </div>
    </div>

    <!-- 次分類 -->
    <div class="category-column">
      <div class="category-column__header">次分類(全 {{ subList.length }} 項)</div>
      <div class="category-column__body">
        <CategoryRow v-for="(item, idx) in subList" :key="item.id" :item="item" :index="idx" />
      </div>
      <div class="category-column__footer">
        <span
          >次類別小計: <b>{{ subList.length }}</b> 項</span
        >
        <span class="divider"></span>
        <span>
          主類別上架數:
          <b>{{ selectedMain ? getEffectiveProductCount(selectedMain) : 0 }}</b>
          件
        </span>
      </div>
      <div class="category-column__action">
        <el-button @click="handleAddCategory('次')">+ 新增次分類</el-button>
      </div>
    </div>

    <!-- 子分類 -->
    <div class="category-column">
      <div class="category-column__header">子分類(全 {{ leafList.length }} 項)</div>
      <div class="category-column__body">
        <CategoryRow v-for="(item, idx) in leafList" :key="item.id" :item="item" :index="idx" />
      </div>
      <div class="category-column__footer">
        <span
          >子分類小計: <b>{{ leafList.length }}</b> 項</span
        >
        <span class="divider"></span>
        <span>
          次類別內上架數:
          <b>{{ selectedSub ? getEffectiveProductCount(selectedSub) : 0 }}</b>
          件
        </span>
      </div>
      <div class="category-column__action">
        <el-button @click="handleAddCategory('子')">+ 新增子分類</el-button>
      </div>
    </div>
  </div>

  <!-- ===== Demo 角色切換器 ===== -->
  <div class="role-switcher">
    <span class="role-switcher__label">Demo 角色切換</span>
    <el-radio-group v-model="currentRole" size="small">
      <el-radio-button value="admin">admin</el-radio-button>
      <el-radio-button value="user">user</el-radio-button>
      <el-radio-button value="guest">guest</el-radio-button>
    </el-radio-group>
  </div>
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
.app-navbar__link--admin {
  color: #6e5cf7;
  font-weight: 600;
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
