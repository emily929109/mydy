import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// === 共享單例狀態（module 層級，全 app 共用同一份）===
const categories = ref([])

// 只在 module 載入時 fetch 一次，避免每個呼叫端重複請求
let initialized = false
function loadCategories() {
  if (initialized) return
  initialized = true
  fetch('/category_data.json')
    .then((res) => res.json())
    .then((data) => {
      categories.value = data
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
// id → item map（查父層用）
const categoryMap = computed(() => {
  const m = new Map()
  for (const c of categories.value) m.set(c.id, c)
  return m
})

// 衍生狀態 derived state：自己 enabled 且祖先皆 enabled 才視為 enabled
const effectiveEnabled = (item) => {
  let cur = item
  while (cur) {
    if (!cur.enabled) return false
    cur = cur.parentId == null ? null : categoryMap.value.get(cur.parentId)
  }
  return true
}

// 取得該分類底下所有 leaf descendants（level 3 自己就是 leaf）
const getDescendantLeaves = (item) => {
  if (item.level === 3) return [item]
  const result = []
  const stack = categories.value.filter((c) => c.parentId === item.id)
  while (stack.length) {
    const c = stack.shift()
    if (c.level === 3) result.push(c)
    else stack.push(...categories.value.filter((x) => x.parentId === c.id))
  }
  return result
}

// Raw productCount（不考慮 cascade）
const getProductCount = (item) => {
  if (item.level === 3) return item.productCount
  return getDescendantLeaves(item).reduce((s, l) => s + l.productCount, 0)
}

// Effective productCount（考慮 cascade — 只算 effectiveEnabled 的 leaves）
const getEffectiveProductCount = (item) => {
  if (item.level === 3) return effectiveEnabled(item) ? item.productCount : 0
  return getDescendantLeaves(item)
    .filter((l) => effectiveEnabled(l))
    .reduce((s, l) => s + l.productCount, 0)
}

// === 三欄選中狀態 ===
const selectedMainId = ref(1)
const selectedSubId = ref(11)

const bySort = (a, b) => a.sort - b.sort

const mainList = computed(() => categories.value.filter((c) => c.level === 1).sort(bySort))
const subList = computed(() =>
  categories.value.filter((c) => c.level === 2 && c.parentId === selectedMainId.value).sort(bySort),
)
const leafList = computed(() =>
  categories.value.filter((c) => c.level === 3 && c.parentId === selectedSubId.value).sort(bySort),
)

const selectedMain = computed(() => categoryMap.value.get(selectedMainId.value))
const selectedSub = computed(() => categoryMap.value.get(selectedSubId.value))

const selectMain = (id) => {
  selectedMainId.value = id
  // 選 sort 最小的次分類為第一個
  const subs = categories.value.filter((c) => c.level === 2 && c.parentId === id).sort(bySort)
  selectedSubId.value = subs.length ? subs[0].id : null
}
const selectSub = (id) => {
  selectedSubId.value = id
}

// === 全站上架數（effective）===
const totalLeafActive = computed(() =>
  categories.value
    .filter((c) => c.level === 3 && effectiveEnabled(c))
    .reduce((s, c) => s + c.productCount, 0),
)

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

  const newId = categories.value.reduce((m, c) => Math.max(m, c.id), 0) + 1
  // sort = 同層最大值 + 1（排在該欄最底部）
  const maxSort = categories.value
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

  categories.value.push(newItem)

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

// 在同層兄弟（同 level、同 parentId）內調整順序：與相鄰一筆對調 sort 值
const moveItem = (item, dir) => {
  const siblings = categories.value
    .filter((c) => c.level === item.level && c.parentId === item.parentId)
    .sort(bySort)

  // 先取得現在的索引
  const i = siblings.findIndex((c) => c.id === item.id)

  // 取得交換的鄰居索引
  const j = dir === 'up' ? i - 1 : i + 1 // 前一個或下一個索引
  if (j < 0 || j >= siblings.length) return // 已在頂/底，靜默不動
  const tmp = siblings[i].sort // 存入現在的排序值
  siblings[i].sort = siblings[j].sort // 改變現在的排序值為鄰居的排序值
  siblings[j].sort = tmp // 改變鄰居的排序值為原本的排序值
}
const onMoveUp = (item) => moveItem(item, 'up')
const onMoveDown = (item) => moveItem(item, 'down')

// transfer 為 stub，後續再實作
const onTransfer = (item) => {
  ElMessage({ type: 'info', message: `轉移「${item.name}」：待實作` })
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
    selectedMain,
    selectedSub,
    selectMain,
    selectSub,
    effectiveEnabled,
    getProductCount,
    getEffectiveProductCount,
    totalLeafActive,
    handleSave,
    handleAddCategory,
    edit,
    onMoveUp,
    onMoveDown,
    onTransfer,
  }
}
