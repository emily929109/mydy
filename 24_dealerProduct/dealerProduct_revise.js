const { ref, computed, onMounted } = Vue;

// ── Mock 資料（替代後端 API）─────────────────────────────────────────────
// 共 25 筆，perpage=8 → 會產生 4 頁，可測試頁碼顯示邏輯
const MOCK_CLASSES = [
  { class_name: "食品" },
  { class_name: "飲料" },
  { class_name: "生活用品" },
];

const MOCK_PRODUCTS = (() => {
  const classNames = MOCK_CLASSES.map((c) => c.class_name);
  return Array.from({ length: 25 }, (_, i) => ({
    product_id: i + 1,
    product_status: i % 4 !== 0, // 大部分上架
    product_imagebase64: `https://picsum.photos/seed/p${i + 1}/110/110`,
    product_name: `測試商品 ${String(i + 1).padStart(2, "0")}`,
    product_class: classNames.map((name, j) => ({
      ClassName: name,
      ClassChecked: (i + j) % 3 === 0,
    })),
    date_s: "2025/01/01",
    date_e: "2026/12/31",
  }));
})();
console.log("MOCK_PRODUCTS:", MOCK_PRODUCTS);

// 產出的內容長這樣：
// [
//   {
//     product_id: 1,
//     product_name: "測試商品 01",
//     product_class: [
//       { ClassName: "肥貓", ClassChecked: true },
//       { ClassName: "領袖貓", ClassChecked: false },
//       // ...
//     ],
//     // ... 其他屬性
//   },
//   // ... 共 25 筆
// ]
// ─────────────────────────────────────────────────────────────────────────

