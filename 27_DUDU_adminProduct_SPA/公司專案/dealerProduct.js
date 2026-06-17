const watch = Vue.watch

const App = Vue.createApp({
  setup() {
    const dealerAvailableCategories = ref([]) // 經銷商可用的分類

    // 原API : /api/DealerProduct/GetProductListForDealer
    _getProductList = async () => {
      const member = JSON.parse(localStorage.getItem('member'))
      if (member == null) return

      blockUI()
      try {
        // 同時打兩支api 分別取的商品和分類資料
        const [resA, resB, resC] = await Promise.all([
          axios.post('/api/DealerProduct/GetProductListForDealer', null, {
            headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
            params: { member_id: member.id, page: currentPage.value, pageSize: perpage.value },
          }),
          axios.post('/api/DealerProduct/GetProductClassListByMemberId', null, {
            headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
            params: { member_id: member.id },
          }),
          // 純前端測試用
          fetch('/js/adminProduct/fakeCategoryTreeData.json').then((response) => response.json()),
        ])

        console.log(resA.data)
        console.log(resB.data)
        console.log(resC)

        //取得商品資料
        if (resA.data.success) {
          productListJson.value = resA.data.productList
          totalCount.value = resA.data.totalCount //計算totalPage
        }
        //取得分類資料
        if (resB.data.success) {
          product_class_listJson.value = resB.data.value
        }

        if (resC) {
          dealerAvailableCategories.value = resC.categories
        }
      } catch (error) {
        console.log(error)
      } finally {
        $.unblockUI()
      }
    }

    setProductStatus = (_v) => {
      console.log(_v)
      console.log(_v.product_status)
      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/SetProductStatus',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { product_id: _v.product_id, product_status: _v.product_status ? '' : '*' },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data.success) {
          } else {
            alert(response.data.msg)
          }
        })
        .catch(function (error) {
          $.unblockUI()
          console.log(error)
        })
        .finally(() => {
          console.log('完成')
        })
    }

    // ------ 選取功能 ------
    const selectedIds = ref([])

    const toggleItem = (id) => {
      const idx = selectedIds.value.indexOf(id)
      if (idx >= 0) {
        selectedIds.value.splice(idx, 1)
      } else {
        selectedIds.value.push(id)
      }
    }

    const isAllSelected = computed(() => {
      return (
        productListJson.value.length > 0 &&
        selectedIds.value.length === productListJson.value.length
      )
    })

    const toggleAll = (checked) => {
      selectedIds.value = checked ? productListJson.value.map((item) => item.product_id) : []
    }

    // ------ 批量更新分類 ------
    const availableSubCateList = ref([])
    const availableLeafCateList = ref([])
    const batchUpdateCateDialogVisible = ref(false)
    const batchUpdCateForm = reactive({
      mainCategoryId: null,
      subCategoryId: null,
      leafCategoryId: null,
    })

    const openBatchUpdCateDialog = () => {
      batchUpdateCateDialogVisible.value = true
      resetBatchUpdCateForm()
    }

    const resetBatchUpdCateForm = () => {
      batchUpdCateForm.mainCategoryId = null
      batchUpdCateForm.subCategoryId = null
      batchUpdCateForm.leafCategoryId = null

      availableSubCateList.value = []
      availableLeafCateList.value = []
    }

    // EP 預設會傳新值，value 是綁定 categoryId
    const handleBatchMainChange = (val) => {
      // 清空
      batchUpdCateForm.subCategoryId = null
      batchUpdCateForm.leafCategoryId = null
      availableSubCateList.value = []
      availableLeafCateList.value = []

      batchUpdCateForm.mainCategoryId = val
      const main = dealerAvailableCategories.value.find(
        (c) => c.categoryId === batchUpdCateForm.mainCategoryId,
      )
      availableSubCateList.value = main && main.children ? main.children : []
    }

    const handleBatchSubChange = (val) => {
      batchUpdCateForm.leafCategoryId = null

      batchUpdCateForm.subCategoryId = val
      const main = dealerAvailableCategories.value.find(
        (c) => c.categoryId === batchUpdCateForm.mainCategoryId,
      )
      const sub =
        main && main.children
          ? main.children.find((c) => c.categoryId === batchUpdCateForm.subCategoryId)
          : []
      availableLeafCateList.value = sub && sub.children ? sub.children : []
    }

    const handleBatchLeafChange = (val) => {
      batchUpdCateForm.leafCategoryId = val
    }

    return {
      // 多選功能:
      toggleItem,
      selectedIds,
      isAllSelected,
      toggleAll,

      // 經銷商可用的分類:
      dealerAvailableCategories,

      // 批次修改分類:
      batchUpdateCateDialogVisible,
      openBatchUpdCateDialog,
      batchUpdCateForm,
      handleBatchMainChange,
      availableSubCateList,
      availableLeafCateList,
      handleBatchSubChange,
      handleBatchLeafChange,
    }
  },
})

//Vue.createApp(App).mount('#app');

App.use(ElementPlus)
App.mount('#app')

$(window).on('load', function () {
  var member = JSON.parse(localStorage.getItem('member'))
  if (member == null || member.login_ok_msg != '*' || member.role != 'dealer') {
    window.location.href = '../Home/Index'
    return
  }
})
