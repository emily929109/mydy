<script setup>
import { onMounted } from 'vue'
import AppSidebar from '@/layout/AppSidebar.vue'
import AppHeader from '@/layout/AppHeader.vue'
import AppFooter from '@/layout/AppFooter.vue'
import LoginModals from '@/layout/modals/LoginModals.vue'
import { useMemberStore } from '@/stores/member'
import { useCartStore } from '@/stores/cart'

const memberStore = useMemberStore()
const cartStore = useCartStore()

onMounted(() => {
  memberStore.init()
  cartStore.init()
})
</script>

<template>
  <div id="ean">
    <main class="main" id="top">
      <div class="container-fluid overflow-hidden" data-layout="container">
        <!-- 左側 / 手機側欄選單 -->
        <AppSidebar />

        <div class="content topNav" style="padding-bottom: 0; padding-top: 140px">
          <!-- 頂部導覽列 -->
          <AppHeader />

          <!-- 頁面內容 -->
          <router-view />

          <!-- 頁尾 -->
          <AppFooter />

          <!-- 登入 / 註冊 modal -->
          <LoginModals />
        </div>
      </div>
    </main>
  </div>
</template>
