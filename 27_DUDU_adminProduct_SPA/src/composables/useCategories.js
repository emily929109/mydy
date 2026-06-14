import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// === 共享單例狀態（module 層級，全 app 共用同一份）===
const categories = ref([])
const rawCategories = ref([])
const _sortedCategories = ref([])

// 只在 module 載入時 fetch 一次，避免每個呼叫端重複請求
let initialized = false
function loadCategories() {
  if (initialized) return
  initialized = true
  fetch('/fakeCategoryTreeData.json')
    .then((res) => res.json())
    .then((data) => {
      rawCategories.value = data.categories
      _sortedCategories.value = _sortCategoryTree(rawCategories.value)
      console.log('Category data loaded:', data.categories)
      // 預設初載時顯示第一個主分類
      const firstMain = _sortedCategories.value[0]
      selectedMainId.value = firstMain ? firstMain.categoryId : null

      // 預設顯示第一個次分類
      const firstSub = firstMain?.children?.[0]
      selectedSubId.value = firstSub ? firstSub.categoryId : null
    })
    .catch((err) => {
      console.error('Failed to load category data:', err)
    })
}
loadCategories()

// === Demo: 模擬登入角色 ===
const currentRole = ref('admin')
const isAdmin = computed(() => currentRole.value === 'admin')

// === Helpers ===
// 依據 sort排序
const _sortCategoryTree = (nodes) => {
  if (!nodes || nodes.length === 0) return []

  // 因 sort 會直接改動原陣列複，故複製一份到新陣列進行排序與遞迴處理，最後回傳新陣列
  // nodes是陣列，node是陣列裡的物件
  return [...nodes]
    .sort((a, b) => {
      return a.sort - b.sort // 遞增
    })
    .map((node) => {
      if (node.children && node.children.length > 0) {
        // 開一個新物件，先把 node 的所有屬性攤進去，再用新的 children 覆蓋掉原本的 children
        // 展開運算子 ... 一定要放在某個「容器字面值」裡面
        // nodes 是陣列 → 用 []；node 是物件 → 用 {}。就這個差別而已。
        return {
          ...node,
          children: _sortCategoryTree(node.children),
        }
      }
      return node
    })
}

// 走整棵樹，將父層的顯示狀態往下傳遞，算出每個分類的最終顯示結果
const effectiveEnabledMap = computed(() => {
  const m = new Map()
  const walk = (nodes, parentEnabled) => {
    for (const c of nodes) {
      // 父層有開、且自己也有開，才算顯示
      const enabled = parentEnabled && !!c.isVisible
      m.set(c.categoryId, enabled)

      if (c.children && c.children.length) {
        walk(c.children, enabled)
      }
    }
  }
  walk(_sortedCategories.value, true)
  return m
})

const effectiveEnabled = (item) => {
  return effectiveEnabledMap.value.get(item.categoryId) ?? false
}

// 取得該分類底下所有 leaf descendants（level 3 自己就是 leaf）
// const getDescendantLeaves = (item) => {
//   if (item.level === 3) return [item]
//   const result = []
//   const stack = _sortedCategories.value.filter((c) => c.parentId === item.id)
//   while (stack.length) {
//     const c = stack.shift()
//     if (c.level === 3) result.push(c)
//     else stack.push(..._sortedCategories.value.filter((x) => x.parentId === c.id))
//   }
//   return result
// }

// Raw productCount（不考慮 cascade）
// const getProductCount = (item) => {
//   if (item.level === 3) return item.productCount
//   return getDescendantLeaves(item).reduce((s, l) => s + l.productCount, 0)
// }

// Effective productCount（考慮 cascade — 只算 effectiveEnabled 的 leaves）
// const getEffectiveProductCount = (item) => {
//   if (item.level === 3) return effectiveEnabled(item) ? item.productCount : 0
//   return getDescendantLeaves(item)
//     .filter((l) => effectiveEnabled(l))
//     .reduce((s, l) => s + l.productCount, 0)
// }

