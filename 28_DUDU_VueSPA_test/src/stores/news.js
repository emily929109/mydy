import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axios from 'axios'

/**
 * 最新消息 / 公告資料
 * 移植自原站 js/index.js 的 fetchHomeNews / homeNews / currentTabItems / tabs。
 * 目前資料來源為靜態檔 public/js/newsData/news.json（之後可改接後端 API）。
 */
export const useNewsStore = defineStore('news', () => {
  const allNews = ref([])
  const loaded = ref(false)

  // 公告專區分頁設定（label 顯示文字、category 對應 news.json 分類）
  const tabs = {
    announcement: { label: '重要公告', category: '重要公告' },
    pets: { label: '寵物相關', category: '萌寵生活' },
  }

  // 首頁最新消息只取前三筆
  const homeNews = computed(() => allNews.value.slice(0, 3))

  // 依分頁分類取前五筆
  function tabItems(tabKey) {
    const category = tabs[tabKey].category
    return allNews.value.filter((item) => item.category === category).slice(0, 5)
  }

  async function fetchHomeNews() {
    if (loaded.value) return
    const res = await axios.get('/js/newsData/news.json')
    allNews.value = res.data
    loaded.value = true
  }

  return { allNews, tabs, homeNews, tabItems, fetchHomeNews }
})
