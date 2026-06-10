<script setup>
import { Grid } from '@element-plus/icons-vue'

// 純呈現用的選單本體，桌機側欄與手機全屏面板共用同一份
const props = defineProps({
  tree: { type: Array, default: () => [] },
  defaultActive: { type: String, default: '' },
})

const emit = defineEmits(['select'])

const handleMenuClick = (categoryId) => {
  emit('select', categoryId)
}

const handleMenuClick = (id) => {
  // 只對手機版有用
  drawerVisible.value = false

  // todo : call api
  fetch('/js/adminProduct/fakeProduct.json')
    .then((res) => res.json())
    .then((data) => {
      // 因json商品全部都掛在leaf category
      // 取得「此分類 + 其所有子孫分類」的 categoryId 集合
      // 找不到（categories 尚未載入）時退回只比對自己
      const ids = _findCategoryIds(categories.value, id) || [id]

      productList.value = data.filter((p) => ids.includes(p.categoryId))
      //productList.value = data.filter(p => p.categoryId===id);
      console.log(productList.value)
    })
    .catch((err) => {
      console.error('Failed to load product data:', err)
    })
}

// 收集某節點底下所有子孫的 categoryId（含自己）
const _collectDescendantIds = (node) => {
  let ids = [node.categoryId]

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      ids = ids.concat(_collectDescendantIds(child))
    })
  }
  return ids
}

// 在分類樹中找到 targetId 的節點，回傳其所有子孫 id 陣列；找不到回傳 null
const _findCategoryIds = (nodes, targetId) => {
  if (!nodes) return null

  for (const node of nodes) {
    if (node.categoryId === targetId) {
      return _collectDescendantIds(node)
    }
    const found = _findCategoryIds(node.children, targetId)
    if (found) return found
  }
  return null
}
</script>

<template>
  <el-menu
    :default-active="props.defaultActive"
    class="el-menu-vertical-demo"
    background-color="#ffffff"
    text-color="#333333"
    active-text-color="#00a896"
  >
    <el-sub-menu v-for="main in props.tree" :key="main.categoryId" :index="String(main.categoryId)">
      <template #title>
        <el-icon><Grid /></el-icon>
        <span @click="handleMenuClick(main.categoryId)">{{ main.name }}</span>
      </template>

      <el-sub-menu
        v-for="sub in main.children"
        :key="sub.categoryId"
        :index="String(sub.categoryId)"
      >
        <template #title>
          <span @click="handleMenuClick(sub.categoryId)">{{ sub.name }}</span>
        </template>

        <el-menu-item
          v-for="leaf in sub.children"
          :key="leaf.categoryId"
          :index="String(leaf.categoryId)"
          @click="handleMenuClick(leaf.categoryId)"
        >
          {{ leaf.name }}
        </el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
  </el-menu>
</template>

<style scoped>
.el-menu-item.is-active {
  background-color: #f2fbf9 !important; /* 淡淡的底色 */
  border-left: 4px solid #00a896; /* 👈 左側那條經典的綠線 */
  padding-left: 16px !important; /* 修正微調因為多出 4px 造成的文字偏移 */
}
</style>
