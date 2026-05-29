import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/HomeView.vue'

// 其他頁面尚未重構，先用占位頁，讓導覽列／頁尾連結不會壞。
const PlaceholderView = () => import('@/views/PlaceholderView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/Home/Index', redirect: '/' },
    // 導覽列 / 頁尾的站內連結（最新消息、關於、購物、特約商…）暫以占位頁呈現
    { path: '/Home/:page', name: 'placeholder', component: PlaceholderView, props: true },
  ],
})

export default router
