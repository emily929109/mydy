const { createApp, ref, reactive, onMounted, nextTick, computed, watch } = Vue;

const app = createApp({
  setup() {
    const dealerJson = ref({});
    const productJson = ref({});
    const specJson = ref([]);
    const image_product_1 = ref("");
    const image_product_2 = ref("");
    const image_product_3 = ref("");
    const image_product_4 = ref("");
    const image_product_5 = ref("");
    const showCarDiv = ref(false);
    const showHomeDiv = ref(false);
    const selectedOption = ref("");
    const buyQty = ref(1);
    const p = reactive({
      product_cash: 0,
      product_qty: "",
      carChecked: true,
      homeChecked: true,
      car_name: "",
      car_address: "",
      car_mobile: "",
      car_mark: "",
      home_name: "",
      home_mobile: "",
      home_mark: "",
      product_spec: "",
      spec: "",
    });
    const groupJson = ref([]);
    const search_value = ref("");

    // ===== 加入購物車 Toast =====
    const showCartToast = ref(false);
    let cartToastTimer = null;
    const triggerCartToast = () => {
      // console.log("目前計時器編號：", cartToastTimer);
      if (cartToastTimer) {
        // console.log("取消舊的計時器：", cartToastTimer);
        clearTimeout(cartToastTimer);
      }

      showCartToast.value = true;
      cartToastTimer = setTimeout(() => {
        showCartToast.value = false;
      }, 2500);
      // console.log("新產生的計時器編號：", cartToastTimer);
    };

    // ===== Header Cart =====
    const showCartDropdown = ref(false);
    const headerCart = ref([]);
    // const cartCount = computed(() =>
    //   headerCart.value.reduce((sum, item) => sum + item.quantity, 0),
    // );
    const refreshHeaderCart = () => {
      headerCart.value = JSON.parse(localStorage.getItem("dudu_cart")) || [];
      cartItems.value = JSON.parse(localStorage.getItem("dudu_cart")) || [];
    };
    const toggleCartDropdown = () => {
      showCartDropdown.value = !showCartDropdown.value;
      if (showCartDropdown.value) refreshHeaderCart();
    };
    const getSpecName = (specStr) => {
      try {
        return JSON.parse(specStr).name || specStr;
      } catch {
        return specStr;
      }
    };

    // ===== SPA view 狀態 =====
    const currentView = ref("product"); // '' | 'cart'
    const ScrollY = ref(0);

    // ===== 購物車狀態 =====
    const cartItems = ref([]);
    const selectedIds = ref([]);

    // ===== 購物車 computed =====
    const cartGroups = computed(() => {
      const groups = {};
      cartItems.value.forEach((item) => {
        if (!groups[item.store_no]) groups[item.store_no] = [];
        groups[item.store_no].push(item);
      });
      // console.log("cartGr
      //oups", groups);
      return groups;
    });

    const selectedTotal = computed(() => {
      return cartItems.value
        .filter((item) => selectedIds.value.includes(item.cartItemId))
        .reduce((sum, item) => sum + item.spec_cash * item.quantity, 0);
    });

    //計算目前購物車中『已勾選商品』的總數量
    const selectedCount = computed(() => {
      const a = cartItems.value
        .filter((item) => selectedIds.value.includes(item.cartItemId))
        .reduce((sum, item) => sum + item.quantity, 0);
      console.log("selectedCount", a);
      return a;
    });

    const isAllSelected = computed(() => {
      return (
        cartItems.value.length > 0 &&
        selectedIds.value.length === cartItems.value.length
      );
    });

    // ===== 結帳頁狀態 =====
    const checkoutOrders = ref({});
    // 每個 key = store_no，value = { option, car_name, ... }

    const checkoutGroups = computed(() => {
      const groups = {};
      cartItems.value
        .filter((item) => selectedIds.value.includes(item.cartItemId))
        .forEach((item) => {
          if (!groups[item.store_no]) groups[item.store_no] = [];
          groups[item.store_no].push(item);
        });
      console.log("checkoutGroups", groups);
      return groups;
    });

    const getStoreSubtotal = (storeNo) =>
      cartItems.value
        .filter(
          (i) =>
            selectedIds.value.includes(i.cartItemId) && i.store_no === storeNo,
        )
        .reduce((sum, i) => sum + i.spec_cash * i.quantity, 0);

    const getStoreShipping = (storeNo) => {
      const order = checkoutOrders.value[storeNo];
      if (!order || order.option !== "商家宅配") return 0;
      return cartItems.value
        .filter(
          (i) =>
            selectedIds.value.includes(i.cartItemId) && i.store_no === storeNo,
        )
        .reduce((sum, i) => sum + (i.spec_shipping_fee || 0), 0);
    };

    const getStoreTotal = (storeNo) =>
      getStoreSubtotal(storeNo) + getStoreShipping(storeNo);

    const checkoutGrandTotal = computed(() =>
      Object.keys(checkoutOrders.value).reduce(
        (sum, s) => sum + getStoreTotal(s),
        0,
      ),
    );

    const checkoutAllSelected = computed(
      () =>
        Object.keys(checkoutOrders.value).length > 0 &&
        Object.values(checkoutOrders.value).every((o) => o.option !== ""),
    );

    // 當 checkoutGroups 有內容時，自動補齊 checkoutOrders 的 key
    // 避免模板在 v-show 為 false 時仍讀取 undefined.option 報錯
    watch(
      checkoutGroups,
      (newGroups) => {
        Object.keys(newGroups).forEach((storeNo) => {
          if (!checkoutOrders.value[storeNo]) {
            checkoutOrders.value[storeNo] = {
              option: "",
              car_name: "",
              car_address: "",
              car_mobile: "",
              car_mark: "",
              home_name: "",
              home_mobile: "",
              home_mark: "",
            };
          }
        });
      },
      { immediate: true },
    );

    onMounted(() => {
      refreshHeaderCart();
      loadCart();

      // 點擊外部關閉 dropdown
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".header-cart-wrap")) {
          showCartDropdown.value = false;
        }
      });

      // 若 URL 含 ?view=cart，直接切至購物車頁
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "cart") {
        currentView.value = "cart";
        return;
      }

      const _store = params.get("store");
      const _product = params.get("product");

      if (!_store || !_product) {
        // alert("找不到商品資訊，即將返回商品列表");
        window.location.href = "index.html";
        return;
      }

      fetch("products.json")
        .then((res) => res.json())
        .then((data) => {
          const store = data.stores.find((s) => s.store_no === _store);
          const product = store?.products.find(
            (prd) => prd.product_id == _product,
          );

          if (!store || !product) {
            alert("找不到指定商品，即將返回商品列表");
            window.location.href = "index.html";
            return;
          }

          // 店家資訊
          dealerJson.value = {
            store_no: store.store_no,
            dealer_name: store.dealer_name,
            dealer_desc: store.dealer_desc,
            dealer_address: store.dealer_address,
            member_id: store.member_id,
            agent_phone: store.agent_phone,
          };

          // 商品資訊
          productJson.value = product;

          const images = product.product_imagelistbase64;
          image_product_1.value = images[0] || "";
          image_product_2.value = images[1] || "";
          image_product_3.value = images[2] || "";
          image_product_4.value = images[3] || "";
          image_product_5.value = images[4] || "";

          specJson.value = product.product_spec;

          // 預設帶入第一筆規格
          const spec = product.product_spec[0];
          p.product_cash = spec.cash;
          p.product_qty = spec.qty;
          p.carChecked = spec.car_checked;
          p.homeChecked = spec.home_checked;

          // 左側分類（從該店家商品計算）
          const categoryMap = {};
          store.products.forEach((prd) => {
            categoryMap[prd.category] = (categoryMap[prd.category] || 0) + 1;
          });
          groupJson.value = [
            { class_name: "全部商品", count: store.products.length },
            ...Object.entries(categoryMap).map(([k, v]) => ({
              class_name: k,
              count: v,
            })),
          ];
        })
        .catch((err) => {
          console.error("載入 products.json 失敗", err);
        });
    });

    specSelected = (_v) => {
      // console.log(_v);

      // init
      showCarDiv.value = false;
      showHomeDiv.value = false;
      selectedOption.value = "";

      p.product_cash = _v.cash;
      p.product_qty = _v.qty;
      p.carChecked = _v.car_checked;
      p.homeChecked = _v.home_checked;
      p.spec = _v;
      buyQty.value = 1; //換規格時數量重置為 1
    };

    // account = (_p) => {
    //   // 規格
    //   if (_p.spec == "") {
    //     alert("請選擇商品規格");
    //     return;
    //   }

    //   // 取貨方式
    //   if (selectedOption.value == "") {
    //     alert("請選擇取貨方式");
    //     return;
    //   } else if (selectedOption.value == "商家宅配" && !_p.carChecked) {
    //     alert("請選擇取貨方式");
    //     return;
    //   } else if (selectedOption.value == "店內自取" && !_p.homeChecked) {
    //     alert("請選擇取貨方式");
    //     return;
    //   }

    //   if (selectedOption.value == "商家宅配") {
    //     if (
    //       _p.car_name == "" ||
    //       _p.car_mobile == "" ||
    //       _p.car_address == ""
    //     ) {
    //       alert("請填收貨人資訊");
    //       return;
    //     }
    //   }
    //   if (selectedOption.value == "店內自取") {
    //     if (_p.home_name == "" || _p.home_mobile == "") {
    //       alert("請填取件人資訊");
    //       return;
    //     }
    //   }

    //   // 目前登入帳號為店家,無法進行結帳
    //   const member = JSON.parse(localStorage.getItem("member"));
    //   if (member != null) {
    //     if (member.role == "dealer") {
    //       alert("請注意,目前登入帳號為店家,無法進行結帳");
    //       return;
    //     }
    //   }

    //   // 模擬直接購買：加入購物車後前往購物車頁
    //   addToCart(_p);
    // };

    watch(selectedOption, (newVal) => {
      if (newVal == "商家宅配") {
        showCarDiv.value = true;
        showHomeDiv.value = false;
      } else if (newVal == "店內自取") {
        showCarDiv.value = false;
        showHomeDiv.value = true;
      }
    });

    search = (_search_value) => {};

    // ===== 購物車：localStorage 讀寫 =====
    loadCart = () => {
      const raw = JSON.parse(localStorage.getItem("dudu_cart")) || [];
      // console.log("購物車內容：", raw);
      cartItems.value = raw;
      selectedIds.value = raw.map((item) => item.cartItemId);
      // console.log(selectedIds.value);
    };

    saveCart = () => {
      localStorage.setItem("dudu_cart", JSON.stringify(cartItems.value));
      refreshHeaderCart();
    };

    // ===== 加入購物車 =====
    addToCart = (_p) => {
      if (_p.spec == "") {
        alert("請選擇商品規格");
        return;
      }

      const cart = JSON.parse(localStorage.getItem("dudu_cart")) || [];
      const specName = _p.spec.name;
      // console.log("加入購物車的規格名稱：", specName);
      const existIdx = cart.findIndex(
        (item) =>
          item.product_id === productJson.value.product_id &&
          item.spec_name === specName,
      );

      // 若已存在相同商品+規格，則數量累加；否則新增一筆
      if (existIdx >= 0) {
        const maxQty = _p.spec.qty || 99;
        const newQty = cart[existIdx].quantity + buyQty.value;
        if (newQty <= maxQty) {
          cart[existIdx].quantity = newQty;
        } else {
          alert("已達庫存上限");
          return;
        }
      } else {
        cart.push({
          cartItemId: productJson.value.product_id + "-" + specName,
          store_no: dealerJson.value.store_no,
          dealer_member_id: dealerJson.value.member_id,
          product_id: productJson.value.product_id,
          product_name: productJson.value.product_name,
          product_image: image_product_1.value,
          spec_name: specName,
          spec_cash: _p.product_cash,
          spec_qty_max: _p.spec.qty || 99,
          spec_shipping_fee: _p.spec.shipping_fee || 0,
          quantity: buyQty.value,
        });
      }

      localStorage.setItem("dudu_cart", JSON.stringify(cart));
      loadCart(); // 同步更新 cartItems + selectedIds
      refreshHeaderCart();
      triggerCartToast();

      // const goNow = confirm("已加入購物車，是否前往查看？");
      // if (goNow) goToCart();
    };

    // ===== SPA 切換 =====
    goToCart = () => {
      showCartDropdown.value = false;
      if (currentView.value == "cart") return;

      currentView.value = "cart";
      // loadCart();
      const url = new URL(window.location);
      url.searchParams.set("view", "cart");
      window.history.pushState({ view: "cart" }, "", url);
      nextTick(() => window.scrollTo(0, 0));
    };

    goToProduct = () => {
      // currentView.value = "product";
      // const url = new URL(window.location);
      // url.searchParams.delete("view");
      // window.history.pushState({ view: "product" }, "", url);
      // nextTick(() => window.scrollTo(0, productScrollY.value));
      window.location.href = "index.html";
    };

    goToCheckout = () => {
      if (selectedIds.value.length === 0) {
        alert("請選擇要結帳的商品");
        return;
      }
      currentView.value = "checkout";
      const url = new URL(window.location);
      url.searchParams.set("view", "checkout");
      window.history.pushState({ view: "checkout" }, "", url);
      nextTick(() => window.scrollTo(0, 0));
    };

    // 瀏覽器上一頁/下一頁
    window.onpopstate = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "cart") {
        currentView.value = "cart";
        loadCart();
        nextTick(() => window.scrollTo(0, 0));
      } else if (params.get("view") === "checkout") {
        currentView.value = "checkout";
        nextTick(() => window.scrollTo(0, 0));
      } else {
        // currentView.value = "product";
        window.location.href = "index.html";
        nextTick(() => window.scrollTo(0, productScrollY.value));
      }
    };

    // ===== 購物車 CRUD =====
    toggleAll = (checked) => {
      selectedIds.value = checked
        ? cartItems.value.map((item) => item.cartItemId)
        : [];
    };

    toggleStoreAll = (store_no, checked) => {
      //   console.log(cartItems.value);
      const storeIds = cartItems.value
        .filter((item) => item.store_no === store_no)
        .map((item) => item.cartItemId);
      if (checked) {
        const merged = new Set([...selectedIds.value, ...storeIds]);
        // console.log("merged", merged);
        selectedIds.value = [...merged];
      } else {
        selectedIds.value = selectedIds.value.filter(
          (id) => !storeIds.includes(id),
        );
      }
    };

    isStoreAllSelected = (store_no) => {
      const storeIds = cartItems.value
        .filter((item) => item.store_no === store_no)
        .map((item) => item.cartItemId);
      return (
        storeIds.length > 0 &&
        storeIds.every((id) => selectedIds.value.includes(id))
      );
    };

    toggleItem = (id) => {
      const idx = selectedIds.value.indexOf(id);
      if (idx >= 0) {
        selectedIds.value.splice(idx, 1);
      } else {
        selectedIds.value.push(id);
      }
    };

    updateQty = (id, delta) => {
      const item = cartItems.value.find((i) => i.cartItemId === id);
      if (!item) return;
      const newQty = item.quantity + delta;
      if (newQty < 1 || newQty > item.spec_qty_max) return;
      item.quantity = newQty;
      saveCart();
    };

    removeItem = (id) => {
      cartItems.value = cartItems.value.filter((i) => i.cartItemId !== id);
      selectedIds.value = selectedIds.value.filter((i) => i !== id);
      saveCart();
    };

    checkout = () => {
      goToCheckout();
    };

    return {
      // Toast
      showCartToast,
      // Header Cart
      showCartDropdown,
      headerCart,
      // cartCount,
      toggleCartDropdown,
      getSpecName,
      dealerJson,
      productJson,
      image_product_1,
      image_product_2,
      image_product_3,
      image_product_4,
      image_product_5,
      showCarDiv,
      showHomeDiv,
      p,
      // account,
      specJson,
      specSelected,
      groupJson,
      search,
      search_value,
      selectedOption,
      buyQty,
      // SPA
      currentView,
      goToCart,
      goToProduct,
      goToCheckout,
      // 購物車
      cartItems,
      cartGroups,
      selectedIds,
      selectedTotal,
      selectedCount,
      isAllSelected,
      loadCart,
      addToCart,
      toggleAll,
      toggleStoreAll,
      isStoreAllSelected,
      toggleItem,
      updateQty,
      removeItem,
      checkout,
      checkoutOrders,
      checkoutGroups,
      getStoreSubtotal,
      getStoreShipping,
      getStoreTotal,
      checkoutGrandTotal,
      checkoutAllSelected,
    };
  },
});

