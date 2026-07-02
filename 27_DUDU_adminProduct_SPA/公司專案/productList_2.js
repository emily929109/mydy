const nextTick = Vue.nextTick

const App = Vue.createApp({
  setup() {
    //----page
    const perpage = ref(8) //一頁的資料數
    const currentPage = ref(1)
    const disabled_prev = ref(true)
    const disabled_next = ref(false)
    const totalPage = computed(() => {
      var total_page = Math.ceil(showJson.value.length / perpage.value)
      if (total_page == 1) {
        disabled_prev.value = true
        disabled_next.value = true
      }
      return total_page
    })
    const pageStart = computed(() => {
      return (currentPage.value - 1) * perpage.value
      //取得該頁第一個值的index
    })
    const pageEnd = computed(() => {
      return currentPage.value * perpage.value
      //取得該頁最後一個值的index
    })
    // 換頁控制
    const setPage = (page) => {
      if (page === '...' || page < 1 || page > totalPage.value) return

      currentPage.value = page

      if (page <= 1) {
        disabled_prev.value = true
        disabled_next.value = totalPage.value === 1
      } else if (page >= totalPage.value) {
        disabled_prev.value = false
        disabled_next.value = true
      } else {
        disabled_prev.value = false
        disabled_next.value = false
      }

      //單擊之後所加的
      switch (keep_class_id.value) {
        case 'city': //city search
          _getListForCityPage()
          break
        case 'search': //search
          _getListForSearchPage()
          break
        case '': //all
          _getListForPage()
          break
        default: //類別
          _getClassForPage(keep_class_id.value)
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
    //---

    const json1 = ref([])
    const showJson = ref([])
    const tmpJson = ref([])
    const selectedId = ref('')
    const taiwanCities = ref([])
    const selectedCity = ref('')
    const selectedDistrict = ref('')
    const search_value = ref('')
    const sel_value = ref('')
    const keep_class_id = ref('')
    const search_result = ref('')

    // -------- 三層分類管理 開始 -----------
    const rawCategories = ref([])
    const categories = ref([])
    const drawerVisible = ref(false)
    const productList = ref([])
    const breadcrumbPaths = ref([])
    const defaultOpeneds = ref('') // 預設 el-menu會打開哪一層

    onMounted(() => {
      var _class_id = getUrlParameter('class_id')
      var _searchValue = getUrlParameter('searchValue')

      // 1. 按商城主頁分類後
      if (_class_id != 'null') {
        _getClassList(_class_id)
      } else if (_searchValue != 'null') {
        // 2. 在商城主頁搜尋關鍵字後
        search(_searchValue)
        //console.log(_searchValue);
        search_result.value = _searchValue //找不到商品提示、網址列顯示搜尋條件
        search_value.value = _searchValue //搜尋框顯示搜尋條件
      } else {
        // 3. 在商城主頁按查看全部商品後不帶任何query string
        _initLoad()
      }

      //監聽popstate事件 (搜尋後按上一頁)
      window.addEventListener('popstate', (event) => {
        const searchValue = event.state?.searchValue
        if (searchValue) {
          // 前進到有搜尋的歷史
          search_result.value = searchValue
          search_value.value = searchValue
          search(searchValue, false)
        } else {
          // 當history state為null時 → 重載完整列表
          search_result.value = ''
          keep_class_id.value = ''
          search_value.value = ''
          _initLoad()
        }
      })
    })

    //所有 單頁
    _getListForPage = () => {
      const start = (currentPage.value - 1) * perpage.value
      const end = currentPage.value * perpage.value
      //console.log(start);
      //console.log(end);

      blockUI()
      axios({
        method: 'post',
        url: '/api/Dealer/GetStoreListForPage',
        headers: { 'Content-Type': 'application/json' },
        params: { start: start, end: end },
      })
        .then((response) => {
          $.unblockUI()
          //console.log(response.data);
          if (response.data.success) {
            //json1.value = response.data.list;
            showJson.value = response.data.showJson
            tmpJson.value = response.data.showJson
            //taiwanCities.value = response.data.regiontown;
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

    _initLoad = () => {
      // 舊api : GetProductList
      blockUI()
      axios({
        method: 'get',
        url: '/api/Dealer/GetAllProductCategory',
      })
        .then((response) => {
          console.log(response.data)
          if (Array.isArray(response.data) && response.data.length > 0) {
            rawCategories.value = response.data
            categories.value = rawCategories.value // 留categories render用，目前不需要做任何處理
            defaultOpeneds.value = categories.value[0].CategoryId
            console.log('defaultOpeneds.value', defaultOpeneds.value)
            console.log(categories.value)
            //showJson.value = response.data.showJson; //商品
            //tmpJson.value = response.data.showJson;
            //taiwanCities.value = response.data.regiontown;

            //keep_class_id.value = '';//keep
          } else {
            // 成功連上但沒有任何分類
            rawCategories.value = []
            categories.value = []
            alert('目前沒有商品分類資料')
          }
        })
        .catch(function (error) {
          console.log(error)
          alert('讀取商品分類失敗,請稍後再試')
        })
        .finally(() => {
          $.unblockUI()
        })

      // 取得商品 模擬api回傳資料
      fetch('/js/adminProduct/fakeProduct.json')
        .then((res) => res.json())
        .then((data) => {
          productList.value = data
          triggerProductsFadeUp()
        })
        .catch((err) => {
          console.error('Failed to load product data:', err)
        })
    }

    const sortCategoryTree = (treeData) => {
      if (!treeData || treeData.length === 0) return []

      // 遞增
      treeData.sort((a, b) => a.sort - b.sort)

      // 檢查底下有沒有 children，有則遞迴呼叫
      treeData.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sortCategoryTree(item.children)
        }
      })

      return treeData
    }

    const _getFirstSubId = () => {
      const list = categories.value

      if (!list || list.length === 0) return null
      if (list[0] || list[0].children.length > 0) return list[0].categoryId

      return null
    }

    const handleMenuClick = (id) => {
      // 只對手機版有用
      drawerVisible.value = false

      // 麵包屑
      const pathResult = _findCategoryPathNames(categories.value, id)
      if (pathResult) {
        breadcrumbPaths.value = pathResult
      } else {
        breadcrumbPaths.value = []
      }

      // todo : call api
      fetch('/js/adminProduct/fakeProduct.json')
        .then((res) => res.json())
        .then((data) => {
          // [2,4,5] includes(4) 回傳true
          // 因現在prd只掛在leaf下面，因此點大分類必須找到其leaf
          const ids = _findCategoryIds(categories.value, id) || [id]

          productList.value = data.filter((p) => ids.includes(p.categoryId))
          //productList.value = data.filter(p => p.categoryId===id);
          nextTick(() => {
            triggerProductsFadeUp()
          })
        })
        .catch((err) => {
          console.error('Failed to load product data:', err)
        })
    }

    //  檢查所有子層是否等於targetId (遞迴呼叫)
    const _findCategoryIds = (nodes, targetId) => {
      if (!nodes) return null

      for (const node of nodes) {
        if (node.categoryId === targetId) {
          return _collectDescendantIds(node)
        }
        // 子層ID不等於targetId，則繼續尋找其子層
        const found = _findCategoryIds(node.children, targetId)
        if (found) return found
      }
      return null
    }

    // 收集所有子孫的 categoryId
    const _collectDescendantIds = (node) => {
      let ids = [node.categoryId]

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          ids = ids.concat(_collectDescendantIds(child))
        })
      }
      return ids
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

    const _findCategoryPathNames = (nodes, targetId, currentPath = []) => {
      if (!nodes) return null

      for (const node of nodes) {
        // 沿路把目前這一層的名字暫存進去，看有沒有找到
        const newPath = [...currentPath, node.Name]

        // 命中
        if (node._index === targetId) {
          return newPath
        }

        // 沒命中
        if (node.Children && node.Children.length > 0) {
          const foundPath = _findCategoryPathNames(node.Children, targetId, newPath)
          if (foundPath) return foundPath // 如果在子孫裡找到了，就一路回傳上來
        }
      }
      return null // 都沒找到，則回傳null
    }

    // -------- 三層分類管理 結束 -----------
    _getClassList = (_class_id) => {
      blockUI()
      axios({
        method: 'post',
        url: '/api/Dealer/GetProductListWithClass',
        headers: { 'Content-Type': 'application/json' },
        params: { class_id: _class_id },
      })
        .then((response) => {
          $.unblockUI()
          //console.log(response.data);
          if (response.data.success) {
            //init var
            currentPage.value = 1
            pageStart.value = 0
            pageEnd.value = 0
            json1.value = response.data.list
            showJson.value = response.data.showJson
            tmpJson.value = response.data.showJson
            taiwanCities.value = response.data.regiontown

            keep_class_id.value = _class_id //keep
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

    _getClassForPage = (_class_id) => {
      const start = (currentPage.value - 1) * perpage.value
      const end = currentPage.value * perpage.value

      blockUI()
      axios({
        method: 'post',
        url: '/api/Dealer/GetProductClassForPage',
        headers: { 'Content-Type': 'application/json' },
        params: { class_id: _class_id, start: start, end: end },
      })
        .then((response) => {
          $.unblockUI()
          //console.log(response.data);
          if (response.data.success) {
            //init
            //u.class_name = _class_name;
            //u.show = true;

            //json1.value = response.data.list;
            showJson.value = response.data.showJson
            tmpJson.value = response.data.showJson
            //taiwanCities.value = response.data.regiontown;

            keep_class_id.value = _class_id //keep
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

    selPrice = (_sel_value) => {
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
    selCity = (_selectedCity) => {
      //console.log(_selectedCity);
      //console.log(tmpJson.value);
      showJson.value = [...tmpJson.value].filter((item) => item.regiontown == _selectedCity)
      //console.log(showJson.value);
    }

    search = (_search_value, pushHistory = true) => {
      if (!_search_value) return

      blockUI()
      axios({
        method: 'post',
        url: '/api/Dealer/GetProductList',
        headers: { 'Content-Type': 'application/json' },
        params: { SearchValue: _search_value },
      })
        .then((response) => {
          $.unblockUI()
          //console.log(response.data);
          if (response.data.success) {
            json1.value = response.data.list
            showJson.value = response.data.showJson
            tmpJson.value = response.data.showJson
            taiwanCities.value = response.data.regiontown
            keep_class_id.value = 'search'
            //找不到商品提示、網址列顯示搜尋條件
            search_result.value = _search_value
            if (pushHistory) {
              window.history.pushState(
                { searchValue: _search_value },
                '',
                `?searchValue=${encodeURIComponent(search_result.value)}`,
              )
            }
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

    selType = (_class_id, _class_name) => {
      //console.log(_class_id);
      _getClassList(_class_id, _class_name)
    }
    clearSearch = () => {
      search_value.value = ''
      searchInputRef.value.focus()
    }

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
      pageStart,
      pageEnd,
      disabled_prev,
      disabled_next,
      displayPages,
      search_result,
      clearSearch,
      keep_class_id,

      handleMenuClick,
      categories,
      drawerVisible,
      productList,
      breadcrumbPaths,
      defaultOpeneds,
    }
  },
})

App.use(ElementPlus)
App.mount('#app')

$(window).on('load', function () {})