const App = {
  setup() {
    //---- 分頁變數 -----------------------------------------------------------
    const perpage = ref(8); // 一頁幾筆
    const currentPage = ref(1);
    const totalCount = ref(0); // 商品總數，用來計算 totalPage

    const totalPage = computed(() => {
      const total_page = Math.ceil(totalCount.value / perpage.value);
      return total_page;
    });
    // 改成 computed，自動跟著 currentPage 和 totalPage 變
    const disabled_prev = computed(() => currentPage.value <= 1);
    const disabled_next = computed(() => currentPage.value >= totalPage.value);

    const pageStart = computed(() => (currentPage.value - 1) * perpage.value);
    const pageEnd = computed(() => currentPage.value * perpage.value);

    const query_value = ref("");

    // 換頁控制
    const setPage = (page) => {
      if (page === "..." || page < 1 || page > totalPage.value) return;

      currentPage.value = page;
      // 換頁後依當前篩選模式決定要怎麼取資料
      switch (select_mode.value) {
        case "init":
          _getListForPage(); // 顯示全部商品，換頁取當頁資料
          break;
        case "class":
          _getClassForPage(); // 依分類篩選，換頁取當頁資料（模擬後端分頁）
          break;
        case "updown":
          _getUpDownForPage(); // 依上下架篩選，換頁取當頁資料
          break;
        default:
      }
    };

    // 計算顯示頁碼（含 "..."）
    const displayPages = computed(() => {
      const total = totalPage.value;
      const current = currentPage.value;
      const delta = 2; // 當前頁前後各顯示幾頁
      const range = [];
      const rangeWithDots = [];
      let last = 0;

      for (let i = 1; i <= total; i++) {
        if (
          i === 1 ||
          i === total ||
          (i >= current - delta && i <= current + delta)
        ) {
          range.push(i);
        }
      }

      for (let i of range) {
        if (last) {
          if (i - last === 2) rangeWithDots.push(last + 1);
          else if (i - last !== 1) rangeWithDots.push("...");
        }
        rangeWithDots.push(i);
        last = i;
      }
      return rangeWithDots;
    });

    //---- 資料變數 -----------------------------------------------------------
    const storeJson = ref({
      store_no: "",
      store_checked: false,
      dealer_name: "",
      store_name: "",
      store_address: "",
      store_desc: "",
    });
    const productJson = ref({});
    const productClassJson = ref([]);
    const product_class_listJson = ref([]);
    const productClass = ref({});
    const tmp_productListJson = ref([]); // 篩選用暫存（上下架篩選從這裡 filter）
    const all_productListJson = ref([]); // 初始載入全量資料（分類篩選從這裡 filter）
    const productListJson = ref([]); // 表格顯示的當頁資料
    const sel_class_name = ref("");
    const sel_up_down = ref("");
    const showUploadDiv = ref(true);
    const showProductUploadDiv_1 = ref(true);
    const showProductUploadDiv_2 = ref(true);
    const showProductUploadDiv_3 = ref(true);
    const select_mode = ref("init"); // 'init' | 'class' | 'updown' | 'query' 取代 keep_class_id，紀錄目前的篩選模式
    const keep_class_name = ref("");
    const keep_up_down_value = ref(""); // 記錄上下架篩選值

    //---- 換頁時的資料取得（模擬後端 API）-------------------------------------

    // select_mode === 'init'：顯示全部商品，換頁時取當頁資料
    _getListForPage = () => {
      const start = (currentPage.value - 1) * perpage.value;
      const end = currentPage.value * perpage.value;
      productListJson.value = MOCK_PRODUCTS.slice(start, end);
      tmp_productListJson.value = productListJson.value;
      console.log(
        `_getListForPage: 第 ${currentPage.value} 頁，index ${start}~${end - 1}`,
      );
    };

    // select_mode === 'class'：依分類篩選並換頁（模擬後端帶分類+分頁參數）
    _getClassForPage = () => {
      const filtered = MOCK_PRODUCTS.filter((item) => {
        const matched = item.product_class.find(
          (c) => c.ClassName === keep_class_name.value,
        );
        return matched && matched.ClassChecked === true;
      });
      const start = (currentPage.value - 1) * perpage.value;
      const end = currentPage.value * perpage.value;
      productListJson.value = filtered.slice(start, end);
      totalCount.value = filtered.length;
      tmp_productListJson.value = productListJson.value;
    };

    //---- 初始載入（模擬進入商品列表 tab）------------------------------------
    _getProductList = () => {
      totalCount.value = MOCK_PRODUCTS.length;
      all_productListJson.value = [...MOCK_PRODUCTS]; // 本地分類篩選用
      tmp_productListJson.value = [...MOCK_PRODUCTS]; // 本地上下架篩選用
      productListJson.value = MOCK_PRODUCTS.slice(0, perpage.value);
      product_class_listJson.value = [...MOCK_CLASSES];
      console.log(product_class_listJson.value);
      console.log(
        `_getProductList: 共 ${totalCount.value} 筆，totalPage=${totalPage.value}`,
      );
    };

    //---- 篩選邏輯（本地 filter）--------------------------------------------

    // 分類篩選（獨立模式：選分類時清掉上下架）
    sel_product_class_list = (_sel_class_name) => {
      if (_sel_class_name === "") return;

      currentPage.value = 1;
      sel_up_down.value = ""; // 清掉上下架 dropdown
      keep_up_down_value.value = ""; // 清掉上下架篩選狀態

      if (_sel_class_name === "all") {
        select_mode.value = "init";
        keep_class_name.value = "";
        totalCount.value = MOCK_PRODUCTS.length;
        _getListForPage();
        return;
      }

      keep_class_name.value = _sel_class_name;
      select_mode.value = "class";
      _getClassForPage();
    };

    // 上下架篩選（獨立模式：選上下架時清掉分類）
    sel_up_down_class_list = (_sel_up_down) => {
      if (_sel_up_down === "") return;

      currentPage.value = 1;
      sel_class_name.value = ""; // 清掉分類 dropdown
      keep_class_name.value = ""; // 清掉分類篩選狀態

      query_value.value = ""; // 清掉搜尋關鍵字

      if (_sel_up_down === "all") {
        select_mode.value = "init";
        keep_up_down_value.value = "";
        totalCount.value = MOCK_PRODUCTS.length;
        _getListForPage();
        return;
      }

      keep_up_down_value.value = _sel_up_down;
      select_mode.value = "updown";
      _getUpDownForPage();
    };

    // 上下架篩選（本地 filter）
    _getUpDownForPage = () => {
      const filtered = MOCK_PRODUCTS.filter((x) =>
        keep_up_down_value.value === "up"
          ? x.product_status
          : !x.product_status,
      );
      const start = (currentPage.value - 1) * perpage.value;
      productListJson.value = filtered.slice(start, start + perpage.value);
      totalCount.value = filtered.length;
    };

    // 關鍵字搜尋（本地 filter）
    query = (_query_value) => {
      currentPage.value = 1;

      // 清空分類篩選
      select_mode.value = "query";
      keep_class_name.value = "";

      // 清空上下架篩選
      sel_up_down.value = "";
      keep_up_down_value.value = "";

      if (_query_value === "") {
        totalCount.value = MOCK_PRODUCTS.length;
        productListJson.value = MOCK_PRODUCTS.slice(0, perpage.value);
        return;
      }
      const filtered = MOCK_PRODUCTS.filter((p) =>
        p.product_name.includes(_query_value),
      );
      const start = (currentPage.value - 1) * perpage.value;
      productListJson.value = filtered.slice(start, start + perpage.value);
      totalCount.value = filtered.length;
      //   tmp_productListJson.value = filtered;
    };

    // 上下架切換
    setProductStatus = (_v) => {
      // v-model 已在 UI 上切換，這裡模擬通知後端
      console.log(
        `setProductStatus: ID=${_v.product_id}，新狀態=${!_v.product_status}`,
      );
    };

    //---- Stub 函式（原本呼叫後端，本地測試僅示意）--------------------------
    unDo = () => {};
    storeSave = () => alert("(mock) 保存設定");
    delLogoImg = () => {};
    addProduct = () => alert("(mock) 新增商品");
    showEditProduct = (v) => alert(`(mock) 編輯商品: ${v.product_name}`);
    delProduct = (id) => alert(`(mock) 刪除商品 ID: ${id}`);
    confirmDelProduct = () => {};
    delProductImg = () => {};
    productSave = () => alert("(mock) 建立/保存");
    addProductSpec = () => {};
    delProductSpec = () => {};
    toFirstUp = (id) => alert(`(mock) 置頂商品 ID: ${id}`);
    addClass = () => {};
    editClass = () => {};
    delClass = () => {};
    confirmEditProductClass = () => {};
    selClass = (_v) => {
      _v.ClassChecked = !_v.ClassChecked;
    };

    //---- onMounted ----------------------------------------------------------
    onMounted(() => {
      select_mode.value = "init";
      _getProductList();
    });

    //---- return -------------------------------------------------------------
    return {
      // 分頁
      perpage,
      currentPage,
      setPage,
      totalPage,
      pageStart,
      pageEnd,
      totalCount,
      disabled_prev,
      disabled_next,
      displayPages,
      select_mode, // 顯示在 debug 列

      // 資料
      storeJson,
      productJson,
      productListJson,
      product_class_listJson,
      productClassJson,
      productClass,

      // 篩選
      sel_class_name,
      sel_up_down,
      sel_product_class_list,
      sel_up_down_class_list,
      query,
      query_value,

      // UI 控制
      showUploadDiv,
      showProductUploadDiv_1,
      showProductUploadDiv_2,
      showProductUploadDiv_3,

      // 操作函式
      addProduct,
      setProductStatus,
      showEditProduct,
      delProduct,
      toFirstUp,
      unDo,
      storeSave,
      delLogoImg,
      confirmDelProduct,
      delProductImg,
      productSave,
      addProductSpec,
      delProductSpec,
      addClass,
      editClass,
      delClass,
      confirmEditProductClass,
      selClass,
    };
  },
};

Vue.createApp(App).mount("#app");
