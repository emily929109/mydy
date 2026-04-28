const { watch } = Vue;

const App = {
  setup() {
    const dealerJson = ref({});
    const productJson = ref({});
    const productList = ref([]);
    const specJson = ref([]);
    const image_product_1 = ref("");
    const image_product_2 = ref("");
    const image_product_3 = ref("");
    const image_product_4 = ref("");
    const image_product_5 = ref("");
    const showCarDiv = ref(false);
    const showHomeDiv = ref(false);
    const selectedOption = ref("");
    const p = reactive({
      product_cash: "",
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
      product_spec: "", //規格
      spec: "",
    });
    const groupJson = ref([]);
    const search_value = ref("");
    //圖片容器 自動過濾空值
    const imageList = computed(() => {
      const imgs = [
        image_product_1.value,
        image_product_2.value,
        image_product_3.value,
        image_product_4.value,
        image_product_5.value,
      ].filter((img) => img && img !== "");

      return imgs || [];
    });
    const buyQty = ref(1);
    // ===== SPA view 狀態 =====
    const currentView = ref("product"); // '' | 'cart'
    // ===== 購物車視圖 =====
    const cartCount = ref(0); //購物車總數量
    const cartItems = ref([]); //購物車項目列表

    onMounted(() => {
      var _store = getUrlParameter("store");
      var _product = getUrlParameter("product");

      // 從其他頁面跳轉過來時，依 URL 切換視圖
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "cart") {
        const member = JSON.parse(localStorage.getItem("member"));
        if (member == null) {
          return;
        }

        _getCart(member.id); //取得購物車資料
        currentView.value = "cart";
        return;
      } else if (params.get("view") === "checkout") {
        currentView.value = "checkout";
        return;
      }

      //if (_store == 'null' || _product == 'null') {
      //    window.location.href = '../Home/Index';
      //    return;
      //}

      blockUI();
      axios({
        method: "post",
        url: "/api/Dealer/GetPuchase",
        headers: { "Content-Type": "application/json" },
        params: { store_no: _store, product_id: _product },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            dealerJson.value = response.data.dealer;
            productJson.value = response.data.product;

            image_product_1.value =
              productJson.value.product_imagelistbase64[0];
            image_product_2.value =
              productJson.value.product_imagelistbase64[1];
            image_product_3.value =
              productJson.value.product_imagelistbase64[2];
            image_product_4.value =
              productJson.value.product_imagelistbase64[3];
            image_product_5.value =
              productJson.value.product_imagelistbase64[4];

            //check
            const spec = productJson.value.product_spec[0];
            //console.log('spec', spec);
            //單位/件數
            p.product_cash = spec.cash;
            p.product_qty = spec.qty;
            //取貨方式 宅配/自取
            p.car_checked = spec.car_checked;
            p.home_checked = spec.home_checked;

            //console.log('p', p);

            //規格
            specJson.value = productJson.value.product_spec;

            //html
            if (response.data.product.product_desc != null) {
              var tempCont = document.createElement("div");
              new Quill(tempCont).setContents(
                JSON.parse(response.data.product.product_desc),
              );
              var txt =
                tempCont.getElementsByClassName("ql-editor")[0].innerHTML;
              productJson.value.product_desc = txt;
            }

            //左側商品group
            _getGroup(_store);
          } else {
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          $.unblockUI();
          console.log(error);
        })
        .finally(() => {
          console.log("完成");
        });
    });

    _getCart = (member_id) => {
      axios({
        method: "post",
        url: "/api/Dealer/GetCart",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member_id },
      })
        .then((response) => {
          console.log(response.data);
          if (response.data.success) productList.value = response.data.groups;
          //計算數量加總
          cartCount.value = productList.value
            .flatMap((dealer) => dealer.cars) // 第一步：把所有 cars 抓出來變成一維陣列
            .reduce((sum, item) => sum + Number(item.buy_qty || 0), 0); // 第二步：加總
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          console.log("完成");
        });
    };

    //左側商品group
    _getGroup = (_store) => {
      axios({
        method: "post",
        url: "/api/Dealer/GetGroup",
        headers: { "Content-Type": "application/json" },
        params: { store_no: _store },
      })
        .then((response) => {
          console.log(response.data);
          if (response.data.success)
            groupJson.value = response.data.group; //左側商品group
          else console.log(response.data.msg);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          console.log("完成");
        });
    };

    specSelected = (_v) => {
      //console.log(_v);

      //init
      showCarDiv.value = false;
      showHomeDiv.value = false;
      selectedOption.value = "";

      p.product_cash = _v.cash;
      p.product_qty = _v.qty;
      p.carChecked = _v.car_checked;
      p.homeChecked = _v.home_checked;
      buyQty.value = 1; //換規格時數量重置為 1
    };

    watch(selectedOption, (newVal) => {
      //console.log('radio 變更：', newVal);
      if (newVal == "商家宅配") {
        showCarDiv.value = true;
        showHomeDiv.value = false;
      } else if (newVal == "店內自取") {
        showCarDiv.value = false;
        showHomeDiv.value = true;
      }
    });

    addToCart = (_p, type) => {
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) {
        $("#authentication-modal").modal("show");
        return;
      }
      console.log(member);

      //目前登入帳號為店家,無法進行結帳
      if (member != null) {
        if (member.role == "dealer") {
          alert("請注意,目前登入帳號為店家,無法進行結帳");
          return;
        }
      }

      if (type === "1") {
        // console.log("加入購物車")
        // post 到後端 API並更新購物車icon上的數字
        loadCart(member.id, _p);

        // 成功加入購物車提示框
        triggerCartToast(member.id, _p);

        // render 購物車頁內容
        _getCart(member.id);
      } else if (type === "2") {
        //console.log("直接購買")
        // post 到後端 API並更新購物車icon上的數字
        loadCart(member.id, _p);
        goToCart();
        // render 購物車頁內容
        _getCart(member.id);
      }

      //console.log(_p);
      //<select>已綁定v-model="p.spec"
      if (_p.spec == "") {
        alert("請選擇商品規格");
        return;
      }
    };

    // ===== SPA 切換 =====
    goToCart = () => {
      //showCartDropdown.value = false;
      if (currentView.value == "cart") return;

      currentView.value = "cart";
      // loadCart();
      const url = new URL(window.location);
      url.searchParams.set("view", "cart");
      window.history.pushState({ view: "cart" }, "", url);
      //nextTick(() => window.scrollTo(0, 0));
    };

    // ===== 購物車視圖 =====
    goToProduct = () => {
      window.location.href = "../Home/ProductList";
    };

    updateQty = (id, delta) => {
      console.log("updateQty", id, delta);
      const item = productList.value.find((i) => i.product_id === id);
      if (!item) return;
      const newQty = item.buy_qty + delta;
      //if (newQty < 1 || newQty > item.spec_qty_max) return;
      item.buy_qty = newQty;
      console.log(productList.value);
      //call API 更新header icon
    };

    removeItem = (id) => {
      //todo : 1. 過濾掉要刪除的項目(array.filter)
      //todo : 2. POST到後端 API 更新購物車
      //todo : 3. 更新購物車icon上的數字
    };

    //checkout = () => {
    //    goToCheckout();
    //};

    // 瀏覽器上一頁/下一頁
    window.onpopstate = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "cart") {
        currentView.value = "cart";
        //console.log("cart view");
      } else if (params.get("view") === "checkout") {
        currentView.value = "checkout";
      } else {
        currentView.value = "product";
      }
    };

    goToCheckout = () => {
      // todo : 1. 檢查是否有選擇商品

      currentView.value = "checkout";
      const url = new URL(window.location);
      url.searchParams.set("view", "checkout");
      window.history.pushState({ view: "checkout" }, "", url);
    };

    handleCheckout = () => {
      alert("導去orderpurchase");
      // window.location.href = '...';
    };

    loadCart = (member_id, _p) => {
      //console.log(member_id);
      //console.log(buyQty.value);

      blockUI();
      axios({
        method: "post",
        url: "/api/Dealer/AddCar",
        headers: { "Content-Type": "application/json" },
        params: {
          member_id: member_id, //消費者序號
          dealer_id: dealerJson.value.member_id, //店家序號
          store_no: getUrlParameter("store"), //AE86
          product_id: parseInt(getUrlParameter("product")), //品名id
          item: productJson.value.product_name, //品名
          total_cash: _p.product_cash,
          item_spec: JSON.stringify(_p.spec), //規格
          buyQty: buyQty.value,
          //send_type: selectedOption.value == '商家宅配' ? 0 : 1,//取貨方式0宅配 1自取
          //home_name: _p.home_name,
          //home_mobile: _p.home_mobile,
          //home_mark: _p.home_mark,
          //car_name: _p.car_name,
          //car_mobile: _p.car_mobile,
          //car_address: _p.car_address,
          //car_mark: _p.car_mark,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            cartItems.value = response.data.groups; // 陣列中有物件
            //觸發 header.js cartUpdated事件 更新 header icon 上的數字
            window.dispatchEvent(
              new CustomEvent("cartUpdated", { detail: response.data.groups }),
            );

            //更新cartCount
            cartCount.value = cartItems.value.reduce((total, dealer) => {
              return (
                total +
                dealer.cars.reduce((sum, car) => sum + (car.buy_qty || 0), 0)
              );
            }, 0);
            console.log("cartCount", cartCount.value);
          } else {
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          $.unblockUI();
          console.log(error);
        })
        .finally(() => {
          console.log("完成");
        });
    };

    // 解析規格名稱，若為 JSON 字串則取出 name 屬性，否則直接回傳原字串
    getSpecName = (specStr) => {
      try {
        return JSON.parse(specStr).name || specStr;
      } catch {
        return specStr;
      }
    };

    updateQty = (id, delta) => {
      //const item = cartItems.value.find((i) => i.product_id === id);
      //if (!item) return;
      //const newQty = item.buy_qty + delta;
      ////if (newQty < 1 || newQty > item.spec_qty_max) return;
      //item.buy_qty = newQty;
      //console.log(cartItems.value);
      ////loadCart(member.id, _p);
    };

    // ===== 成功加入購物車提示 開始 =====
    const showCartToast = ref(false);
    let cartToastTimer = null;
    const triggerCartToast = () => {
      if (cartToastTimer) {
        clearTimeout(cartToastTimer);
      }

      showCartToast.value = true;
      cartToastTimer = setTimeout(() => {
        showCartToast.value = false;
      }, 2500);
    };
    // ===== 成功加入購物車提示 結束 =====

    return {
      dealerJson,
      productJson,
      image_product_1,
      image_product_2,
      image_product_3,
      image_product_4,
      image_product_5,
      //showCarHome,
      showCarDiv,
      showHomeDiv,
      p, // account,
      specJson,
      specSelected,
      groupJson,
      //search,
      search_value,
      selectedOption,
      addToCart,
      imageList,
      goToCart,
      buyQty,
      currentView,
      updateQty,
      removeItem,
      goToProduct,
      goToCheckout,
      handleCheckout,
      showCartToast,
      cartCount,
      cartItems,
      getSpecName,
      updateQty,
      productList,
    };
  },
};

Vue.createApp(App).mount("#app");

$(window).on("load", function () {});

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
