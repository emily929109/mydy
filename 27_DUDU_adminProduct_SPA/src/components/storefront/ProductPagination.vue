<script setup>
defineProps({
  currentPage: { type: Number, required: true },
  displayPages: { type: Array, default: () => [] },
  disabledPrev: { type: Boolean, default: false },
  disabledNext: { type: Boolean, default: false },
})

const emit = defineEmits(['change'])
const go = (page) => emit('change', page)
</script>

<template>
  <div class="pager">
    <!-- 上一頁 -->
    <button class="pager__nav" type="button" :disabled="disabledPrev" @click="go(currentPage - 1)">
      <span class="fa fa-chevron-left"></span>
    </button>

    <!-- 頁碼 -->
    <ul class="pager__list">
      <li
        v-for="(n, index) in displayPages"
        :key="index"
        :class="{ 'is-active': currentPage === n, 'is-dots': n === '...' }"
      >
        <button class="pager__page" type="button" :disabled="n === '...'" @click="go(n)">
          {{ n }}
        </button>
      </li>
    </ul>

    <!-- 下一頁 -->
    <button class="pager__nav" type="button" :disabled="disabledNext" @click="go(currentPage + 1)">
      <span class="fa fa-chevron-right"></span>
    </button>
  </div>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 24px;
}
.pager__list {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.pager__nav,
.pager__page {
  min-width: 32px;
  height: 32px;
  border: 1px solid #e2e3e9;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  color: #2c2f48;
  font-size: 13px;
}
.pager__nav:disabled,
.pager__page:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.pager__list .is-active .pager__page {
  background: #26b8a6;
  border-color: #26b8a6;
  color: #fff;
}
.pager__list .is-dots .pager__page {
  border: none;
  background: transparent;
}
</style>
