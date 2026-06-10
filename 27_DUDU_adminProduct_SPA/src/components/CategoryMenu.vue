<script setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import CategoryMenuTree from './CategoryMenuTree.vue'

// 接收父元件傳進來的參數，對應 :tree="categoryTree"
const props = defineProps({
  tree: { type: Array, default: () => [] },
  defaultActive: { type: String, default: '' },
})

// 定義要傳回給父元件的自訂事件
const emit = defineEmits(['select'])

// 控制手機版全屏面板的開關
const drawerVisible = ref(false)

// 轉發 select 給父元件；手機版選到分類後自動收起全屏面板
const handleSelect = (index) => {
  emit('select', index)
  drawerVisible.value = false
}
</script>

<template>
  <!-- 桌機：左側垂直收合選單（維持原樣） -->
  <div class="sidebar-menu-wrapper cm-desktop" style="width: 250px">
    <CategoryMenuTree
      :tree="props.tree"
      :default-active="props.defaultActive"
      @select="handleSelect"
    />
  </div>

  <!-- 手機：下拉按鈕，點擊開啟全屏面板 -->
  <el-button class="cm-mobile-trigger" round @click="drawerVisible = true">
    分類選單
    <el-icon class="cm-mobile-trigger__arrow"><ArrowDown /></el-icon>
  </el-button>

  <!-- 手機：全屏面板，沿用同一份 el-menu -->
  <el-drawer
    v-model="drawerVisible"
    title="分類選單"
    direction="ltr"
    size="100%"
    class="cm-mobile-drawer"
  >
    <CategoryMenuTree
      :tree="props.tree"
      :default-active="props.defaultActive"
      @select="handleSelect"
    />
  </el-drawer>
</template>

<style scoped>
/* 預設（桌機）：顯示側欄、隱藏手機按鈕 */
.cm-desktop {
  display: block;
}
.cm-mobile-trigger {
  display: none;
}
.cm-mobile-trigger__arrow {
  margin-left: 4px;
}

/* 手機（< 768px）：隱藏側欄、改顯示下拉按鈕 */
@media (max-width: 768px) {
  .cm-desktop {
    display: none;
  }
  .cm-mobile-trigger {
    display: inline-flex;
    margin: 16px 36px;
  }
}
</style>