// === 三欄選中狀態 ===
const selectedMainId = ref(null)
const selectedSubId = ref(null)

const bySort = (a, b) => a.sort - b.sort

// --- computed
const mainList = computed(() => {
  return _sortedCategories.value
})

// 次選單由 selectedMainId 決定
const subList = computed(() => {
  const main = _sortedCategories.value.find((c) => c.categoryId === selectedMainId.value)
  // console.log(main.children)
  return main?.children ?? []
})

// 子選單由 selectedSubId
const leafList = computed(() => {
  const main = _sortedCategories.value.find((c) => c.categoryId === selectedMainId.value)
  const sub = main?.children?.find((c) => c.categoryId === selectedSubId.value)
  return sub?.children ?? [] // ??為空值合併運算子
})

// const selectedMain = computed(() => categoryMap.value.get(selectedMainId.value))
// const selectedSub = computed(() => categoryMap.value.get(selectedSubId.value))

const selectMain = (id) => {
  // 1. 改變 sub menu
  selectedMainId.value = id

  // 2. leaf menu 預設顯示第一個sub的第一個leaf
  const main = _sortedCategories.value.find((c) => c.categoryId === selectedMainId.value)
  const subs = main?.children ?? []
  selectedSubId.value = subs.length ? subs[0].categoryId : null
}

const selectSub = (id) => {
  // 改變子選單
  selectedSubId.value = id
}

// === 全站上架數（effective）===
// const totalLeafActive = computed(() =>
//   _sortedCategories.value
//     .filter((c) => c.level === 3 && effectiveEnabled(c))
//     .reduce((s, c) => s + c.productCount, 0),
// )

// === Action handlers ===
const handleSave = () => {
  ElMessage({
    message: '已儲存所有變更（demo）',
    type: 'success',
  })
}

const handleAddCategory = async (levelLabel) => {
  const level = levelLabel === '主' ? 1 : levelLabel === '次' ? 2 : 3

  let parentId = null
  if (level === 2) {
    if (!selectedMainId.value) {
      ElMessage({ message: '請先選擇主分類', type: 'warning' })
      return
    }
    parentId = selectedMainId.value
  } else if (level === 3) {
    if (!selectedSubId.value) {
      ElMessage({ message: '請先選擇次分類', type: 'warning' })
      return
    }
    parentId = selectedSubId.value
  }

  let name
  try {
    const result = await ElMessageBox.prompt(
      `請輸入${levelLabel}分類名稱`,
      `新增${levelLabel}分類`,
      {
        confirmButtonText: '確認',
        cancelButtonText: '取消',
        inputValidator: (val) => (val && val.trim().length > 0) || '名稱不可空白',
      },
    )
    name = result.value.trim()
  } catch {
    return
  }

  const newId = _sortedCategories.value.reduce((m, c) => Math.max(m, c.id), 0) + 1
  // sort = 同層最大值 + 1（排在該欄最底部）
  const maxSort = _sortedCategories.value
    .filter((c) => c.level === level && c.parentId === parentId)
    .reduce((m, c) => Math.max(m, c.sort ?? 0), 0)
  const newItem = {
    id: newId,
    level,
    parentId,
    name,
    enabled: false,
    sort: maxSort + 1,
  }
  if (level === 3) newItem.productCount = 0

  _sortedCategories.value.push(newItem)

  if (level === 1) selectMain(newId)
  else if (level === 2) selectSub(newId)

  ElMessage({
    message: `已新增${levelLabel}分類「${name}」`,
    type: 'success',
  })
}

const edit = (item) => {
  ElMessageBox.prompt(`修改「${item.name}」的商城前台顯示名稱：`, '輸入資訊', {
    confirmButtonText: '確認',
    cancelButtonText: '取消',
    inputErrorMessage: '請輸入欲修改的名稱',
    inputPlaceholder: '請輸入新的顯示名稱',
    inputValue: item.name,
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '名稱不可為空'
      }
      return true
    },
  })
    .then(({ value }) => {
      item.name = value.trim()
      ElMessage({ type: 'success', message: '已成功修改名稱' })
    })
    .catch((action) => {
      if (action === 'cancel' || action === 'close') {
        ElMessage({ type: 'info', message: '已取消修改' })
      }
    })
}

