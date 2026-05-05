const { watch } = Vue;

const App = {
  setup() {
    const dealerJson = ref({});
    const productJson = ref({});
    const productList = ref([]);
    const productListCheckout = ref([]);
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
    const currentView = ref("product"); // '' | 'cart'
    const productItem = reactive({ sum_cash: 0, shipping_fee: 0 });

    onMounted(() => {
      var store = getUrlParameter("store");
      var product = getUrlParameter("product");
      const params = new URLSearchParams(window.location.search);
      const member = JSON.parse(localStorage.getItem("member"));

      //不論登入與否
      _getProduct(store, product);

      if (member == null) return;

      //登入後
      _getCart(member.id); //取得購物車資料

      if (params.get("view") === "cart") {
        currentView.value = "cart";
      } else if (params.get("view") === "checkout") {
        // 應該要先選擇商品才會到結帳頁
        currentView.value = "cart";
      }
    });

    // =============== 商品頁view 開始 ===============

    _getProduct = (_store, _product) => {
      //console.log(_store);
      //console.log(_product);
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
            p.product_cash = spec.cash; //單價
            p.product_qty = spec.qty; // 剩餘數量
            p.car_checked = spec.car_checked; // 是否支援宅配
            p.home_checked = spec.home_checked; // 是否支援自取

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

    // =============== 商品頁view 結束 ===============

    // =============== 購物車view 開始===============
    const cartCount = ref(0); // 購物車總數量
    const cartItems = ref([]); // 儲存flat後的購物車資料(一維陣列)
    const selectedIDs = ref([]); // 儲存被選取的品項

    // 呼叫時機 : 登入時、按加入購物車、按直接購買
    // directBuyProductId 決定selectedCartItems預設值 (被選中的商品)
    _getCart = (member_id, directBuyProductId = null) => {
      axios({
        method: "post",
        url: "/api/Dealer/GetCart",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member_id },
      })
        .then((response) => {
          console.log(response.data);
          if (response.data.success) {
            // 儲存原始資料
            productList.value = response.data.groups;
            // 儲存一維陣列
            cartItems.value = productList.value.flatMap(
              (dealer) => dealer.cars,
            );

            //更新header icon數字
            window.dispatchEvent(
              new CustomEvent("cartUpdated", { detail: response.data.groups }),
            );

            if (directBuyProductId != null) {
              // 直接購買：只選取該商品和上次有勾選的

              selectedIDs.value = cartItems.value
                .filter(
                  (item) =>
                    item.product_id === directBuyProductId ||
                    item.cust_check === true,
                )
                .map((item) => item.car_id);
            } else {
              // 加入購物車：全選
              selectedIDs.value = cartItems.value
                .filter((item) => item.cust_check === true)
                .map((item) => item.car_id);
            }

            // 決定購物車視圖要顯示哪一個
            cartCount.value = productList.value
              .flatMap((dealer) => dealer.cars) // 把所有 cars 抓出來變成一維陣列
              .reduce((sum, item) => sum + Number(item.buy_qty || 0), 0); // 加總

            //觸發 header.js cartUpdated事件 更新 header icon 上的數字
            //window.dispatchEvent(new CustomEvent('cartUpdated', { detail: response.data.groups }));
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          console.log("完成");
        });
    };

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

      //console.log(_p);
      if (_p.spec == "") {
        alert("請選擇商品規格");
        return;
      }

      saveCart(member.id, _p);

      if (type === "1") {
        // 加入購物車提示框
        triggerCartToast(member.id, _p);
      } else if (type === "2") {
        // 直接購買
        goToCart();
      }
    };

    goToCart = () => {
      if (currentView.value == "cart") return;

      currentView.value = "cart";
      const url = new URL(window.location);
      url.searchParams.set("view", "cart");
      window.history.pushState({ view: "cart" }, "", url);
    };

    goToProduct = () => {
      window.location.href = "../Home/ProductList";
    };

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

    goToCheckout = (_v) => {
      console.log(_v);
      let data2 = [];
      let _store_no;

      // emily : cust_check依selectedIDs判斷，因店家全選已寫好
      _v.cars.forEach((x) => {
        _store_no = x.store_no;
        data2.push({
          car_id: x.car_id,
          product_id: x.product_id,
          store_no: x.store_no,
          buy_qty: x.buy_qty,
          cash: x.cash,
          cust_check: selectedIDs.value.includes(x.car_id),
        });
      });
      console.log(data2);

      const member = JSON.parse(localStorage.getItem("member"));

      blockUI();
      axios({
        method: "post",
        url: "/api/Dealer/SaveItemProduct",
        headers: { "Content-Type": "application/json" },
        data: {
          dealer_id: _v.dealer_id,
          member_id: member.id,
          store_no: _store_no,
          orders: data2,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            productListCheckout.value = response.data.groups;
            productItem.sum_cash = response.data.sum_cash;
            productItem.shipping_fee = response.data.shipping_fee;
            //alert('ok');

            // 導去結帳頁
            goToCheckoutView();
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

    goToCheckoutView = () => {
      if (currentView.value == "checkout") return;

      currentView.value = "checkout";
      const url = new URL(window.location);
      url.searchParams.set("view", "checkout");
      window.history.pushState({ view: "checkout" }, "", url);
    };

    const handleCheckout = (_v, _p, _total_cash) => {
      console.log(_v.cars[0].store_no);
      console.log(_v.cars[0]);
      console.log(_p);
      console.log(_total_cash);
      var _store_no = _v.cars[0].store_no;
      var _dealer_id = _v.cars[0].dealer_id;

      alert("導去orderpurchase");

      //取貨方式
      if (selectedOption.value == "") {
        alert("請選擇取貨方式");
        return;
      }

      if (selectedOption.value == "商家宅配") {
        if (_p.car_name == "" || _p.car_mobile == "" || _p.car_address == "") {
          alert("請填收貨人資訊");
          return;
        }
      }
      if (selectedOption.value == "店內自取") {
        if (_p.home_name == "" || _p.home_mobile == "") {
          alert("請填取件人資訊");
          return;
        }
      }
      //目前登入帳號為店家,無法進行結帳
      const member = JSON.parse(localStorage.getItem("member"));
      if (member != null) {
        if (member.role == "dealer") {
          alert("請注意,目前登入帳號為店家,無法進行結帳");
          return;
        }
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/Dealer/ConfirmOrder",
        headers: { "Content-Type": "application/json" },
        params: {
          member_id: member.id,
          dealer_id: _dealer_id,
          store_no: _store_no,
          send_type: selectedOption.value == "商家宅配" ? 0 : 1, //取貨方式0宅配 1自取
          home_name: _p.home_name,
          home_mobile: _p.home_mobile,
          home_mark: _p.home_mark,
          car_name: _p.car_name,
          car_mobile: _p.car_mobile,
          car_address: _p.car_address,
          car_mark: _p.car_mark,
          total_cash: _total_cash,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            location.href = response.data.value;
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

    // 儲存至後端
    saveCart = (member_id, _p) => {
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
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            _getCart(member_id, parseInt(getUrlParameter("product"))); // render
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

    updateQty = (car_id, delta) => {
      // 用 car_id 找到對應的商品（car_id 唯一，避免同 product_id 不同規格衝突）
      const item = cartItems.value.find((product) => product.car_id === car_id);
      //console.log(item)

      if (item) {
        const newQty = item.buy_qty + delta;
        const maxQty = item.item_spec.qty; // 規格庫存上限

        if (newQty < 1 || newQty > maxQty) return; // 超出範圍不動作
        item.buy_qty = newQty;

        _updateCartQty(item);
      }
    };

    _updateCartQty = (_item) => {
      const member = JSON.parse(localStorage.getItem("member"));

      blockUI();
      axios({
        method: "post",
        url: "/api/Dealer/ChangeQty",
        headers: { "Content-Type": "application/json" },
        params: {
          member_id: member.id,
          product_id: _item.product_id,
          item_spec: JSON.stringify(_item.item_spec),
          buyQty: _item.buy_qty,
        },
      })
        .then((response) => {
          $.unblockUI();
          //console.log(response.data);
          if (response.data.success) {
            //更新header icon數字
            window.dispatchEvent(
              new CustomEvent("cartUpdated", { detail: response.data.groups }),
            );
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

    removeItem = (_car_id) => {
      const member = JSON.parse(localStorage.getItem("member"));

      blockUI();
      axios({
        method: "post",
        url: "/api/Dealer/DelCar",
        headers: { "Content-Type": "application/json" },
        params: { car_id: _car_id },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            productList.value = response.data.groups;
            _getCart(member.id);
            alert("刪除成功");
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

    // 加入購物車提示
    const showCartToast = ref(false);
    let cartToastTimer = null;
    triggerCartToast = () => {
      if (cartToastTimer) {
        clearTimeout(cartToastTimer);
      }

      showCartToast.value = true;
      cartToastTimer = setTimeout(() => {
        showCartToast.value = false;
      }, 2500);
    };

    // ---- 勾選邏輯 開始 ----
    // 勾選狀態來源為getCart，上次有勾選且有按去買單才會同步到後端
    const isAllSelected = computed(() => {
      return (
        cartItems.value.length > 0 &&
        selectedIDs.value.length === cartItems.value.length
      );
    });

    const isStoreAllSelected = (dealerId) => {
      // 儲存單一店家所有商品
      const storeItems = cartItems.value.filter(
        (item) => item.dealer_id === dealerId,
      );
      return (
        storeItems.length > 0 &&
        storeItems.every((item) => selectedIDs.value.includes(item.car_id))
      );
    };

    const hasStoreSelected = (dealerId) => {
      const storeItemIDs = cartItems.value
        .filter((item) => item.dealer_id === dealerId)
        .map((item) => item.car_id);
      return storeItemIDs.some((id) => selectedIDs.value.includes(id));
    };

    const toggleItem = (item) => {
      const idx = selectedIDs.value.indexOf(item.car_id);
      if (idx >= 0) {
        selectedIDs.value.splice(idx, 1);
      } else {
        selectedIDs.value.push(item.car_id);
      }
    };

    const toggleStoreAll = (dealerId, checked) => {
      // 儲存單一店家所有商品
      const storeItemsIDs = cartItems.value
        .filter((item) => item.dealer_id === dealerId)
        .map((cart) => cart.car_id);
      if (checked) {
        const merged = new Set([...selectedIDs.value, ...storeItemsIDs]);
        selectedIDs.value = [...merged];
      } else {
        selectedIDs.value = selectedIDs.value.filter(
          (id) => !storeItemsIDs.includes(id),
        );
      }
    };

    toggleAll = (checked) => {
      selectedIDs.value = checked
        ? cartItems.value.map((cart) => cart.car_id)
        : [];
    };

    calculateStoreTotal = (dealerId) => {
      // selectedIDs是否包含item.dealer_id 是的話就存到storeItems中
      const selectedStoreItems = cartItems.value
        .filter((item) => item.dealer_id === dealerId)
        .filter((item) => selectedIDs.value.includes(item.car_id));

      //const storeItems = cartItems.value.filter(item =>
      //    selectedIDs.value.includes(item.dealer_id)
      //);
      const total = selectedStoreItems.reduce(
        (sum, item) => sum + item.cash * item.buy_qty,
        0,
      );
      return total;
    };
    // ---- 勾選邏輯 結束 ----

    // =============== 結帳頁view 開始===============
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
      //console.log(selectedOption.value)
      //console.log('radio 變更：', newVal);

      if (newVal == "商家宅配") {
        showCarDiv.value = true;
        showHomeDiv.value = false;
      } else if (newVal == "店內自取") {
        showCarDiv.value = false;
        showHomeDiv.value = true;
      }
    });

    // =============== 結帳頁view 結束===============

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
      productList,
      productListCheckout,
      isAllSelected,
      isStoreAllSelected,

      toggleItem,
      toggleStoreAll,
      toggleAll,
      calculateStoreTotal,
      productItem,
      selectedIDs,
      hasStoreSelected,
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
