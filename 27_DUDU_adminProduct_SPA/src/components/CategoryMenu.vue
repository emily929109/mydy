<script setup>
defineProps({
  tree: { type: Array, default: () => [] },
  defaultActive: { type: String, default: '' },
})
const emit = defineEmits(['select'])
</script>

<template>
  <div class="sidebar-menu-wrapper" style="width: 250px">
    <el-menu
      default-active="4"
      class="el-menu-vertical-demo"
      background-color="#ffffff"
      text-color="#333333"
      active-text-color="#00a896"
      @select="handleSelect"
    >
      <el-sub-menu
        v-for="main in categoryTree"
        :key="main.categoryId"
        :index="String(main.categoryId)"
      >
        <template #title>
          <el-icon><Grid /></el-icon> <span>{{ main.name }}</span>
        </template>

        <el-sub-menu
          v-for="sub in main.children"
          :key="sub.categoryId"
          :index="String(sub.categoryId)"
        >
          <template #title>
            <span>{{ sub.name }}</span>
          </template>

          <el-menu-item
            v-for="leaf in sub.children"
            :key="leaf.categoryId"
            :index="String(leaf.categoryId)"
          >
            {{ leaf.name }}
          </el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<style scoped>
.el-menu-item.is-active {
  background-color: #f2fbf9 !important; /* 淡淡的底色 */
  border-left: 4px solid #00a896; /* 👈 左側那條經典的綠線 */
  padding-left: 16px !important; /* 修正微調因為多出 4px 造成的文字偏移 */
}
</style>
