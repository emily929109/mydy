const App = Vue.createApp({
  setup() {
    const categories = ref([])
    const selectedMainId = ref(1)
    const selectedSubId = ref(2)

    const bySort = (a, b) => a.sort - b.sort

    const mainList = computed(() => {
      return categories.value.filter((c) => c.level === 1).sort(bySort)
    })

    // 次選單由 selectedMainId 決定
    const subList = computed(() => {
      return categories.value
        .filter((c) => c.level === 2 && c.categoryParentId === selectedMainId.value)
        .sort(bySort)
    })

    // 子選單由 selectedSubId
    const leafList = computed(() => {
      return categories.value
        .filter((c) => c.level === 3 && c.categoryParentId === selectedSubId.value)
        .sort(bySort)
    })

    // 用 id 查分類物件 (查父層用)
    const categoryMap = computed(() => {
      const m = new Map()
      for (const c of categories.value) m.set(c.categoryId, c)
      console.log('categoryMap', m)
      return m
    })

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

      // 暫時寫死測試api
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkRVQTMiLCJzdWIiOiJkdWR1cGF5IiwiaXNzdWVyIjoi5p2x5YWDIiwiZXhwaXJlZFRpbWUiOiIyMDI2LTA2LTA1IDEwOjA3OjQyIiwibWVtYmVyX2lkIjozODgxLCJrY19tZW1iZXJfbm8iOm51bGwsInJvbGUiOiJkZWFsZXIiLCJpZG5vIjpudWxsLCJtb2JpbGVubyI6IjA5MDkzOTUzOTQiLCJwdXJwb3NlIjpudWxsLCJmbG93SWQiOm51bGx9.1Md-1Rx9O6qGWCLHut72VBKsFYSEvBR2U89zuPFtMRQ'

      // call 取資料api
      axios({
        method: 'get',
        url: 'http://10.2.8.37:5005/api/product/category',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data) {
            categories.value = response.data.categories
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

    const selectMain = (id) => {
      // 1. 改變次選單
      selectedMainId.value = id

      // 2. 改變子選單 : 選 sort 最小的次分類為第一個，預防回傳資料有排序問題
      const subs = categories.value
        .filter((c) => c.level === 2 && c.categoryParentId === id)
        .sort(bySort)
      selectedSubId.value = subs.length ? subs[0].categoryId : null
    }

    const selectSub = (id) => {
      // 改變子選單
      selectedSubId.value = id
    }

    const effectiveEnabled = (item) => {
      let cur = item

      while (cur) {
        // 自己被關掉則冠class
        if (!cur.isVisible) return false

        // 檢查父層若被關掉，則子層也要被關掉
        cur = cur.categoryParentId == null ? null : categoryMap.value.get(cur.categoryParentId)
      }
      return true
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
          inputValidator: (value) => {
            if (!value || value.trim() === '') {
              return '名稱不可為空' // 回傳字串，此字串會自動替代 inputErrorMessage 顯示
            }
            return true
          },
        },
      )
        .then(async ({ value }) => {
          // 暫時寫死測試api
          const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkRVQTMiLCJzdWIiOiJkdWR1cGF5IiwiaXNzdWVyIjoi5p2x5YWDIiwiZXhwaXJlZFRpbWUiOiIyMDI2LTA2LTA1IDEwOjA3OjQyIiwibWVtYmVyX2lkIjozODgxLCJrY19tZW1iZXJfbm8iOm51bGwsInJvbGUiOiJkZWFsZXIiLCJpZG5vIjpudWxsLCJtb2JpbGVubyI6IjA5MDkzOTUzOTQiLCJwdXJwb3NlIjpudWxsLCJmbG93SWQiOm51bGx9.1Md-1Rx9O6qGWCLHut72VBKsFYSEvBR2U89zuPFtMRQ'
          const trimmedValue = value.trim()

          const categoriesPayload = categories.value.map((c) => {
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

          return
          // call 修改api
          try {
            const response = await axios({
              method: 'post',
              url: 'http://10.2.8.37:5005/api/product/updateCategoryExtend',
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
            // 網路斷線、401 未授權、或 500 報錯時會直接摔進這裡
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

    const moveItem = (item, dir) => {
      const siblings = categories.value
        .filter((c) => c.level === item.level && c.categoryParentId === item.categoryParentId)
        .sort(bySort)

      // 先取得現在的索引
      const i = siblings.findIndex((c) => c.categoryId === item.categoryId)

      // 取得交換的鄰居索引
      const j = dir === 'up' ? i - 1 : i + 1
      if (j < 0 || j >= siblings.length) return // 已在頂/底則不動
      const tmp = siblings[i].sort // 存入原本的排序值
      siblings[i].sort = siblings[j].sort // 改變現在的排序值為鄰居的排序值
      siblings[j].sort = tmp // 改變鄰居的排序值為原本的排序值
    }

    // ----------- 轉移 下架 -----------
    const dialogFormVisible = ref(false)
    const formLabelWidth = '140px'
    const currentItem = ref(null) // 標題顯示哪個分類要隱藏
    const subListForTrans = ref([])
    const leafListForTrans = ref([])

    const form = reactive({
      actionType: 'TRANSFER', // 預設勾選轉移
      mainCategorty: null,
      subCategorty: null,
      leafCategorty: null,
    })

    const onTransfer = (item) => {
      dialogFormVisible.value = true
      currentItem.value = item
    }

    // EP 預設會傳新值
    const handleMainChange = (val) => {
      console.log(val)
      console.log(categories.value)
      form.subListForTrans = null
      form.leafListForTrans = null
      subListForTrans.value = categories.value.filter(
        (c) => c.categoryParentId === val && c.level === 2,
      )
    }

    return {
      categories,
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
    }
  },
})

App.use(ElementPlus)
App.mount('#app')
