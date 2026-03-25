<template>
  <div class="search-container">
    <i class="fa-solid fa-magnifying-glass search-icon"></i>
    <input
      v-model="query"
      type="text"
      class="search-input"
      :placeholder="placeholder"
      @keyup.enter="$emit('search', query)"
    />
    <div
      class="clear-btn"
      :class="{ active: hasText }"
      @click="clearInput"
    >
      <i class="fa-solid fa-xmark"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜尋內容...'
  }
})

const emit = defineEmits(['search', 'update:modelValue'])

const query = ref('')

const hasText = computed(() => query.value.trim().length > 0)

function clearInput() {
  query.value = ''
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 400px;
  transition: all 0.3s ease;
}

/* hover 時微微上移 */
.search-container:hover {
  transform: translateY(-4px);
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 45px;
  font-size: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

/* focus 時出現深色邊框 */
.search-input:focus {
  border-color: #333333;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

/* 左側放大鏡圖標 */
.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
  font-size: 18px;
  pointer-events: none;
}

/* 右側清除按鈕 */
.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  background-color: #5f6368;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 12px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
}

/* 打字時顯示叉叉 */
.clear-btn.active {
  opacity: 1;
  visibility: visible;
}

.clear-btn:hover {
  background-color: #3c4043;
}
</style>
