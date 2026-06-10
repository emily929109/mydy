<script setup>
import { computed } from 'vue'
import CategoryMenu from '../CategoryMenu.vue'
import ProductCard from './ProductCard.vue'
import ProductPagination from './ProductPagination.vue'
import { useStorefront } from '../../composables/useStorefront'

const props = defineProps({
  tree: { type: Array, default: () => [] },
})

const treeRef = computed(() => props.tree)

const {
  title,
  searchInput,
  searchKeyword,
  showSearchEmpty,
  pagedList,
  currentPage,
  displayPages,
  disabledPrev,
  disabledNext,
  setPage,
  selectCategory,
  doSearch,
  clearSearch,
} = useStorefront(treeRef)
</script>

<template>
  <div class="store-wrapper">
    <!-- ===== 頂部：標題 / 麵包屑 / 搜尋 ===== -->
    <div class="store-top">
      <div class="store-top__head">
        <div class="store-top__label">{{ title }}</div>
        <div class="store-top__crumb">
          <span>首頁</span>
          <span class="sep">/</span>
          <span>購物商城</span>
          <template v-if="title !== '全部商品'">
            <span class="sep">/</span>
            <span>{{ title }}</span>
          </template>
        </div>
      </div>

      <div class="store-top__search">
        <input
          v-model.trim="searchInput"
          type="search"
          class="store-search__input"
          placeholder="請輸入欲搜尋的商品"
          @keyup.enter="doSearch"
        />
        <span v-show="searchInput.length > 0" class="store-search__clear" @click="clearSearch">
          <span class="fas fa-times"></span>
        </span>
        <button class="store-search__btn" type="button" @click="doSearch">
          <span class="fa fa-search"></span>
        </button>
      </div>
    </div>

    <!-- ===== 主體：左分類 / 右商品 ===== -->
    <div class="store-body">
      <aside class="store-body__side">
        <CategoryMenu :tree="props.tree" default-active="" @select="selectCategory" />
      </aside>

      <section class="store-body__main">
        <div v-if="showSearchEmpty" class="store-empty">
          找不到與「 {{ searchKeyword }} 」有關的搜尋結果
        </div>

        <div :key="title + currentPage" class="product-grid fadeUp">
          <ProductCard
            v-for="(prd, index) in pagedList"
            :key="prd.productId"
            :product="prd"
            :index="index"
          />
        </div>

        <ProductPagination
          v-if="!showSearchEmpty"
          :current-page="currentPage"
          :display-pages="displayPages"
          :disabled-prev="disabledPrev"
          :disabled-next="disabledNext"
          @change="setPage"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.store-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 36px 48px;
}

/* ---- 頂部 ---- */
.store-top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.store-top__label {
  display: inline-block;
  padding: 0.5em 1.5em;
  background-color: #e2603c;
  color: #fff;
  font-weight: bold;
  font-size: 24px;
  clip-path: polygon(0 0, 100% 0, calc(100% - 30px) 100%, 0% 100%);
  border-top-left-radius: 24px;
  margin-bottom: 8px;
}
.store-top__crumb {
  font-size: 13px;
  color: #5e6e82;
}
.store-top__crumb .sep {
  margin: 0 8px;
}
.store-top__search {
  position: relative;
  flex: 1 1 280px;
  max-width: 420px;
}
.store-search__input {
  width: 100%;
  height: 42px;
  border: 1px solid #8e9294;
  border-radius: 8px;
  padding: 0 84px 0 14px;
  font-size: 14px;
}
.store-search__input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
.store-search__clear {
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  background-color: #5f6368;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}
.store-search__clear:hover {
  background-color: #3c4043;
}
.store-search__btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 32px;
  border: none;
  background-color: #00ac97;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
}

/* ---- 主體 ---- */
.store-body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.store-body__side {
  flex: 0 0 250px;
}
.store-body__main {
  flex: 1;
  min-width: 0;
}
.store-empty {
  padding: 16px 0;
  color: #5e6e82;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

/* ---- 載入淡入動畫 ---- */
.fadeUp {
  animation: fadeUp 0.5s ease both;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---- 手機 ---- */
@media (max-width: 768px) {
  .store-wrapper {
    padding: 16px;
  }
  .store-body {
    flex-direction: column;
  }
  .store-body__side {
    flex: 1 1 auto;
    width: 100%;
  }
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
