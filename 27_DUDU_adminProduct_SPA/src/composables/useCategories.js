import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useCategories() {
  const categories = ref([])

  onMounted(() => {
    fetch('/category_data.json')
      .then((res) => res.json())
      .then((data) => {
        categories.value = data
      })
      .catch((err) => {
        console.error('Failed to load category data:', err)
      })
  })

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

  const mainList = computed(() =>
    categories.value.filter((c) => c.level === 1),
  )
  const subList = computed(() =>
    categories.value.filter(
      (c) => c.level === 2 && c.parentId === selectedMainId.value,
    ),
  )
  const leafList = computed(() =>
    categories.value.filter(
      (c) => c.level === 3 && c.parentId === selectedSubId.value,
    ),
  )

  const selectedMain = computed(() =>
    categoryMap.value.get(selectedMainId.value),
  )
  const selectedSub = computed(() =>
    categoryMap.value.get(selectedSubId.value),
  )

  const selectMain = (id) => {
    selectedMainId.value = id
    const firstSub = categories.value.find(
      (c) => c.level === 2 && c.parentId === id,
    )
    selectedSubId.value = firstSub ? firstSub.id : null
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
          inputValidator: (val) =>
            (val && val.trim().length > 0) || '名稱不可空白',
        },
      )
      name = result.value.trim()
    } catch {
      return
    }

    const newId = categories.value.reduce((m, c) => Math.max(m, c.id), 0) + 1
    const newItem = {
      id: newId,
      level,
      parentId,
      name,
      enabled: false,
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
    ElMessageBox.prompt(
      `修改「${item.name}」的商城前台顯示名稱：`,
      '輸入資訊',
      {
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
      },
    )
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

  // up / down / transfer 為 stub，後續再實作
  const onMoveUp = (item) => {
    ElMessage({ type: 'info', message: `上移「${item.name}」：待實作` })
  }
  const onMoveDown = (item) => {
    ElMessage({ type: 'info', message: `下移「${item.name}」：待實作` })
  }
  const onTransfer = (item) => {
    ElMessage({ type: 'info', message: `轉移「${item.name}」：待實作` })
  }

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