const moveItem = (item, dir) => {
  // 在樹中找到「包含此項目的同層陣列」當作 siblings (不依賴 categoryParentId)
  const findSiblings = (nodes) => {
    if (nodes.some((c) => c.categoryId === item.categoryId)) return nodes
    for (const c of nodes) {
      if (c.children && c.children.length) {
        const found = findSiblings(c.children)
        if (found) return found
      }
    }
    return null
  }

  const siblings = findSiblings(_sortedCategories.value)
  if (!siblings) return

  // siblings 已在 _sortCategoryTree 依 sort 排好序，直接用陣列順序找索引
  const i = siblings.findIndex((c) => c.categoryId === item.categoryId)
  const j = dir === 'up' ? i - 1 : i + 1
  if (j < 0 || j >= siblings.length) return // 已在頂/底則不動

  const a = siblings[i]
  const b = siblings[j]

  // 1. 交換 sort 值 (存後端時排序才正確)
  const tmp = a.sort
  a.sort = b.sort
  b.sort = tmp

  // 2. 交換陣列位置 (讓畫面即時更新)
  siblings[i] = b
  siblings[j] = a
}
const onMoveUp = (item) => moveItem(item, 'up')
const onMoveDown = (item) => moveItem(item, 'down')

// ----------- 轉移 下架 -----------
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const currentItem = ref(null) // 標題顯示哪個分類要隱藏
const subListForTrans = ref([])
const leafListForTrans = ref([])
const form = reactive({
  actionType: 'TRANSFER', // 預設勾選轉移
  mainCategoryId: null,
  subCategoryId: null,
  leafCategoryId: null,
})

const onTransfer = (item) => {
  dialogFormVisible.value = true
  currentItem.value = item

  resetTransForm()
}

const resetTransForm = () => {
  form.mainCategoryId = null
  form.subCategoryId = null
  form.leafCategoryId = null

  subListForTrans.value = []
  leafListForTrans.value = []
}

// EP 預設會傳新值
const handleMainChange = (val) => {
  // 清空
  form.subCategoryId = null
  form.leafCategoryId = null
  leafListForTrans.value = []

  form.mainCategoryId = val
  console.log('handleMainChange', val)
  const main = _sortedCategories.value.find((c) => c.categoryId === val)
  subListForTrans.value = main?.children ?? []
  console.log('handleMainChange', val, subListForTrans.value)
}

const handleSubChange = (val) => {
  // 清空
  form.leafCategoryId = null

  form.subCategoryId = val
  const main = _sortedCategories.value.find((c) => c.categoryId === form.mainCategoryId)
  const sub = main?.children?.find((c) => c.categoryId === val)
  leafListForTrans.value = sub?.children ?? []
}

const handleLeafChange = (val) => {
  form.leafCategoryId = val
}

// 將所有指定分類集中轉換到一個指定分類中
const updateCategoryAllInOne = () => {
  dialogFormVisible.value = false
  ElMessage({ type: 'success', message: 'todo: call API' })
}

// === 對外 API（回傳共享單例的狀態與方法）===
export function useCategories() {
  return {
    currentRole,
    isAdmin,
    mainList,
    subList,
    leafList,
    selectedMainId,
    selectedSubId,
    // selectedMain,
    // selectedSub,
    selectMain,
    selectSub,
    effectiveEnabled,
    // getProductCount,
    // getEffectiveProductCount,
    // totalLeafActive,
    handleSave,
    handleAddCategory,
    edit,
    onMoveUp,
    onMoveDown,
    onTransfer,
    dialogFormVisible, // App.vue 需要用到這個 ref 來控制 dialog 顯示
    updateCategoryAllInOne,
    currentItem,
    form,
    formLabelWidth,
    subListForTrans,
    leafListForTrans,
    handleMainChange,
    handleSubChange,
    handleLeafChange,
  }
}
