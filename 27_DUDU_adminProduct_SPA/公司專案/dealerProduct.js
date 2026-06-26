const watch = Vue.watch

const App = Vue.createApp({
  setup() {
    const productJson = ref({
      cate: { mainCategoryId: null, subCategoryId: null, leafCategoryId: null },
    })
    const productClassJson = ref([])
    const product_class_listJson = ref([])
    const productClass = ref({})
    const tmp_productListJson = ref([])
    const productListJson = ref([]) // render 資料
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
    const dealerAvailableCategories = ref([]) // 經銷商可用的分類

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
      console.log(productJson.value.product_class)

      image_product_1.value = ''
      image_product_2.value = ''
      image_product_3.value = ''
      image_product_4.value = ''
      image_product_5.value = ''
      showProductUploadDiv_1.value = true
      showProductUploadDiv_2.value = true
      showProductUploadDiv_3.value = true

      $('#add-product-modal').modal('show')
      quill.setContents('') //init
    }

    _getProductList = async () => {
      if (member == null) return
      blockUI()

      try {
        // 同時打兩支api 分別取的商品和分類資料
        const [resA, resB, resC] = await Promise.all([
          axios.post(_getProductListUrl, null, {
            headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
            params: { store_no: member.store_no, page: currentPage.value, pageSize: perpage.value },
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
        if (resA.data) {
          productListJson.value = resA.data.ProductList || [] // 預防後端回傳null導致crash
          totalCount.value = resA.data.TotalCount || 0
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
            $('#add-product-modal').modal('show')
            productJson.value = response.data.product
            // 確保商城分類欄位存在(後端尚未回傳時補預設,避免元件讀取 undefined)
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
      if (committedDefaultPreset.value) applyPreset(committedDefaultPreset.value, batchUpdCateForm)
    }

    const resetBatchUpdCateForm = () => {
      batchUpdCateForm.mainCategoryId = null
      batchUpdCateForm.subCategoryId = null
      batchUpdCateForm.leafCategoryId = null
    }

    // 主/次/子分類的級聯邏輯(清空下層、依樹算選項)已移入 <category-cascader> 元件

    // ------ 快捷鍵設定 ------
    // 已儲存的資料
    // todo : 串API，回傳資料存 categoryPresets
    const presetSettingFromApi = {
      presets: [
        {
          id: 0,
          name: '寵物常用',
          mainCategoryId: 1,
          subCategoryId: 2,
          leafCategoryId: 4,
          hotkey: 'A',
        },
      ],
      defaultPresetId: 0,
    }
    const categoryPresets = ref(presetSettingFromApi.presets)
    const committedDefaultId = ref(
      presetSettingFromApi.defaultPresetId != null ? presetSettingFromApi.defaultPresetId : null,
    )

    // 計算預設勾選的那組 preset(整包物件)
    const committedDefaultPreset = computed(
      () => categoryPresets.value.find((p) => p.id === committedDefaultId.value) || null,
    )

    // 正在編輯的草稿
    const hotkeyDialogVisible = ref(false)
    const presetDraft = ref([])
    const draftDefaultId = ref(null)
    let presetSeq = 0

    // ---- 分類查找工具 ----
    const findMainCate = (mainId) =>
      dealerAvailableCategories.value.find((c) => c.categoryId === mainId)
    const findSubCate = (mainId, subId) => {
      const main = findMainCate(mainId)
      return main && main.children ? main.children.find((c) => c.categoryId === subId) : undefined
    }
    const findLeafCate = (mainId, subId, leafId) => {
      const sub = findSubCate(mainId, subId)
      return sub && sub.children ? sub.children.find((c) => c.categoryId === leafId) : undefined
    }

    // 各列的次/子分類選項（依該列已選主/次分類動態取得）
    const getPresetSubOptions = (p) => {
      const main = findMainCate(p.mainCategoryId)
      return main && main.children ? main.children : []
    }
    const getPresetLeafOptions = (p) => {
      const sub = findSubCate(p.mainCategoryId, p.subCategoryId)
      return sub && sub.children ? sub.children : []
    }

    // ---- 開啟 / 列操作 ----
    const handleHotkeySetupClick = () => {
      // categoryPresets 是「已儲存的常用分類清單」，presetDraft 是「dialog 編輯用的草稿」
      presetDraft.value = JSON.parse(JSON.stringify(categoryPresets.value))
      draftDefaultId.value = committedDefaultId.value
      if (presetDraft.value.length === 0) addPreset()
      hotkeyDialogVisible.value = true
    }

    const addPreset = () => {
      presetDraft.value.push({
        id: ++presetSeq,
        name: '',
        mainCategoryId: null,
        subCategoryId: null,
        leafCategoryId: null,
        hotkey: '', // '' | 'A' | 'B' | 'C'
      })
    }

    const removePreset = (id) => {
      presetDraft.value = presetDraft.value.filter((p) => p.id !== id)
      if (draftDefaultId.value === id) draftDefaultId.value = null
    }

    // 該列主分類變更 → 清掉次/子分類
    const onPresetMainChange = (p) => {
      p.subCategoryId = null
      p.leafCategoryId = null
    }
    // 該列次分類變更 → 清掉子分類
    const onPresetSubChange = (p) => {
      p.leafCategoryId = null
    }

    // 快捷碼為單選不重複：選了已被別列使用的字母，先清掉別列
    const onPresetHotkeyChange = (p) => {
      if (!p.hotkey) return
      presetDraft.value.forEach((o) => {
        if (o.id !== p.id && o.hotkey === p.hotkey) o.hotkey = ''
      })
    }

    // ---- 儲存 / 取消 ----
    const saveHotkeySettings = () => {
      categoryPresets.value = JSON.parse(JSON.stringify(presetDraft.value))
      committedDefaultId.value = draftDefaultId.value
      hotkeyDialogVisible.value = false
    }

    const cancelHotkeySettings = () => {
      hotkeyDialogVisible.value = false
    }

    const quickButtons = computed(() =>
      ['A', 'B', 'C']
        .map((letter) => ({
          letter,
          preset: categoryPresets.value.find((p) => p.hotkey === letter) || null,
        }))
        .filter((q) => q.preset),
    )

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

    //----------- 編輯 新增商品 ---------------

    return {
      perpage,
      currentPage,
      setPage,
      totalPage,
      pageStart,
      pageEnd,
      disabled_prev,
      disabled_next,
      displayPages, //clearSearch,

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
      presetDraft,
      draftDefaultId,
      getPresetSubOptions,
      getPresetLeafOptions,
      handleHotkeySetupClick,
      addPreset,
      removePreset,
      onPresetMainChange,
      onPresetSubChange,
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
    // { mainCategoryId, subCategoryId, leafCategoryId }
    form: {
      type: Object,
      default: () => ({ mainCategoryId: null, subCategoryId: null, leafCategoryId: null }),
    },
    // 在 Bootstrap modal 內須設 false,避免下拉 teleport 到 body 被 modal focus-trap/z-index 擋住
    teleported: { type: Boolean, default: true },
    labelPosition: { type: String, default: 'top' },
  },
  setup(props) {
    const computed = Vue.computed
    const mainNode = computed(
      () => props.categories.find((c) => c.categoryId === props.form.mainCategoryId) || null,
    )
    const subList = computed(() =>
      mainNode.value && mainNode.value.children ? mainNode.value.children : [],
    )
    const subNode = computed(
      () => subList.value.find((c) => c.categoryId === props.form.subCategoryId) || null,
    )
    const leafList = computed(() =>
      subNode.value && subNode.value.children ? subNode.value.children : [],
    )

    // v-model 已寫入該層的值,change 只負責清空下層
    const onMainChange = () => {
      props.form.subCategoryId = null
      props.form.leafCategoryId = null
    }
    const onSubChange = () => {
      props.form.leafCategoryId = null
    }

    return { subList, leafList, onMainChange, onSubChange }
  },
  template: `
        <el-form :model="form" :label-position="labelPosition" class="category-cascader">
            <el-form-item label="主分類" required>
                <el-select v-model="form.mainCategoryId"
                           placeholder="請選擇主分類"
                           :teleported="teleported"
                           @change="onMainChange">
                    <el-option v-for="main in categories"
                               :key="main.categoryId"
                               :label="main.name"
                               :value="main.categoryId" />
                </el-select>
            </el-form-item>

            <el-form-item label="次分類" required>
                <el-select v-model="form.subCategoryId"
                           placeholder="請選擇次分類"
                           :disabled="!form.mainCategoryId"
                           :teleported="teleported"
                           @change="onSubChange">
                    <el-option v-for="sub in subList"
                               :key="sub.categoryId"
                               :label="sub.name"
                               :value="sub.categoryId" />
                </el-select>
            </el-form-item>

            <el-form-item label="子分類" required>
                <el-select v-model="form.leafCategoryId"
                           placeholder="請選擇子分類"
                           :disabled="!form.subCategoryId"
                           :teleported="teleported">
                    <el-option v-for="leaf in leafList"
                               :key="leaf.categoryId"
                               :label="leaf.name"
                               :value="leaf.categoryId" />
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
