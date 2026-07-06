const nextTick = Vue.nextTick

const App = Vue.createApp({
  setup() {
    const selectedId = ref('')
    const taiwanCities = ref([])
    const selectedCity = ref('')
    const selectedDistrict = ref('')
    const search_value = ref('')
    const sel_value = ref('')
    const listMode = ref('') // 目前取商品的模式：'category'（分類）| 'query'（關鍵字查詢），供換頁重打
    const search_result = ref('')
    const keep_category_id = ref(null) // 目前選到的分類 CategoryId，供換頁重用
    const keep_query_value = ref('') // 目前的搜尋關鍵字，供換頁重用
    const productTotalCount = ref(0) // 分類查詢的總筆數（server 端分頁用）
    const rawCategories = ref([]) // 從 API 取回的原始分類資料
    const categories = ref([]) // 分類資料 render
    const drawerVisible = ref(false) // 手機版抽屜選單是否顯示
    const productList = ref([]) // 商品資料 render
    const breadcrumbPaths = ref([]) // 面包屑路徑名稱陣列
    const defaultOpeneds = ref([]) // 預設 el-menu會打開哪一層
    const searchInputRef = ref(null) // 搜尋框 ref

    onMounted(async () => {
      const classId = getUrlParameter('class_id')
      const searchValue = getUrlParameter('searchValue')
      const hasClassId = classId && classId !== 'null'
      const hasSearchValue = searchValue && searchValue !== 'null'

      // 進到此頁會有三種情況:
      // 1. 商城主頁按 DUDU 分類導覽列
      // 2. 在商城主頁搜尋關鍵字
      // 3. 商城主頁按查看更多
      // 先取所有 DUDU 分類
      try {
        blockUI()
        const resA = await axios.get('/api/Dealer/GetAllProductCategory')

        if (!resA.data || resA.data.length === 0) {
          rawCategories.value = []
          categories.value = []
          alert('目前沒有商品分類資料')
          return
        }
        rawCategories.value = resA.data
        categories.value = rawCategories.value // render
        defaultOpeneds.value = [String(categories.value[0].CategoryId)] // 預設 el-menu會打開哪一層
      } catch (error) {
        console.log(error)
      } finally {
        $.unblockUI()
      }

      if (hasClassId) {
        // 1. 商城主頁按 DUDU 分類導覽列
        await fetchProductsByCategory(classId)
      } else if (hasSearchValue) {
        // 2. 在商城主頁搜尋關鍵字
        await search(searchValue, false)
      } else {
        // 3. 商城主頁按查看更多：預設「第一筆分類」取商品
        await fetchProductsByCategory(categories.value[0].CategoryId)
      }

      // 監聽popstate事件 (搜尋後按上一頁)???????
      //window.addEventListener('popstate', (event) => {
      //    const searchValue = event.state ?.searchValue;
      //    if (searchValue) {
      //        // 前進到有搜尋的歷史
      //        search_result.value = searchValue;
      //        search_value.value = searchValue;
      //        search(searchValue, false);
      //    } else {
      //        // 當history state為null時 → 重載完整列表
      //        search_result.value = '';
      //        keep_class_id.value = '';
      //        search_value.value = '';
      //        _initLoad();
      //    }
      //});
    })

    // 依分類 CategoryId 取商品／關鍵字查詢商品（共用同一支 API）
    // handleMenuSelect(點 leaf)、handleMenuOpen(展開 sub-menu)、search(關鍵字查詢)、setPage(換頁) 共用
    const fetchProductsByCategory = async (categoryId, queryValue) => {
      if (!categoryId && !queryValue) return

      blockUI()
      try {
        const res = await axios.post('/api/DealerProduct/GetProductListByCategoryId', null, {
          params: {
            page: currentPage.value,
            pageSize: perpage.value,
            categoryId: categoryId || null,
            query_value: queryValue || null,
          },
        })

        const data = res.data || {}
        productList.value = data.ProductList || []
        productTotalCount.value = data.TotalCount || 0

        // 記住目前模式，供 setPage 換頁重打
        listMode.value = queryValue ? 'query' : 'category'
        keep_category_id.value = categoryId || null
        keep_query_value.value = queryValue || ''

        nextTick(() => {
          triggerProductsFadeUp()
        })
      } catch (error) {
        console.log(error)
      } finally {
        $.unblockUI()
      }
    }

    // 點 leaf 分類
    const handleMenuSelect = (index, indexPath) => {
      drawerVisible.value = false // 手機版關抽屜
      _createBreadcumbPath(indexPath)
      currentPage.value = 1 // 換分類回到第 1 頁
      fetchProductsByCategory(index) // index 即被點選分類的 CategoryId
    }

    // 展開 sub-menu
    const handleMenuOpen = (index, indexPath) => {
      _createBreadcumbPath(indexPath)
      currentPage.value = 1
      fetchProductsByCategory(index) // index 即被展開分類的 CategoryId
    }

    const triggerProductsFadeUp = () => {
      const isMobile = window.innerWidth < 768
      const options_x = {
        root: null,
        threshold: isMobile ? 0.1 : 0.3,
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show')
            // 觸發後解除監聽，優化效能
            observer.unobserve(entry.target)
          }
        })
      }, options_x)

      const targets = document.querySelectorAll('.fadeUp')

      targets.forEach((el) => {
        el.classList.remove('show')
        observer.observe(el)
      })
    }

    const _createBreadcumbPath = (indexPath) => {
      const pathResult = _pathNamesFromIndexPath(indexPath)
      if (pathResult) {
        breadcrumbPaths.value = pathResult
      } else {
        breadcrumbPaths.value = []
      }
    }

    const _pathNamesFromIndexPath = (indexPath) => {
      // indexPath 為EP預設回傳的路徑，例 : ['0109', '010902']
      const names = []
      let level = categories.value

      for (const id of indexPath) {
        const node = (level || []).find((n) => n.CategoryId === id)

        if (node) {
          names.push(node.Name)
          level = node.Children || []
        }
      }

      return names
    }

    // -------- 三層分類管理 結束 -----------
    // _getClassList = (_class_id) => {
    //   blockUI()
    //   axios({
    //     method: 'post',
    //     url: '/api/Dealer/GetProductListWithClass',
    //     headers: { 'Content-Type': 'application/json' },
    //     params: { class_id: _class_id },
    //   })
    //     .then((response) => {
    //       $.unblockUI()
    //       //console.log(response.data);
    //       if (response.data.success) {
    //         //init var
    //         currentPage.value = 1
    //         pageStart.value = 0
    //         pageEnd.value = 0
    //         json1.value = response.data.list
    //         productList.value = response.data.showJson
    //         tmpJson.value = response.data.showJson
    //         taiwanCities.value = response.data.regiontown

    //         keep_class_id.value = _class_id //keep
    //       } else {
    //         alert(response.data.msg)
    //       }
    //     })
    //     .catch(function (error) {
    //       $.unblockUI()
    //       console.log(error)
    //     })
    //     .finally(() => {
    //       console.log('完成')
    //     })
    // }

    //_getClassForPage = (_class_id) => {
    //    const start = (currentPage.value - 1) * perpage.value;
    //    const end = currentPage.value * perpage.value;

    //    blockUI();
    //    axios({
    //        method: 'post',
    //        url: '/api/Dealer/GetProductClassForPage',
    //        headers: { 'Content-Type': 'application/json' },
    //        params: { class_id: _class_id, start: start, end: end }

    //    }).then((response) => {
    //        $.unblockUI();
    //        //console.log(response.data);
    //        if (response.data.success) {
    //            //init
    //            //u.class_name = _class_name;
    //            //u.show = true;

    //            //json1.value = response.data.list;
    //            productList.value = response.data.showJson;
    //            tmpJson.value = response.data.showJson;
    //            //taiwanCities.value = response.data.regiontown;

    //            keep_class_id.value = _class_id;//keep
    //        }
    //        else {
    //            alert(response.data.msg);
    //        }

    //    }).catch((function (error) {
    //        $.unblockUI();
    //        console.log(error);
    //    })).finally(() => {
    //        console.log('完成');
    //    });
    //}

    // TODO : 按價格排序
    const selPrice = (_sel_value) => {
      //console.log(_sel_value);
      if (_sel_value == 1) {
        // 由低到高排序
        //showJson.value = tmpJson.value
        //    .filter(a => a.minCash && a.minCash !== 0)
        //    .sort((a, b) => a.minCash - b.minCash);
        //showJson.value = [...tmpJson.value].sort((a, b) => a.minCash - b.minCash);

        const sorted = tmpJson.value
          .filter((x) => x.store_no !== '')
          .sort((a, b) => a.minCash - b.minCash)

        let index = 0

        showJson.value = tmpJson.value.map((x) => {
          if (x.store_no !== '') {
            return sorted[index++] // 用排序後資料覆蓋
          }
          return x // 空的保留原位
        })
      } else if (_sel_value == 2) {
        // 由高到低排序
        const sorted = tmpJson.value
          .filter((x) => x.store_no !== '')
          .sort((a, b) => b.minCash - a.minCash)

        let index = 0

        showJson.value = tmpJson.value.map((x) => {
          if (x.store_no !== '') {
            return sorted[index++] // 用排序後資料覆蓋
          }
          return x // 空的保留原位
        })

        //showJson.value = tmpJson.value
        //    .filter(a => a.store_no && a.store_no !== '')
        //    .sort((a, b) => b.minCash - a.minCash);
        //showJson.value = [...tmpJson.value].sort((a, b) => b.minCash - a.minCash);
      }
    }

    // TODO : 選擇城市
    const selCity = (_selectedCity) => {
      //console.log(_selectedCity);
      //console.log(tmpJson.value);
      showJson.value = [...tmpJson.value].filter((item) => item.regiontown == _selectedCity)
      //console.log(showJson.value);
    }

    // 有兩個呼叫來源 ： 1.搜尋框觸發  2.從 onmounted 帶網址參數進頁
    const search = async (_search_value, pushHistory = true) => {
      if (!_search_value) return

      currentPage.value = 1 // 新搜尋回到第 1 頁
      search_result.value = _search_value // 找不到商品提示、網址列顯示搜尋條件
      search_value.value = _search_value // 呼叫來源為 2 時把關鍵字回填搜尋框

      await fetchProductsByCategory(null, _search_value)

      if (pushHistory) {
        window.history.pushState(
          { searchValue: _search_value },
          '',
          `?searchValue=${encodeURIComponent(_search_value)}`,
        )
      }
    }

    const clearSearch = () => {
      search_value.value = ''
      searchInputRef.value.focus()
    }

    // -------- 換頁邏輯 開始 -----------
    const perpage = ref(8)
    const currentPage = ref(1)
    const totalPage = computed(() => {
      return Math.ceil(productTotalCount.value / perpage.value)
    })
    const disabled_prev = computed(() => currentPage.value <= 1)
    const disabled_next = computed(() => currentPage.value >= totalPage.value)

    const setPage = (page) => {
      if (page === '...' || page < 1 || page > totalPage.value) return

      currentPage.value = page

      if (listMode.value === 'query') {
        // 關鍵字查詢（GetProductListByCategoryId + query_value）
        fetchProductsByCategory(keep_category_id.value, keep_query_value.value)
      } else {
        // dudu 分類（GetProductListByCategoryId）
        fetchProductsByCategory(keep_category_id.value)
      }
    }

    // 計算顯示頁碼（含 "..."）
    const displayPages = computed(() => {
      const total = totalPage.value
      const current = currentPage.value
      const delta = 2 // 前後顯示幾個
      const range = []
      const rangeWithDots = []
      let last = 0

      for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
          range.push(i)
        }
      }

      for (let i of range) {
        if (last) {
          if (i - last === 2) rangeWithDots.push(last + 1)
          else if (i - last !== 1) rangeWithDots.push('...')
        }
        rangeWithDots.push(i)
        last = i
      }
      return rangeWithDots
    })

    // -------- 換頁邏輯 結束 -----------

    return {
      selectedId,
      taiwanCities,
      selectedCity,
      selectedDistrict,
      selPrice,
      search_value,
      search,
      selType,
      sel_value,
      selCity,

      perpage,
      currentPage,
      setPage,
      totalPage,
      // pageStart,
      // pageEnd,
      disabled_prev,
      disabled_next,
      displayPages,
      search_result,
      clearSearch,
      listMode,

      handleMenuSelect,
      categories,
      drawerVisible,
      productList,
      breadcrumbPaths,
      defaultOpeneds,
      handleMenuOpen,
      searchInputRef,
    }
  },
})

App.use(ElementPlus)
App.mount('#app')

$(window).on('load', function () {})
