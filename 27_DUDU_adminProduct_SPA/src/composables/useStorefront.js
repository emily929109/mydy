import { ref, computed, watch } from 'vue'

// 前台商品列表狀態：載入商品、依分類／關鍵字篩選、分頁
// treeRef：分類樹（ref 或 computed），結構為 { categoryId, name, children }
export function useStorefront(treeRef) {
  const products = ref([])

  // 載入商品資料（沿用 public/product.json，取代參考檔的 axios + 舊 C# API）
  fetch(`${import.meta.env.BASE_URL}fakeProductData.json`)
    .then((res) => res.json())
    .then((data) => {
      products.value = data
    })
    .catch((err) => {
      console.error('Failed to load product data:', err)
    })

  // === 篩選模式：all（全部）/ category（分類）/ search（搜尋）===
  const mode = ref('all')
  const selectedCategoryId = ref(null)
  const selectedCategoryName = ref('')
  const searchInput = ref('') // 搜尋框 v-model
  const searchKeyword = ref('') // 已送出的搜尋字

  // 收集某節點底下所有子孫的 categoryId（含自己）
  const collectDescendantIds = (node) => {
    let ids = [node.categoryId]
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        ids = ids.concat(collectDescendantIds(child))
      })
    }
    return ids
  }

  // 在分類樹中找到 targetId 的節點，回傳其所有子孫 id 陣列；找不到回傳 null
  const findCategoryIds = (nodes, targetId) => {
    if (!nodes) return null
    for (const node of nodes) {
      if (node.categoryId === targetId) return collectDescendantIds(node)
      const found = findCategoryIds(node.children, targetId)
      if (found) return found
    }
    return null
  }

  // 依 categoryId 找分類名稱
  const findCategoryName = (nodes, targetId) => {
    if (!nodes) return ''
    for (const node of nodes) {
      if (node.categoryId === targetId) return node.name
      const found = findCategoryName(node.children, targetId)
      if (found) return found
    }
    return ''
  }

  // === 篩選結果 ===
  const filteredList = computed(() => {
    if (mode.value === 'category' && selectedCategoryId.value != null) {
      const ids = findCategoryIds(treeRef.value, selectedCategoryId.value) || [
        selectedCategoryId.value,
      ]
      return products.value.filter((p) => ids.includes(p.categoryId))
    }
    if (mode.value === 'search' && searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      return products.value.filter((p) => p.name.toLowerCase().includes(kw))
    }
    return products.value
  })

  // 標題（全部商品 / 分類名稱）與搜尋無結果提示
  const title = computed(() =>
    mode.value === 'category' ? selectedCategoryName.value : '全部商品',
  )
  const showSearchEmpty = computed(() => mode.value === 'search' && filteredList.value.length === 0)

  // === 分頁（移植自參考檔，移除 API 呼叫）===
  const perpage = ref(8)
  const currentPage = ref(1)

  const totalPage = computed(() =>
    Math.max(1, Math.ceil(filteredList.value.length / perpage.value)),
  )
  const disabledPrev = computed(() => currentPage.value <= 1)
  const disabledNext = computed(() => currentPage.value >= totalPage.value)

  // 當前頁商品
  const pagedList = computed(() => {
    const start = (currentPage.value - 1) * perpage.value
    return filteredList.value.slice(start, start + perpage.value)
  })

  // 顯示頁碼（含 "..."）
  const displayPages = computed(() => {
    const total = totalPage.value
    const current = currentPage.value
    const delta = 2
    const range = []
    const rangeWithDots = []
    let last = 0

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i)
      }
    }
    for (const i of range) {
      if (last) {
        if (i - last === 2) rangeWithDots.push(last + 1)
        else if (i - last !== 1) rangeWithDots.push('...')
      }
      rangeWithDots.push(i)
      last = i
    }
    return rangeWithDots
  })

  const setPage = (page) => {
    if (page === '...' || page < 1 || page > totalPage.value) return
    currentPage.value = page
  }

  // 篩選條件改變時回到第一頁
  watch(filteredList, () => {
    currentPage.value = 1
  })

  // === 對外操作 ===
  const selectCategory = (categoryId) => {
    mode.value = 'category'
    selectedCategoryId.value = categoryId
    selectedCategoryName.value = findCategoryName(treeRef.value, categoryId)
    searchInput.value = ''
    searchKeyword.value = ''
  }

  const doSearch = () => {
    const kw = searchInput.value.trim()
    if (!kw) return
    mode.value = 'search'
    searchKeyword.value = kw
    selectedCategoryId.value = null
    selectedCategoryName.value = ''
  }

  const clearSearch = () => {
    searchInput.value = ''
  }

  return {
    products,
    mode,
    title,
    selectedCategoryName,
    searchInput,
    searchKeyword,
    showSearchEmpty,
    filteredList,
    pagedList,
    perpage,
    currentPage,
    totalPage,
    disabledPrev,
    disabledNext,
    displayPages,
    setPage,
    selectCategory,
    doSearch,
    clearSearch,
  }
}