app.mount("#app");

document.addEventListener("DOMContentLoaded", function () {
  //自動輪播
  let timer;
  let interval = 5000;
  const sliderWrap = document.querySelector(".container_ean-slide");
  if (!sliderWrap) return;

  // startAuto();

  // sliderWrap.addEventListener("mouseenter", stopAuto);
  // sliderWrap.addEventListener("mouseleave", startAuto);

  setNumberText();

  function startAuto() {
    stopAuto(); // 保險：先清掉舊的，避免重覆
    timer = setInterval(() => plusSlides(1), interval);
  }

  function stopAuto() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }
});

let slideIndex = 1;

//控制slideIndex
function plusSlides(n) {
  let slides = document.getElementsByClassName("mySlides");

  slideIndex = slideIndex + n;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }
  if (slideIndex < 1) {
    slideIndex = slides.length;
  }
  showSlides(slideIndex);
}

//active class切換
function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("demo");
  let captionText = document.getElementById("caption");
  for (i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex - 1].classList.add("active");
  dots[slideIndex - 1].classList.add("active");
}

function currentSlide(n) {
  slideIndex = n;
  showSlides(slideIndex);
}

// ============= 分子 / 分母設定函式 =============
setTimeout(setNumberText, 2000);

function setNumberText() {
  const slideContainer = document.querySelector(".container_ean-slide");
  if (!slideContainer) return;
  const slides = slideContainer.querySelectorAll(".mySlides");
  const total = slides.length;
  slides.forEach((slide, i) => {
    const nt = slide.querySelector(".numbertext");
    if (nt) nt.textContent = `${i + 1} / ${total}`;
  });
}
