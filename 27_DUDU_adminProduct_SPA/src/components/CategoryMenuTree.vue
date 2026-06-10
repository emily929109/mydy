<script setup>
import { Grid } from '@element-plus/icons-vue'

// 純呈現用的選單本體，桌機側欄與手機全屏面板共用同一份
const props = defineProps({
  tree: { type: Array, default: () => [] },
  defaultActive: { type: String, default: '' },
})

const emit = defineEmits(['select'])

// 點擊任一層（主／次／葉）皆把該分類 categoryId 往上拋給父元件
const handleMenuClick = (categoryId) => {
  emit('select', categoryId)
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
