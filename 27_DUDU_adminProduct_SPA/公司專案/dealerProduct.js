const watch = Vue.watch

const App = Vue.createApp({
  setup() {
    // ------ 全域 ------
    const member = JSON.parse(localStorage.getItem('member'))

    //---- 分頁變數 -----------------------------------------------------------
    const perpage = ref(8) //一頁的資料數
    const currentPage = ref(1)
    const totalPage = computed(() => {
      var total_page = Math.ceil(totalCount.value / perpage.value)
      return total_page
    })
    // 改成 computed，自動跟著 currentPage 和 totalPage 變
    const disabled_prev = computed(() => currentPage.value <= 1)
    const disabled_next = computed(() => currentPage.value >= totalPage.value)

    const pageStart = computed(() => {
      return (currentPage.value - 1) * perpage.value
      //取得該頁第一個值的index
      //這一頁的資料，要從大陣列（showJson）的第幾個 Index（索引值）開始抓
    })
    const pageEnd = computed(() => {
      return currentPage.value * perpage.value
      //取得該頁最後一個值的index
    })

    // 換頁控制
    const setPage = (page) => {
      if (page === '...' || page < 1 || page > totalPage.value) return

      currentPage.value = page

      //單擊之後所加的
      switch (select_mode.value) {
        case 'init':
          _getListForPage() // 顯示全部商品，換頁打後端
          break

        case 'class':
          _getClassForPage() // 依分類篩選，換頁打後端
          break

        case 'updown':
          _getUpDownForPage() // 依上下架篩選，換頁打後端
          break

        case 'query':
          _getQueryResultForPage(query_value.value) // 依搜尋值篩選，換頁打後端
          break
        default:
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

    const jsonShow = ref([])
    const image1_path = ref(false)
    const image_product_1 = ref(false)
    const image_product_2 = ref(false)
    const image_product_3 = ref(false)
    const image_product_4 = ref(false)
    const image_product_5 = ref(false)
    const file_1 = ref(null)
    const file_product_1 = ref(null)
    const file_product_2 = ref(null)
    const file_product_3 = ref(null)
    const file_product_4 = ref(null)
    const file_product_5 = ref(null)
    const tmpFile = ref('')
    const storeJson = ref({
      store_no: '',
      store_checked: false,
      dealer_name: '',
      store_name: '',
      store_address: '',
      store_desc: '',
    })
    const productClassJson = ref([])
    const productClass = ref({})
    const tmp_productListJson = ref([])

    const sel_class_name = ref('')
    const sel_up_down = ref('')
    const showUploadDiv = ref(true)
    const showProductUploadDiv_1 = ref(true)
    const showProductUploadDiv_2 = ref(true)
    const showProductUploadDiv_3 = ref(true)
    const _randomString = ref('')
    var quill = {}
    const hasNextMothPay = ref(false)
    const keep_class_id = ref('')
    const keep_class_name = ref('')
    const searchInputRef = ref(null)
    const query_value = ref('')
    const select_mode = ref('init') // 'init' | 'class' | 'updown' | 'query' 取代 keep_class_id，紀錄目前的篩選模式
    const keep_up_down_value = ref('') // 記錄上下架篩選值
    const keep_query_value = ref('') // 記錄上下架篩選值

    // 換頁
    const _getListForPage = () => {
      if (member == null) return

      // 舊api : GetListForPageForDealer
      // 新api : GetProductListForDealer (page給頁面當前要的第幾頁 pageSize是一頁幾筆)
      blockUI()
      axios({
        method: 'post',
        url: _getProductListUrl,
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { store_no: member.store_no, page: currentPage.value, pageSize: perpage.value },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data) {
            productListJson.value = response.data.ProductList || [] // 預防後端回傳null
            totalCount.value = response.data.TotalCount || 0
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

    // 新增/編輯上傳商品照
    handleFileUpload = (_item, e) => {
      console.log(e)

      //console.log(file_1.value.files[0]);

      //tmpFile.value = file_1.value.files[0];//ref get file

      var files = e.target.files || e.dataTransfer.files
      console.log(files[0])
      if (!files.length) return

      createImage(_item, files[0])
      //console.log(tmpFile.value);
    }

    // 圖片預覽
    createImage = (_item, file) => {
      //var image = new Image();
      var reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = (e) => {
        let img = new Image()
        img.onload = () => {
          switch (_item) {
            case 'logo':
              image1_path.value = e.target.result //base 64
              break
            case 'image_1':
              image_product_1.value = e.target.result //base 64
              break
            case 'image_2':
              image_product_2.value = e.target.result //base 64
              break
            case 'image_3':
              image_product_3.value = e.target.result //base 64
              break
            case 'image_4':
              image_product_4.value = e.target.result //base 64
              break
            case 'image_5':
              image_product_5.value = e.target.result //base 64
              break
            default:
          }

          var per = 1
          var width = img.width
          if (img.width > 410) {
            width = 410
            per = 410 / img.width
          }

          submitFile(_item, width, Math.ceil(per * img.height), file)
        }
        img.src = e.target.result
      }
      //reader.readAsDataURL(file);
      //submitFile(item);
    }

    submitFile = (_item, _width, _height, file) => {
      if (member == null) return

      //check ID0H-1...轉成ID0H
      //var _item = item.indexOf('ID0H') > 0 ? 'ID0H' : item;
      var productIdOrRandom
      if (_item != 'logo') {
        //商品圖
        if (_randomString.value == '') {
          //商品編輯 帶商品編號
          productIdOrRandom = productJson.value.product_id
        } else {
          productIdOrRandom = _randomString.value //新增商品
        }
      }

      let formData = new FormData()
      //formData.append('file', tmpFile.value);
      formData.append('file', file)
      formData.append(
        'data',
        JSON.stringify({
          item: _item,
          mobile: member.mobile,
          img: member.dealer_acc,
          width: _width,
          height: _height,
          productIdOrRandom: productIdOrRandom,
        }),
      )

      axios
        .post('/api/CmsUpload/PostFormData_cms', formData, {
          headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'multipart/form-data' },
        })
        .then((response) => {
          if (response.data.success) {
            switch (_item) {
              case 'logo':
                showUploadDiv.value = false
                break
              case 'image_1':
                showProductUploadDiv_1.value = false
                break
              case 'image_2':
              //showProductUploadDiv_2.value = false;
              case 'image_3':
              //showProductUploadDiv_3.value = false;
              case 'image_4':
              case 'image_5':
                //if (image_product_2.value != '' && image_product_3.value != '' &&
                //    image_product_4.value != '' && image_product_5.value != '') {
                ////showProductUploadDiv_2.value = false;
                //}

                break
              default:
            }

            console.log(response.data)
            console.log('SUCCESS!!')
          } else {
            alert(response.data.msg)
          }
        })
        .catch(function (error) {
          console.log(error)
          console.log('FAILURE!!')
        })
        .finally(() => {
          console.log('完成')
        })
    }
    //---------------------------------------------------------------------------

    //新增商品
    addProduct = () => {
      //init
      _randomString.value = generateRandomString(16)
      //addProductSpec();
      const today = formatDate(new Date())
      productJson.value = {
        date_s: today,
        date_e: '',
        product_spec: [{ name: '', qty: 0, cash: 0, car_checked: false, home_checked: true }],
        product_class: storeJson.value.product_class,
        cate: { mainCategoryId: null, subCategoryId: null, leafCategoryId: null },
      }

      image_product_1.value = ''
      image_product_2.value = ''
      image_product_3.value = ''
      image_product_4.value = ''
      image_product_5.value = ''
      showProductUploadDiv_1.value = true
      showProductUploadDiv_2.value = true
      showProductUploadDiv_3.value = true

      // 把bs modal強制取得焦點關掉，避免EP內input 無法獲得focus
      $('#add-product-modal').modal({ focus: false })
      $('#add-product-modal').modal('show')
      quill.setContents('') //init
    }
    //放棄保存
    unDo = () => {
      storeJson.value = {}
    }
    //店家保存設定
    storeSave = (v) => {
      console.log(v)
      if (member == null) return

      if (typeof v.store_name == 'undefined' || v.store_name == '') {
        alert('商店名稱不可空白')
        return
      }

      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/SaveDealer',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: {
          store_no: member.dealer_acc,
          dealer_status: v.store_checked ? '*' : '',
          dealer_name: v.store_name,
          dealer_address: v.store_address,
          dealer_desc: v.store_desc,
        },
      })
        .then((response) => {
          $.unblockUI()
          if (response.data.success) {
            //image1_path.value = '';
            //showUploadDiv.value = true;
            alert('保存設定成功')
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
    //刪除店家 LOGO
    delLogoImg = () => {
      if (member == null) return

      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/DelLogoImg',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { store_no: member.dealer_acc },
      })
        .then((response) => {
          $.unblockUI()
          if (response.data.success) {
            image1_path.value = ''
            showUploadDiv.value = true
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

    // 需確認功能
    // 刪除商品照
    delProductImg = (_image, _product_id) => {
      if (member == null) return

      console.log(_randomString.value)
      console.log(_product_id)

      if (typeof _product_id == 'undefined') _product_id = 0
      var productIdOrRandom = _product_id == 0 ? _randomString.value : _product_id

      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/DelProductImg',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: {
          store_no: member.dealer_acc,
          product_id: _product_id,
          image: _image,
          productIdOrRandom: productIdOrRandom,
        },
      })
        .then((response) => {
          $.unblockUI()
          if (response.data.success) {
            switch (_image) {
              case 'image_1.jpg':
                image_product_1.value = ''
                showProductUploadDiv_1.value = true
                break
              case 'image_2.jpg':
                image_product_2.value = ''
                break
              case 'image_3.jpg':
                image_product_3.value = ''
                break
              case 'image_4.jpg':
                image_product_4.value = ''
                break
              case 'image_5.jpg':
                image_product_5.value = ''
                break

              default:
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
    //刪除商品
    var __product_id
    delProduct = (_product_id) => {
      __product_id = _product_id
      $('#del_product_modal').modal('show')
    }
    //確認刪除商品
    confirmDelProduct = () => {
      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/DelProduct',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { product_id: __product_id },
      })
        .then((response) => {
          $.unblockUI()
          if (response.data.success) {
            _getProductList()
            alert('已刪除')
            $('#del_product_modal').modal('hide')
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

    //商品存檔
    productSave = (v) => {
      console.log(v)
      if (member == null) return

      if (typeof v.product_name == 'undefined' || v.product_name == '') {
        alert('商品名稱不可空白')
        return
      }

      if (getDisplayLength(v.product_name) > 100) {
        alert('商品名稱太長(100字元,中文/全形/Emoji算2)')
        return
      }

      if (v.product_spec[0].name == '') {
        alert('請填寫規格名稱')
        return
      }

      if (!v.date_s || !v.date_e) {
        alert('請填寫上下架時間')
        return
      }

      if (new Date(v.date_e) < new Date(v.date_s)) {
        alert('迄日不能小於啟日')
        return
      }

      var notRun_1 = false
      var notRun_2 = false
      v.product_spec.forEach((x) => {
        if (hasNextMothPay.value) {
          //有下月付 就可以150000以上
          if (x.cash > 150000) notRun_1 = true
        } else {
          if (x.cash < 800 || x.cash > 150000) notRun_2 = true
        }
      })
      if (notRun_1) {
        alert('銷售金額限制不可大於150,000元(店家未設定下月付)')
        return
      }
      if (notRun_2) {
        alert('銷售金額限制800~150,000元')
        return
      }

      //var _product_id;
      var _product_id = typeof v.product_id == 'undefined' ? 0 : v.product_id

      var productIdOrRandom = _product_id == 0 ? _randomString.value : v.product_id.toString()

      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/SaveProduct',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        data: {
          product_id: _product_id,
          product_status: v.product_status ? '*' : '',
          product_name: v.product_name,
          date_s: v.date_s,
          date_e: v.date_e,
          store_no: member.dealer_acc,
          productIdOrRandom: productIdOrRandom,
          product_specList: v.product_spec,
          product_desc: JSON.stringify(quill.getContents()),
          product_class: JSON.stringify(v.product_class),
          cate: v.cate, // TODO: 待後端對接「商城分類」欄位(目前分類資料來源為 fakeCategoryTreeData.json)
        },
      })
        .then((response) => {
          $.unblockUI()
          if (response.data.success) {
            $('#add-product-modal').modal('hide')
            alert('建立/保存成功')
            //console.log(currentPage.value);
            setPage(currentPage.value)
            //_getProductList();
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

    _getDealer = () => {
      if (member == null) {
        //window.location.href = '../Home/Index';
        return
      }
      //console.log(member);

      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/GetDealer',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: {},
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          initQuill()
          if (response.data.success) {
            //console.log(response.data.value);
            hasNextMothPay.value = response.data.value.hasNextMothPay
            //image has value
            if (typeof response.data.value != 'undefined') {
              storeJson.value = response.data.value
              if (storeJson.value.store_imagebase64 != '') {
                image1_path.value = storeJson.value.store_imagebase64
                showUploadDiv.value = false
              }
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

    // ------ API ------
    const _getProductListUrl = '/api/DealerProduct/GetProductListForDealer' // 用於初次載入 || 換頁 || 分類篩選 || 上下架篩選 || 搜尋

    // ------------ 資料變數 ------------
    const productJson = ref({
      cate: { mainCategoryId: null, subCategoryId: null, leafCategoryId: null },
    })
    const productListJson = ref([])
    const totalCount = ref(0)
    const product_class_listJson = ref([])
    const dealerAvailableCategories = ref([]) // 經銷商可用的分類
    const shortcutList = ref([])
    const draftDefaultId = ref(null) // 哪一組快捷是預設
    const committedDefaultId = ref(draftDefaultId.value != null ? draftDefaultId.value : null)

    _getProductList = async () => {
      if (member == null) return
      blockUI()

      try {
        // 同時打四支api，分別取得 : 1.商品  2.店家分類(非dudu分類)  3.權限篩選過的分類樹  4.取得商品常用分類(快捷鍵)
        const [resA, resB, resC, resD] = await Promise.all([
          axios.post(_getProductListUrl, null, {
            headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
            params: { store_no: member.store_no, page: currentPage.value, pageSize: perpage.value },
          }),
          axios.post('/api/DealerProduct/GetProductClassListByMemberId', null, {
            headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
            params: { member_id: member.id },
          }),
          axios.get('/api/Dealer/GetDealerProductCategory', {
            params: { store_no: member.store_no },
          }),
          axios.get('/api/Dealer/GetDealerCategoryShortcuts', {
            params: { store_no: member.store_no },
          }),
        ])

        console.log(resA.data)
        console.log(resB.data)
        console.log(resC.data)
        console.log(resD.data)

        // 取得商品資料
        if (resA.data) {
          productListJson.value = resA.data.ProductList || [] // 預防後端回傳null導致crash
          totalCount.value = resA.data.TotalCount || 0
        }
        // 取得店家分類(非dudu分類)
        if (resB.data.success) {
          product_class_listJson.value = resB.data.value
        }

        // 取得權限篩選過的分類樹
        if (resC.data) {
          dealerAvailableCategories.value = resC.data
        }

        // 取得商品常用分類
        if (resD.data) {
          shortcutList.value = resD.data
          const defaultItem = shortcutList.value.find((item) => item.isDefault === true)
          if (defaultItem) {
            draftDefaultId.value = defaultItem.categoryId //草稿用
          }
        }
      } catch (error) {
        console.log(error)
      } finally {
        $.unblockUI()
      }
    }

    // -------- 時間格式工具:
    // 把單一日期(字串或Date)格式化；遇到空值/後端 0001、9999 sentinel 回空字串
    const _formatDate = (d) => {
      if (!d) return ''
      const date = new Date(d)
      if (isNaN(date.getTime())) return '' // getTime()正常為毫秒
      const year = date.getFullYear()
      if (year <= 1 || year >= 9999) return '' // 過濾 DateTime.MinValue / MaxValue (資料庫好像欄位為空時會自動填入 0001、9999)
      return formatDate(date)
    }

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0') // 若只有一位數補0
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // 把起訖兩個日期轉成範圍字串
    const formatDateRange = (start, end) => {
      const s = _formatDate(start)
      const e = _formatDate(end)
      if (!s && !e) return '—' // 起訖都沒有
      return `${s || '不限'} ~ ${e || '不限'}`
    }

    // 分類篩選時
    const sel_product_class_list = (_sel_class_name) => {
      //console.log(_sel_class_name);
      if (_sel_class_name == '') return

      currentPage.value = 1
      sel_up_down.value = '' // 清掉上下架 dropdown
      keep_up_down_value.value = '' // 清掉上下架篩選狀態
      query_value.value = '' //清掉搜尋

      if (_sel_class_name == 'all') {
        select_mode.value = 'init'
        keep_class_name.value = ''
        //pageStart.value = 0; pageEnd.value = 0;
        _getProductList()
        return
      }

      keep_class_name.value = _sel_class_name
      select_mode.value = 'class'
      _getClassForPage()

      // 原api : QueryProductClassForDealer
    }

    const _getClassForPage = () => {
      if (member == null) return

      blockUI()
      axios({
        method: 'post',
        url: _getProductListUrl,
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: {
          store_no: member.store_no,
          class_name: keep_class_name.value,
          page: currentPage.value,
          pageSize: perpage.value,
        },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data) {
            productListJson.value = response.data.ProductList || []
            totalCount.value = response.data.TotalCount || 0
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

    const sel_up_down_class_list = (_sel_up_down) => {
      //console.log(_sel_up_down);
      if (_sel_up_down == '') return

      currentPage.value = 1
      sel_class_name.value = '' // 清掉模板分類篩選
      keep_class_name.value = '' // 清掉分類篩選狀態
      query_value.value = '' // 清掉搜尋關鍵字

      if (_sel_up_down == 'all') {
        select_mode.value = 'init'
        _getListForPage()
        return
      }

      keep_up_down_value.value = _sel_up_down
      select_mode.value = 'updown'
      _getUpDownForPage()
    }

    // 上下架篩選
    const _getUpDownForPage = () => {
      if (member == null) return

      blockUI()
      axios({
        method: 'post',
        url: _getProductListUrl,
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: {
          store_no: member.store_no,
          page: currentPage.value,
          pageSize: perpage.value,
          product_status: keep_up_down_value.value === 'up',
        },
      })
        .then((response) => {
          $.unblockUI()
          //console.log(response.data);
          if (response.data) {
            productListJson.value = response.data.ProductList || []
            totalCount.value = response.data.TotalCount || 0
            //console.log(productListJson.value)
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

    // 負責初始化狀態後再呼叫api
    const query = (_query_value) => {
      // 拆開原因 : 模板按搜尋時，currentpage需init；切換頁面時則不需init
      currentPage.value = 1
      keep_class_name.value = '' // 清空分類篩選
      sel_class_name.value = ''
      sel_up_down.value = '' // 清空上下架篩選
      keep_up_down_value.value = ''
      keep_query_value.value = _query_value // 記錄確認的搜尋值

      //若搜尋為空值，則顯示全部
      if (_query_value == '') {
        select_mode.value = 'init'
        _getProductList()
        return
      }

      select_mode.value = 'query' // 無論發送api成功或失敗，已正確紀錄當前狀態
      _getQueryResultForPage()
    }

    const _getQueryResultForPage = () => {
      if (member == null) return

      blockUI()
      axios({
        method: 'post',
        url: _getProductListUrl,
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: {
          store_no: member.store_no,
          query_value: keep_query_value.value,
          page: currentPage.value,
          pageSize: perpage.value,
        },
      })
        .then((response) => {
          $.unblockUI()
          //console.log(response.data);
          if (response.data) {
            productListJson.value = response.data.ProductList
            totalCount.value = response.data.TotalCount
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

    const initQuill = () => {
      const normalizeVideoSize = (input, allowPercent) => {
        if (!input) return ''
        const value = input.toString().trim()
        if (value === '') return ''
        if (/^\d+$/.test(value)) return value
        if (/^\d+px$/.test(value)) return value.replace('px', '')
        if (allowPercent && /^\d+%$/.test(value)) return value
        return ''
      }

      const applyVideoSize = (videoIndex, widthInput, heightInput) => {
        const width = normalizeVideoSize(widthInput, true)
        const height = normalizeVideoSize(heightInput, false)

        if (width !== '') quill.formatText(videoIndex, 1, 'width', width, 'user')
        if (height !== '') quill.formatText(videoIndex, 1, 'height', height, 'user')
      }

      const toEmbedVideoUrl = (rawUrl) => {
        const value = (rawUrl || '').toString().trim()
        if (value === '') return ''
        try {
          const url = new URL(value)
          const host = url.hostname.replace(/^www\./i, '').toLowerCase()
          let videoId = ''

          if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (url.pathname === '/watch') {
              videoId = url.searchParams.get('v') || ''
            } else if (url.pathname.indexOf('/shorts/') === 0) {
              videoId = url.pathname.split('/shorts/')[1].split('/')[0]
            } else if (url.pathname.indexOf('/embed/') === 0) {
              videoId = url.pathname.split('/embed/')[1].split('/')[0]
            }
          } else if (host === 'youtu.be') {
            videoId = url.pathname.replace(/^\/+/, '').split('/')[0]
          }

          if (videoId) return 'https://www.youtube.com/embed/' + videoId
        } catch (e) {}
        return value
      }

      var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        ['link', 'video'],
        ['blockquote', 'code-block'],

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
        [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
        [{ direction: 'rtl' }], // text direction

        [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'], // remove formatting button
      ]

      quill = new Quill('#editor', {
        //debug: 'info',
        modules: {
          imageResize: {
            //Add
            displayStyles: {
              //Add
              backgroundColor: 'black',
              border: 'none',
              color: 'white',
            },
            modules: ['Resize', 'DisplaySize', 'Toolbar'], //Add
          },
          toolbar: toolbarOptions,
        },
        theme: 'snow',
        placeholder: '5000字內容...',
        //readOnly: true,
        handlers: {
          image: function () {
            //alert(12);
            document.getElementById('getFile').click()
          },
          imageResize: {},
        },
      })

      const toolbar = quill.getModule('toolbar')
      if (toolbar) {
        toolbar.addHandler('video', function () {
          const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 }
          const inputUrl = prompt('請輸入 YouTube 影片網址')
          if (!inputUrl) return
          const embedUrl = toEmbedVideoUrl(inputUrl)
          if (!embedUrl) return

          const widthInput = prompt('請輸入影片寬度（例如：560 或 100%）', '560')
          const heightInput = prompt('請輸入影片高度（例如：315）', '315')

          quill.insertEmbed(range.index, 'video', embedUrl, 'user')
          quill.setSelection(range.index + 1, 0, 'silent')

          applyVideoSize(range.index, widthInput, heightInput)
        })
      }
    }

    //編輯商品
    const showEditProduct = (v) => {
      _randomString.value = '' //init
      console.log(v)
      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/GetProduct',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { product_id: v.Id },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data.success) {
            $('#add-product-modal').modal({ focus: false })
            $('#add-product-modal').modal('show')
            productJson.value = response.data.product
            // 避免後端沒回傳cate 導致 undefined)
            if (!productJson.value.cate)
              productJson.value.cate = {
                mainCategoryId: null,
                subCategoryId: null,
                leafCategoryId: null,
              }
            //quill
            if (productJson.value.product_desc !== null)
              quill.setContents(JSON.parse(productJson.value.product_desc))
            else quill.setContents('') //init

            //console.log(productJson.value.product_desc);
            //show image
            image_product_1.value = productJson.value.product_imagelistbase64[0]
            image_product_2.value = productJson.value.product_imagelistbase64[1]
            image_product_3.value = productJson.value.product_imagelistbase64[2]
            image_product_4.value = productJson.value.product_imagelistbase64[3]
            image_product_5.value = productJson.value.product_imagelistbase64[4]
            //check show upload image
            if (image_product_1.value != '') showProductUploadDiv_1.value = false
            else showProductUploadDiv_1.value = true

            if (
              image_product_2.value == '' ||
              image_product_3.value == '' ||
              image_product_4.value == '' ||
              image_product_5.value == ''
            ) {
            } else {
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

    // 全店置頂(選中的 sort=1,全店其他商品 sort+1)
    const toFirstUp = (_product_id) => {
      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/ToFirstUp',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { product_id: _product_id },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data.success) {
            currentPage.value = 1 // 置頂後該商品 sort=1 會在第1頁,跳回第1頁才看得到
            _getListForPage() // 重新 render productListJson
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

    const addProductSpec = () => {
      productJson.value.product_spec.push({
        name: '',
        qty: 0,
        cash: 0,
        car_checked: false,
        home_checked: true,
      })
      console.log(productJson.value.product_spec)
    }

    const delProductSpec = (_index) => {
      productJson.value.product_spec.splice(_index, 1)
    }

    onMounted(() => {
      const authorityMall = member.authoritys.find((a) => a.authority === '商品管理')

      if (member == null) {
        alert('請先登入')
        window.location.href = '../Home/Index'
        return
      }

      if (!authorityMall.isCheck) {
        alert('請先開通商城')
        window.location.href = '../Home/Index'
        return
      }

      image1_path.value = ''
      image_product_1.value = ''
      image_product_2.value = ''
      image_product_3.value = ''
      image_product_4.value = ''
      image_product_5.value = ''
      showUploadDiv.value = true
      showProductUploadDiv_1.value = true
      showProductUploadDiv_1.value = true

      _getDealer()

      // 依據 tab 切換呼叫的function
      $('#top-nav').on('shown.bs.tab', function (e, ui) {
        //console.log(e.target.id);
        switch (e.target.id) {
          case 'productList-tab': // 商品列表
            sel_class_name.value = ''
            sel_up_down.value = ''
            keep_class_name.value = ''
            select_mode.value = 'init'
            _getProductList()
            break
          case 'productClass-tab': // 分類管理
            _getProductClass()
            break
          case 'delivery-tab': // 運費設定
            _getShippingFeeRule()
            break

          default:
        }
      })

      return
    })

    const setProductStatus = (_v) => {
      // 分類被停用(-2) || 商品非販售期間(-1) 不可上架
      // 因key為非正整數，所以必須用[]包起來
      const BLOCKED_STATUS = {
        [-2]: '此商品分類超出您的店家權限，請重新選擇分類。',
        [-1]: '此商品目前不在販售期間。',
      }
      if (_v.IsEnable === true && BLOCKED_STATUS[_v.ProductStatus]) {
        _v.IsEnable = false // 關掉switch
        ElementPlus.ElMessageBox.alert(BLOCKED_STATUS[_v.ProductStatus], '上架失敗', {
          type: 'error',
          confirmButtonText: '確定',
          center: true,
          showClose: false,
        })
        return
      }

      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/SetProductStatus',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { product_id: _v.Id, product_status: _v.IsEnable },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data.success) {
          } else {
            // 1.

            // 2. 商品非上架期間
            alert(response.data.msg)
            console.log(response.data.msg)
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

    const _getProductClass = () => {
      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/GetProductClassList',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { store_no: member.store_no },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data.success) {
            productClassJson.value = response.data.value
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

    const addClass = (className) => {
      console.log(className)
      if (className == '' || typeof className == 'undefined') return

      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/AddProductClass',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: {
          store_no: member.store_no,
          class_name: className,
        },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data.success) {
            productClassJson.value = response.data.value
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

    const editClass = (_v) => {
      console.log(_v)
      productClass.value = _v
      $('#product_class_modal').modal('show')
    }

    const confirmEditProductClass = (productClassName) => {
      console.log(productClassName)
      console.log(productClass.value)
      if (productClassName == '' || typeof productClassName == 'undefined') return

      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/EditProductClass',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: {
          product_class_id: productClass.value.product_class_id,
          class_name: productClassName,
        },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data.success) {
            $('#product_class_modal').modal('hide')
            productClassJson.value = response.data.value
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

    const delClass = (_v) => {
      console.log(_v)
      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/DelProductClass',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { product_class_id: _v.product_class_id },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data.success) {
            productClassJson.value = response.data.value
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

    const selClass = (_v) => {
      console.log(_v)
      _v.ClassChecked = _v.ClassChecked ? false : true
    }

    // ----運費設定------------------------------
    const deliveryForm = reactive({
      isHomeDelivery: null, // 宅配
      isPickUp: null, // 自取
      homeDeliveryFee: '',
      freeShippingThreshold: '',
    })

    watch(
      () => deliveryForm.isHomeDelivery,
      (newVal) => {
        if (!newVal) {
          deliveryForm.homeDeliveryFee = 0
          deliveryForm.freeShippingThreshold = 0
        }
      },
    )

    const saveDeliverySettings = () => {
      if (member == null) return

      // 通用的驗證函式
      const validateField = (val, label) => {
        // 檢查是否為空
        if (val === '' || val === null || val === undefined) {
          alert(`${label}不可為空`)
          return false
        }

        // 檢查是否為 >0 的正整數
        if (!/^[1-9]\d*$/.test(String(val))) {
          alert(`${label}請輸入正整數`)
          return false
        }
        return true
      }

      // 依序驗證，只要其中一個失敗就中斷執行
      if (deliveryForm.isHomeDelivery) {
        if (!validateField(deliveryForm.homeDeliveryFee, '宅配運費')) return
        if (!validateField(deliveryForm.freeShippingThreshold, '免運門檻')) return
      }

      // 打API
      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/UpdateShippingFeeRule',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        data: {
          fee: deliveryForm.homeDeliveryFee,
          store_No: member.dealer_acc,
          freeShippingMinAmount: deliveryForm.freeShippingThreshold,
          isOuterIsland: false,
          IshomeDelivery: deliveryForm.isHomeDelivery,
          IsPickUp: deliveryForm.isPickUp,
        },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data.isSuccess) {
            //alert("存檔成功")
            ElementPlus.ElMessage({
              message: '已成功存檔',
              type: 'success',
            })
          } else {
            alert(response.data)
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

    const _getShippingFeeRule = () => {
      if (member == null) return
      //console.log(member.dealer_acc)
      // 打API
      blockUI()
      axios({
        method: 'post',
        url: '/api/DealerProduct/GetShippingFeeRule',
        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
        params: { store_no: member.dealer_acc },
      })
        .then((response) => {
          $.unblockUI()
          console.log(response.data)
          if (response.data) {
            Object.assign(deliveryForm, {
              isHomeDelivery: response.data.IshomeDelivery,
              isPickUp: response.data.IsPickUp,
              homeDeliveryFee: response.data.Fee,
              freeShippingThreshold: response.data.FreeShippingMinAmount,
            })
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
      selectedIds.value = checked ? productListJson.value.map((item) => item.Id) : []
    }

    // ------ 批量更新分類 ------
    // 次/子分類選項已改由 <category-cascader> 元件依分類樹自行 computed,不再需要這兩個 ref
    const batchUpdateCateDialogVisible = ref(false)
    const batchUpdCateForm = reactive({
      mainCategoryId: null,
      subCategoryId: null,
      leafCategoryId: null,
    })

    const openBatchUpdCateDialog = () => {
      batchUpdateCateDialogVisible.value = true
      resetBatchUpdCateForm()
      //if (committedDefaultPreset.value) applyPreset(committedDefaultPreset.value, batchUpdCateForm)
    }

    const resetBatchUpdCateForm = () => {
      batchUpdCateForm.mainCategoryId = null
      batchUpdCateForm.subCategoryId = null
      batchUpdCateForm.leafCategoryId = null
    }

    // ------ 快捷鍵設定 ------
    const quickButtons = computed(() =>
      ['A', 'B', 'C']
        .map((letter) => ({
          letter,
          hotkey: shortcutList.value.find((h) => h.Code === letter) || null,
        }))
        .filter((q) => q.hotkey),
    )

    // 計算預設勾選的那組 preset(整包物件)
    //const committedDefaultPreset = computed(
    //    () => categoryPresets.value.find((p) => p.id === committedDefaultId.value) || null,
    //)

    // 正在編輯的草稿
    const hotkeyDialogVisible = ref(false)
    const hotkeyDraft = ref([])
    let presetSeq = 0

    // ---- 分類查找工具 ----
    const findMainCate = (mainId) =>
      dealerAvailableCategories.value.find((c) => c.CategoryId === mainId)
    const findSubCate = (mainId, subId) => {
      const main = findMainCate(mainId)
      return main && main.Children ? main.Children.find((c) => c.CategoryId === subId) : undefined
    }

    // 各列的次/子分類選項（依該列已選主/次分類動態取得）
    const getHotkeySubList = (key) => {
      const main = findMainCate(key.mainCategoryId)
      return main && main.Children ? main.Children : []
    }
    const getHotkeyLeafList = (key) => {
      const sub = findSubCate(key.mainCategoryId, key.secoundCategoryId)
      return sub && sub.Children ? sub.Children : []
    }

    // ---- 開啟 / 列操作 ----
    const handleHotkeySetupClick = () => {
      hotkeyDraft.value = JSON.parse(JSON.stringify(shortcutList.value)) // 把正式資料複製一份到草稿
      if (hotkeyDraft.value.length === 0) addPreset()

      console.log(hotkeyDraft.value)

      hotkeyDialogVisible.value = true
    }

    const addPreset = () => {
      hotkeyDraft.value.push({
        id: ++presetSeq, // 前端儲存
        isDefault: false,
        name: '',
        mainCategoryId: null, // 主
        secoundCategoryId: null, // 次 (配合後端的欄位)
        categoryId: null, // 子
        code: '', // '' | 'A' | 'B' | 'C'
      })
    }

    const removePreset = (id) => {
      hotkeyDraft.value = hotkeyDraft.value.filter((key) => key.categoryId !== id)
      if (hotkeyDraft.value.length === 0) addPreset()
      if (draftDefaultId.value === id) draftDefaultId.value = null
    }

    // 該列主分類變更 → 清掉次/子分類
    const onHotkeyMainChange = (key) => {
      key.secoundCategoryId = null
      key.categoryId = null
    }
    // 該列次分類變更 → 清掉子分類
    const onHotkeySubChange = (key) => {
      key.categoryId = null
    }

    // 快捷碼為單選不重複：選了已被別列使用的字母，先清掉別列
    const onPresetHotkeyChange = (key) => {
      if (!key.code) return
      hotkeyDraft.value.forEach((h) => {
        if (h.categoryId !== key.categoryId && h.code === key.code) h.hotkey = ''
      })
    }

    // ---- 儲存 / 取消 ----
    const saveHotkeySettings = () => {
      shortcutList.value = JSON.parse(JSON.stringify(hotkeyDraft.value)) // 把草稿複製到正式資料
      committedDefaultId.value = draftDefaultId.value

      const payload = shortcutList.value.map((item) => {
        const { id, ...rest } = item // 把 id 拿出來，其餘屬性留在 rest 裡面
        return rest // 只回傳不含 id 的新物件
      })

      console.log(shortcutList.value)
      console.log(payload)
      return
      blockUI()
      axios({
        method: 'post',
        url: '/api/Dealer/UpsertDealerCategoryShortcuts',
        headers: { 'Content-Type': 'application/json' },
        params: { store_no: member.store_no },
        data: payload,
      })
        .then((response) => {
          $.unblockUI()

          if (response.data === true) {
            ElementPlus.ElMessage({
              message: '已成功存檔',
              type: 'success',
            })
            hotkeyDialogVisible.value = false
          } else {
            ElementPlus.ElMessage({
              message: '存檔失敗，請重試',
              type: 'error',
            })
          }
        })
        .catch((error) => {
          $.unblockUI()
          console.log(error)
        })
        .finally(() => {
          console.log('完成')
        })
    }

    const cancelHotkeySettings = () => {
      hotkeyDialogVisible.value = false
    }

    // 點快捷按鈕 → 帶入指定表單(批次:batchUpdCateForm;新增商品:productJson.cate)
    // 次/子選項由 <category-cascader> 依新的 id 自動 computed,這裡只需設定三層 id
    const applyPreset = (preset, target) => {
      if (!preset || !target) return
      target.mainCategoryId = preset.mainCategoryId
      target.subCategoryId = preset.subCategoryId
      target.leafCategoryId = preset.leafCategoryId
    }

    //----------- 分類停用 分類隱藏 ---------------
    const categoryClass = (v) => {
      const hasCategory = v.CategoryColumn.length > 0
      return {
        'dudu-category': hasCategory,
        'dudu-category-disabled': hasCategory && v.ProductStatus === -2, // 分類停用
        'dudu-category-hidden': hasCategory && v.ProductStatus === 2, // 分類隱藏
      }
    }

    return {
      perpage,
      currentPage,
      setPage,
      totalPage,
      pageStart,
      pageEnd,
      disabled_prev,
      disabled_next,
      displayPages,

      image1_path,
      image_product_1,
      image_product_2,
      image_product_3,
      image_product_4,
      image_product_5,
      file_1,
      file_product_1,
      file_product_2,
      file_product_3,
      file_product_4,
      file_product_5,
      handleFileUpload,
      addProduct,
      storeJson,
      productJson,
      productListJson,
      unDo,
      storeSave,
      delLogoImg,
      showUploadDiv,
      showProductUploadDiv_1,
      showProductUploadDiv_2,
      showProductUploadDiv_3,
      confirmDelProduct,
      delProductImg,
      productSave,
      showEditProduct,
      delProduct,
      addProductSpec,
      delProductSpec,
      setProductStatus,
      addClass,
      editClass,
      delClass,
      productClass,
      productClassJson,
      confirmEditProductClass,
      selClass,
      product_class_listJson,
      sel_class_name,
      sel_product_class_list,
      sel_up_down_class_list,
      sel_up_down,
      query,
      toFirstUp,
      query_value,
      select_mode,
      totalCount,

      // 運費設定:
      saveDeliverySettings,
      deliveryForm,

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

      // 快捷鍵設定:
      hotkeyDialogVisible,
      hotkeyDraft,
      draftDefaultId,
      getHotkeySubList,
      getHotkeyLeafList,
      handleHotkeySetupClick,
      addPreset,
      removePreset,
      onHotkeyMainChange,
      onHotkeySubChange,
      onPresetHotkeyChange,
      saveHotkeySettings,
      cancelHotkeySettings,
      quickButtons,
      applyPreset,

      // 時間工具:
      formatDateRange,

      // 分類隱藏、分類停用:
      categoryClass,
    }
  },
})

//Vue.createApp(App).mount('#app');

// ====== 商城分類三層樹狀選單 ======
// 給「新增/編輯商品 modal」與「批次更新分類 dialog」共用
const CategoryCascader = {
  name: 'CategoryCascader',
  props: {
    categories: { type: Array, default: () => [] },
    form: {
      type: Object,
      default: () => ({ mainCategoryId: null, subCategoryId: null, leafCategoryId: null }),
    },
    // 資料與 快捷鍵設定dialog 仍由父層管理
    quickButtons: { type: Array, default: () => [] },
    // 在 Bootstrap modal 內須設 false,避免下拉 teleport 到 body 被 modal focus-trap/z-index 擋住
    teleported: { type: Boolean, default: true },
    labelPosition: { type: String, default: 'top' },
    title: { type: String, default: '分類設定' },
  },
  emits: ['open-settings'],
  setup(props, { emit }) {
    const computed = Vue.computed
    const mainNode = computed(
      () => props.categories.find((c) => c.CategoryId === props.form.mainCategoryId) || null,
    )
    const subList = computed(() =>
      mainNode.value && mainNode.value.Children ? mainNode.value.Children : [],
    )
    const subNode = computed(
      () => subList.value.find((c) => c.CategoryId === props.form.subCategoryId) || null,
    )
    const leafList = computed(() =>
      subNode.value && subNode.value.Children ? subNode.value.Children : [],
    )

    // 清空下層
    const onMainChange = () => {
      props.form.subCategoryId = null
      props.form.leafCategoryId = null
    }
    const onSubChange = () => {
      props.form.leafCategoryId = null
    }

    // 套用 preset 三層 id 到自己的 form,次/子選項由上面的 computed 自動帶出
    const applyPreset = (preset) => {
      if (!preset) return
      props.form.mainCategoryId = preset.mainCategoryId
      props.form.subCategoryId = preset.subCategoryId
      props.form.leafCategoryId = preset.leafCategoryId
    }
    const openSettings = () => emit('open-settings')

    return { subList, leafList, onMainChange, onSubChange, applyPreset, openSettings }
  },
  template: `
        <div class="tab-button-wrapper d-flex justify-content-between flex-wrap gap-2">
            <div><i class="fa-solid fa-layer-group me-2"></i> {{title}} </div>
            <div class="tab-button-group d-flex gap-2 flex-wrap">
                <button v-for="q in quickButtons"
                        :key="q.CategoryId"
                        class="tab-btn"
                        type="button"
                        @click="applyPreset(q.hotkey)">
                    <span class="tab-label">{{ q.hotkey.Code }}</span>{{ q.hotkey.Name }}
                </button>
                <button class="tab-btn tab-setting" type="button" @click="openSettings">
                    <i class="fa-solid fa-gear"></i>
                </button>
            </div>
        </div>

        <el-form :model="form" :label-position="labelPosition" class="category-cascader">
            <el-form-item label="主分類" required>
                <el-select v-model="form.mainCategoryId"
                           placeholder="請選擇主分類"
                           :teleported="teleported"
                           @change="onMainChange">
                    <el-option v-for="main in categories"
                               :key="main.CategoryId"
                               :label="main.Name"
                               :value="main.CategoryId" />
                </el-select>
            </el-form-item>

            <el-form-item label="次分類" required>
                <el-select v-model="form.subCategoryId"
                           placeholder="請選擇次分類"
                           :disabled="!form.mainCategoryId"
                           :teleported="teleported"
                           @change="onSubChange">
                    <el-option v-for="sub in subList"
                               :key="sub.CategoryId"
                               :label="sub.Name"
                               :value="sub.CategoryId" />
                </el-select>
            </el-form-item>

            <el-form-item label="子分類" required>
                <el-select v-model="form.leafCategoryId"
                           placeholder="請選擇子分類"
                           :disabled="!form.subCategoryId"
                           :teleported="teleported">
                    <el-option v-for="leaf in leafList"
                               :key="leaf.CategoryId"
                               :label="leaf.Name"
                               :value="leaf.CategoryId" />
                </el-select>
            </el-form-item>
        </el-form>
    `,
}

App.component('category-cascader', CategoryCascader)

App.use(ElementPlus)
App.mount('#app')

$(window).on('load', function () {
  var member = JSON.parse(localStorage.getItem('member'))
  if (member == null || member.login_ok_msg != '*' || member.role != 'dealer') {
    window.location.href = '../Home/Index'
    return
  }
})
