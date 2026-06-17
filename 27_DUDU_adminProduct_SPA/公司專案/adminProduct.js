const App = Vue.createApp({
  setup() {
    // --- 全域變數
    const token = window.__SERVER_TOKEN__

    // --- API
    const _getDataUrl = 'http://10.2.8.37:5005/api/product/category' // 用於onMounted
    const _updateUrl = 'http://10.2.8.37:5005/api/product/upsertCategoryExtend' // 用於onEdit onUpdate
    const _updateCategoryAllInOne = 'http://10.2.8.37:5005/api/product/updateCategoryAllInOne' // 用於 updateCategoryAllInOne

    // --- 三欄管理變數
    const rawCategories = ref([])
    const _sortedCategories = ref([])
    const selectedMainId = ref(null)
    const selectedSubId = ref(null)

    // --- computed
    const mainList = computed(() => {
      return _sortedCategories.value
    })

    // 次選單由 selectedMainId 決定
    const subList = computed(() => {
      const main = _sortedCategories.value.find((c) => c.categoryId === selectedMainId.value)
      //console.log(main.children)
      return main?.children ?? []
    })

    // 子選單由 selectedSubId
    const leafList = computed(() => {
      const main = _sortedCategories.value.find((c) => c.categoryId === selectedMainId.value)
      const sub = main?.children?.find((c) => c.categoryId === selectedSubId.value)
      return sub?.children ?? [] // ??為空值合併運算子
    })

    // 用 id 查分類物件 (查父層用)
    //const categoryMap = computed(() => {
    //    const m = new Map();
    //    for (const c of rawCategories.value) m.set(c.categoryId, c);
    //    //console.log("categoryMap", m);
    //    return m;
    //});

    onMounted(() => {
      // 模擬從後端 API 取得分類資料
      //fetch("/js/adminProduct/adminProduct.json")
      //.then((res) => res.json())
      //.then((data) => {
      //    categories.value = data;
      //    console.log(categories.value)
      //})
      //.catch((err) => {
      //    console.error("Failed to load category data:", err);
      //});

      axios({
        method: 'get',
        url: _getDataUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data) {
            rawCategories.value = response.data.categories
            _sortedCategories.value = _sortCategoryTree(rawCategories.value)

            // 預設初載時顯示第一個主分類
            const firstMain = _sortedCategories.value[0]
            selectedMainId.value = firstMain ? firstMain.categoryId : null

            // 預設顯示第一個次分類
            const firstSub = firstMain?.children?.[0]
            selectedSubId.value = firstSub ? firstSub.categoryId : null
          }
        })
        .catch(function (error) {
          $.unblockUI()
          console.log(error)
        })
        .finally(() => {
          console.log('完成')
        })
    })

    const _sortCategoryTree = (nodes) => {
      if (!nodes || nodes.length === 0) return []

      // 複製一份到新陣列避免污染原始資料
      return [...nodes]
        .sort((a, b) => {
          return a.sort - b.sort // 遞增
        })
        .map((node) => {
          if (node.children && node.children.length > 0) {
            // 複製一份到新陣列 並用整理好的覆蓋 children
            return {
              ...node,
              children: _sortCategoryTree(node.children),
            }
          }
          return node
        })
    }

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

    //const effectiveEnabled = (item) => {
    //    //
    //    let cur = item;

    //    while (cur) {
    //        // 自己被關掉則冠class
    //        if (!cur.isVisible) return false;

    //        // 檢查父層若被關掉，則子層也要被關掉
    //        cur = cur.categoryParentId == null ? null : categoryMap.value.get(cur.categoryParentId);
    //    }
    //    return true;
    //}

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

    const onEdit = (item) => {
      ElementPlus.ElMessageBox.prompt(
        `修改「${item.nickName || item.name}」的商城前台顯示名稱：`,
        '輸入資訊',
        {
          confirmButtonText: '確認',
          cancelButtonText: '取消',
          inputErrorMessage: '請輸入欲修改的名稱',
          inputPlaceholder: '請輸入新的顯示名稱',
          inputValue: item.nickName || item.name,
          //inputValidator: (value) => {
          //    if (!value || value.trim() === '') {
          //        return '名稱不可為空'; // 回傳字串，此字串會自動替代 inputErrorMessage 顯示
          //    }
          //    return true;
          //}
        },
      )
        .then(async ({ value }) => {
          const trimmedValue = value.trim()

          const categoriesPayload = _sortedCategories.value.map((c) => {
            const isCurrentItem = c.categoryId === item.categoryId

            return {
              id: c.extendId,
              categoryId: c.categoryId,
              nickname: isCurrentItem ? trimmedValue : c.nickName,
              sort: c.sort,
              isVisible: c.isVisible,
            }
          }) // [{...},{...},{...}]

          const finalData = {
            Categories: categoriesPayload,
          } //{ Categories: Array(...) }

          // call 修改api
          try {
            const response = await axios({
              method: 'post',
              url: _updateUrl,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              data: finalData,
            })

            // 成功後
            console.log(response.data)

            if (response.data) {
              item.nickName = trimmedValue

              ElementPlus.ElMessage({
                type: 'success',
                message: `已成功修改名稱`,
              })
            }
          } catch (error) {
            console.error('API 連線失敗:', error)

            ElementPlus.ElMessage({
              type: 'error',
              message: '伺服器儲存失敗，請重新操作。',
            })
          } finally {
            console.log('完成')
          }
        })
        .catch((action) => {
          if (action === 'cancel' || action === 'close') {
            ElementPlus.ElMessage({
              type: 'info',
              message: '已取消修改',
            })
          }
        })
    }

    //const moveItem = (item, dir) => {
    //    const siblings = _sortedCategories.value
    //        //.filter((c) => c.level === item.level && c.categoryParentId === item.categoryParentId)
    //        //.sort(bySort)

    //    // 先取得現在的索引
    //    const i = siblings.findIndex((c) => c.categoryId === item.categoryId)

    //    // 取得交換的鄰居索引
    //    const j = dir === 'up' ? i - 1 : i + 1
    //    if (j < 0 || j >= siblings.length) return // 已在頂/底則不動
    //    const tmp = siblings[i].sort // 存入原本的排序值
    //    siblings[i].sort = siblings[j].sort // 改變現在的排序值為鄰居的排序值
    //    siblings[j].sort = tmp // 改變鄰居的排序值為原本的排序值
    //}

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
      leafListForTrans.value = []

      form.mainCategoryId = val
      subListForTrans.value = _sortedCategories.value.filter(
        (c) => c.categoryParentId === val && c.level === 2,
      )
    }

    const handleSubChange = (val) => {
      // 清空
      form.leafCategoryId = null

      form.subCategoryId = val
      leafListForTrans.value = _sortedCategories.value.filter(
        (c) => c.categoryParentId === val && c.level === 3,
      )
    }

    const handleLeafChange = (val) => {
      form.leafCategoryId = val
    }

    // 將所有指定分類集中轉換到一個指定分類中
    const updateCategoryAllInOne = async () => {
      dialogFormVisible.value = false

      try {
        const response = await axios({
          method: 'post',
          url: _updateCategoryAllInOne,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          data: {
            oneCategoryId: currentItem.value.categoryId,
            allCategoryId: [form.mainCategoryId, form.subCategoryId, form.leafCategoryId],
          },
        })

        console.log(response.data)
      } catch (error) {
        console.error('API 連線失敗:', error)
      } finally {
        console.log('完成')
      }
    }

    // ----------- 儲存所有變更 -----------
    const onUpdate = async () => {
      const categoriesPayload = _sortedCategories.value.map((c) => {
        return {
          id: c.extendId,
          categoryId: c.categoryId,
          nickname: c.nickName || c.name,
          sort: c.sort,
          isVisible: c.isVisible,
        }
      }) // [{...},{...},{...}]

      const finalData = {
        Categories: categoriesPayload,
      } //{ Categories: Array(...) }

      // call 修改api
      try {
        const response = await axios({
          method: 'post',
          url: _updateUrl,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          data: finalData,
        })

        console.log(response.data)
      } catch (error) {
        console.error('API 連線失敗:', error)
      } finally {
        console.log('完成')
      }
    }

    return {
      //categories,
      //sortedCategories,
      mainList,
      selectMain,
      subList,
      leafList,
      selectedMainId,
      selectSub,
      selectedSubId,
      effectiveEnabled,
      onEdit,
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
      updateCategoryAllInOne,
    }
  },
})

App.use(ElementPlus)
App.mount('#app')
