const App = Vue.createApp({
  setup() {
    // ------ 全域變數 ------
    const token = window.__SERVER_TOKEN__

    // ------ 三欄管理變數 ------
    const rawCategories = ref([])
    const _sortedCategories = ref([])
    const selectedMainId = ref(null)
    const selectedSubId = ref(null)
    const mainList = ref([])

    // ------ 三欄資料來源 computed ------
    // 次選單由 selectedMainId 決定
    const subList = computed(() => {
      const main = _sortedCategories.value.find((c) => c.categoryId === selectedMainId.value)
      return main && main.children ? main.children : []
    })

    // 子選單由 selectedSubId 決定
    const leafList = computed(() => {
      const main = _sortedCategories.value.find((c) => c.categoryId === selectedMainId.value)
      const sub = main?.children?.find((c) => c.categoryId === selectedSubId.value)
      return sub && sub.children ? sub.children : []
    })

    // 整棵樹的次分類（level 2）總數 = 各主分類的 children 數量加總
    const totalSubCount = computed(() =>
      _sortedCategories.value.reduce(
        (sum, main) => sum + ((main.children && main.children.length) || 0),
        0,
      ),
    )

    // 整棵樹的子分類（level 3）總數 = 各次分類的 children 數量加總
    const totalLeafCount = computed(() =>
      _sortedCategories.value.reduce(
        (sum, main) =>
          sum +
          (main.children || []).reduce(
            (s, sub) => s + ((sub.children && sub.children.length) || 0),
            0,
          ),
        0,
      ),
    )

    const totalProductCount = computed(() => {
      if (!Array.isArray(mainList.value)) return 0

      return mainList.value.reduce((sum, item) => {
        const count = Number(item.productCount) || 0
        return sum + count
      }, 0)
    })

    const totalSubProductCount = computed(() => {
      if (!Array.isArray(subList.value)) return 0

      return subList.value.reduce((sum, item) => {
        const count = Number(item.productCount) || 0
        return sum + count
      }, 0)
    })

    const totalLeafProductCount = computed(() => {
      if (!Array.isArray(leafList.value)) return 0

      return leafList.value.reduce((sum, item) => {
        const count = Number(item.productCount) || 0
        return sum + count
      }, 0)
    })

    onMounted(() => {
      axios({
        method: 'get',
        url: 'http://10.2.8.37:5005/api/product/GetProductCategory',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.data) {
            rawCategories.value = response.data
            // 先：遞減排序（保留後端既有數字的相對高低）
            _sortedCategories.value = _sortCategoryTree(rawCategories.value)
            // 後：重新排序為了消除 sort 為 0 的資料
            _reindexSort(_sortedCategories.value)

            // 三欄資料來源設定
            mainList.value = _sortedCategories.value

            // 預設初載時顯示第一個主分類
            const firstMain = _sortedCategories.value[0]
            selectedMainId.value = firstMain ? firstMain.categoryId : null

            // 預設顯示第一個次分類
            const firstSub = firstMain?.children?.[0]
            selectedSubId.value = firstSub ? firstSub.categoryId : null
          }
        })
        .catch(function (error) {})
        .finally(() => {})
    })

    const _sortCategoryTree = (nodes) => {
      if (!nodes || nodes.length === 0) return []

      // 因sort是修改原資料，故複製一份
      return [...nodes]
        .sort((a, b) => {
          return b.sort - a.sort // 遞減：sort 越大排越上面
        })
        .map((node) => {
          if (node.children && node.children.length > 0) {
            // 展開物件所有屬性，用新的 children 覆蓋原本的
            return {
              ...node,
              children: _sortCategoryTree(node.children),
            }
          }
          return node
        })
    }

    // 依目前陣列順序重新編號：每一層 sort 連續、唯一且不為 0
    const _reindexSort = (nodes) => {
      if (!nodes || !nodes.length) return
      const n = nodes.length
      nodes.forEach((c, idx) => {
        c.sort = n - idx // 遞減，sort最小為1，最大為陣列長度
        if (c.children && c.children.length) _reindexSort(c.children)
      })
    }

    const selectMain = (id) => {
      // 改變次選單
      selectedMainId.value = id

      // 子選單預設顯示第一個sub的第一個leaf
      const main = _sortedCategories.value.find((c) => c.categoryId === selectedMainId.value)
      const subs = main && main.children ? main.children : []
      selectedSubId.value = subs.length ? subs[0].categoryId : null
    }

    const selectSub = (id) => {
      selectedSubId.value = id
    }

    // computed 老爸被關掉，子孫就算自己有開，也必須被劃刪除線 (衍生狀態)
    const effectiveEnabledMap = computed(() => {
      const m = new Map()
      const walk = (nodes, parentEnabled) => {
        for (const c of nodes) {
          // 只要 parentEnabled 為false 則不檢查右邊 直接回傳false
          // !!為預防後端傳 isVisible 為 undefined 或 null 或 0
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
      //const id = '01010101';
      //const a = mainList.value.find(c => c.categoryId === id);
      //const b = _sortedCategories.value.find(c => c.categoryId === id);
      //console.log('同一個參考?', a === b, ' a.isVisible=', a.isVisible, ' b.isVisible=', b.isVisible);

      return effectiveEnabledMap.value.get(item.categoryId)
        ? effectiveEnabledMap.value.get(item.categoryId)
        : false
    }

    const moveItem = (item, dir) => {
      const findSiblings = (nodes) => {
        // 若有找到符合的id，則回傳同一層的分類樹
        if (nodes.some((c) => c.categoryId === item.categoryId)) return nodes

        // 若沒找到，繼續找每個分類的小孩
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

      const i = siblings.findIndex((c) => c.categoryId === item.categoryId)
      const j = dir === 'up' ? i - 1 : i + 1
      if (j < 0 || j >= siblings.length) return // 已在頂/底則不動

      // 交換陣列位置後再重新排序
      const a = siblings[i]
      siblings[i] = siblings[j]
      siblings[j] = a
      _reindexSort(siblings)
    }

    // ----------- 隱藏轉移 隱藏下架 -----------
    const dialogFormVisible = ref(false)
    const formLabelWidth = '140px'
    const currentItem = ref(null) // 標題顯示哪個分類要隱藏
    const subListForTrans = ref([])
    const leafListForTrans = ref([])
    const form = reactive({
      actionType: 'TRANSFER', // TRANSFER || DELIST
      mainCategoryId: null,
      subCategoryId: null,
      leafCategoryId: null,
    })

    const resetTransForm = () => {
      form.mainCategoryId = null
      form.subCategoryId = null
      form.leafCategoryId = null

      subListForTrans.value = []
      leafListForTrans.value = []
    }

    const onTransfer = (item) => {
      dialogFormVisible.value = true
      currentItem.value = item

      resetTransForm()
    }

    // EP 預設會傳新值
    const handleMainChange = (val) => {
      // 清空
      form.subCategoryId = null
      form.leafCategoryId = null
      subListForTrans.value = []
      leafListForTrans.value = []

      form.mainCategoryId = val
      const main = _sortedCategories.value.find((c) => c.categoryId === form.mainCategoryId)
      subListForTrans.value = main && main.children ? main.children : []
    }

    const handleSubChange = (val) => {
      // 清空
      form.leafCategoryId = null

      form.subCategoryId = val
      const main = _sortedCategories.value.find((c) => c.categoryId === form.mainCategoryId)
      const sub =
        main && main.children ? main.children.find((c) => c.categoryId === form.subCategoryId) : []
      leafListForTrans.value = sub && sub.children ? sub.children : []
    }

    const handleLeafChange = (val) => {
      form.leafCategoryId = val
    }

    const handleTransferOrDelist = () => {
      // 隱藏轉移
      if (form.actionType === 'TRANSFER') {
        // 主分類必填
        if (!form.mainCategoryId) {
          ElementPlus.ElMessage({ type: 'warning', message: '目標主分類為必填項目' })
          return
        }
        blockUI()

        axios({
          method: 'post',
          url: 'http://10.2.8.37:5005/api/product/updateCategoryAllInOne',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          data: {
            oneCategoryId: currentItem.value.categoryId,
            allCategoryId: [form.mainCategoryId, form.subCategoryId, form.leafCategoryId],
          },
        })
          .then((response) => {
            console.log(response.data)
            ElementPlus.ElMessage({ type: 'success', message: `分類商品轉移並隱藏成功` })
            // 執行成功後關閉視窗
            dialogFormVisible.value = false
          })
          .catch(function (error) {
            console.log(error)
            ElementPlus.ElMessage({ type: 'error', message: `存檔失敗，請重試` })
          })
          .finally(() => {
            $.unblockUI()
            console.log('完成')
          })
      }

      // 隱藏下架
      if (form.actionType === 'DELIST') {
        axios({
          method: 'post',
          url: 'http://10.2.8.37:5005/api/product/UpdateProductStatusByCategoryIds',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            // TODO : 待修改格式
            categoryId: currentItem.value.categoryId,
          },
        })
          .then((response) => {
            console.log(response.data)
            ElementPlus.ElMessage({ type: 'success', message: `已儲存成功` })
            // 執行成功後關閉視窗
            dialogFormVisible.value = false
          })
          .catch(function (error) {
            $.unblockUI()
            console.log(error)
          })
          .finally(() => {
            $.unblockUI()
            console.log('完成')
          })
      }
    }

    // ----------- 儲存所有變更 -----------
    // 遞迴展平整棵分類樹（主/次/子三層），讓每一層的 sort 都能送到後端存檔
    const _flattenTree = (nodes, acc = []) => {
      for (const c of nodes) {
        acc.push({
          id: c.extendId,
          categoryId: String(c.categoryId), // 後端收字串
          sort: c.sort,
          isVisible: c.isVisible,
        })
        if (c.children && c.children.length) _flattenTree(c.children, acc)
      }
      return acc
    }

    const onUpdate = async () => {
      const finalData = _flattenTree(_sortedCategories.value) // 三層全部節點

      try {
        const response = await axios({
          method: 'post',
          url: 'http://10.2.8.37:5005/api/product/UpsertProductCategoryExtend',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          data: finalData,
        })

        ElementPlus.ElMessage({ type: 'success', message: `已儲存成功` })
      } catch (error) {
        ElementPlus.ElMessage({ type: 'error', message: `存檔失敗，請重試` })
      } finally {
      }
    }

    return {
      mainList,
      selectMain,
      subList,
      leafList,
      selectedMainId,
      selectSub,
      selectedSubId,
      effectiveEnabled,
      moveItem,
      onTransfer,
      dialogFormVisible,
      formLabelWidth,
      form,
      currentItem,
      subListForTrans,
      leafListForTrans,
      handleMainChange,
      handleSubChange,
      handleLeafChange,
      onUpdate,

      // 數量加總
      totalSubCount,
      totalLeafCount,
      totalProductCount,
      totalSubProductCount,
      totalLeafProductCount,

      // 隱藏轉移或隱藏下架
      handleTransferOrDelist,
    }
  },
})

App.use(ElementPlus)
App.mount('#app')
