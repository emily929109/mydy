const App = {
  setup() {
    //----page
    const perpage = ref(8); //一頁的資料數
    const currentPage = ref(1);
    const disabled_prev = ref(true);
    const disabled_next = ref(false);
    const totalCount = ref(0); //存商品總數
    const totalPage = computed(() => {
      var total_page = Math.ceil(totalCount.value / perpage.value);
      if (total_page == 1) {
        disabled_prev.value = true;
        disabled_next.value = true;
      }
      return total_page;
    });
    const pageStart = computed(() => {
      return (currentPage.value - 1) * perpage.value;
      //取得該頁第一個值的index
      //這一頁的資料，要從大陣列（showJson）的第幾個 Index（索引值）開始抓
    });
    const pageEnd = computed(() => {
      return currentPage.value * perpage.value;
      //取得該頁最後一個值的index
    });
    const searchInputRef = ref(null);
    const query_value = ref("");

    // 換頁控制
    const setPage = (page) => {
      if (page === "..." || page < 1 || page > totalPage.value) return;

      currentPage.value = page;

      if (page <= 1) {
        disabled_prev.value = true;
        disabled_next.value = totalPage.value === 1;
      } else if (page >= totalPage.value) {
        disabled_prev.value = false;
        disabled_next.value = true;
      } else {
        disabled_prev.value = false;
        disabled_next.value = false;
      }

      //單擊之後所加的
      switch (keep_class_id.value) {
        case "init":
          // 顯示全部商品，換頁打後端
          _getListForPage();
          break;
        case "class":
          // 依分類篩選，換頁打後端
          _getClassForPage();
          break;
        case "local":
          break; // 本地 filter 不需打後端
        default:
      }
    };
    // 計算顯示頁碼（含 "..."）
    const displayPages = computed(() => {
      const total = totalPage.value;
      const current = currentPage.value;
      const delta = 2; // 前後顯示幾個
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
    //-----------------------------------------------------
    const member = ref(JSON.parse(localStorage.getItem("member")));
    //const selected_date = ref('');
    //const selected_status = ref('');
    //const date_value = ref('');
    //const show_selectDate = ref(false);
    //const jsonData = ref({});
    const jsonShow = ref([]);
    //const confirm = ref({});
    //const seoInput = ref('');
    //const m = reactive({ dealer_acc: '', dealer_role: '' });
    //---
    const image1_path = ref(false);
    const image_product_1 = ref(false);
    const image_product_2 = ref(false);
    const image_product_3 = ref(false);
    const image_product_4 = ref(false);
    const image_product_5 = ref(false);
    const file_1 = ref(null);
    const file_product_1 = ref(null);
    const file_product_2 = ref(null);
    const file_product_3 = ref(null);
    const file_product_4 = ref(null);
    const file_product_5 = ref(null);

    const tmpFile = ref("");
    //const max = ref(10);
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
    const tmp_productListJson = ref([]);
    const all_productListJson = ref([]);
    const productListJson = ref([]);
    const sel_class_name = ref("");
    const sel_up_down = ref("");
    const showUploadDiv = ref(true);
    const showProductUploadDiv_1 = ref(true);
    const showProductUploadDiv_2 = ref(true);
    const showProductUploadDiv_3 = ref(true);
    const _randomString = ref("");
    var quill = {};
    const hasNextMothPay = ref(false);
    const keep_class_id = ref("");
    const keep_class_name = ref("");
    //const content = ref('');

    // 換頁時打後端取資料
    _getListForPage = () => {
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      //const start = (currentPage.value - 1) * perpage.value;
      //const end = currentPage.value * perpage.value;

      // 舊api : GetListForPageForDealer
      // 新api : GetProductListForDealer (page給頁面當前要的第幾頁 pageSize是一頁幾筆)
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/GetProductListForDealer",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: {
          member_id: member.id,
          page: currentPage.value,
          pageSize: perpage.value,
        },
      })
        .then((response) => {
          $.unblockUI();
          //console.log(response.data);
          if (response.data.success) {
            //console.log(response.data.productList);
            productListJson.value = response.data.productList;
            tmp_productListJson.value = response.data.productList;
            //product_class_listJson.value = response.data.product_class_list;//商品分類
            console.log(currentPage.value);
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
    _getClassForPage = () => {
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      const start = (currentPage.value - 1) * perpage.value;
      const end = currentPage.value * perpage.value;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/QueryProductClassForPageForDealer",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: {
          member_id: member.id,
          class_name: keep_class_name.value,
          start: start,
          end: end,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            //console.log(response.data.productList);
            productListJson.value = response.data.productList;
            tmp_productListJson.value = response.data.productList;
            //product_class_listJson.value = response.data.product_class_list;//商品分類
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

    //---file upload
    handleFileUpload = (_item, e) => {
      //console.log(file_1.value.files[0]);

      //tmpFile.value = file_1.value.files[0];//ref get file

      var files = e.target.files || e.dataTransfer.files;
      console.log(files[0]);
      if (!files.length) return;

      createImage(_item, files[0]);
      //console.log(tmpFile.value);
    };

    createImage = (_item, file) => {
      //var image = new Image();
      var reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (e) => {
        let img = new Image();
        img.onload = () => {
          switch (_item) {
            case "logo":
              image1_path.value = e.target.result; //base 64
              break;
            case "image_1":
              image_product_1.value = e.target.result; //base 64
              break;
            case "image_2":
              image_product_2.value = e.target.result; //base 64
              break;
            case "image_3":
              image_product_3.value = e.target.result; //base 64
              break;
            case "image_4":
              image_product_4.value = e.target.result; //base 64
              break;
            case "image_5":
              image_product_5.value = e.target.result; //base 64
              break;
            default:
          }

          var per = 1;
          var width = img.width;
          if (img.width > 410) {
            width = 410;
            per = 410 / img.width;
          }

          submitFile(_item, width, Math.ceil(per * img.height), file);
        };
        img.src = e.target.result;
      };
      //reader.readAsDataURL(file);
      //submitFile(item);
    };

    submitFile = (_item, _width, _height, file) => {
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      //check ID0H-1...轉成ID0H
      //var _item = item.indexOf('ID0H') > 0 ? 'ID0H' : item;
      var productIdOrRandom;
      if (_item != "logo") {
        //商品圖
        if (_randomString.value == "") {
          //商品編輯 帶商品編號
          productIdOrRandom = productJson.value.product_id;
        } else {
          productIdOrRandom = _randomString.value; //新增商品
        }
      }

      let formData = new FormData();
      //formData.append('file', tmpFile.value);
      formData.append("file", file);
      formData.append(
        "data",
        JSON.stringify({
          item: _item,
          id: member.id,
          mobile: member.mobile,
          img: member.dealer_acc,
          width: _width,
          height: _height,
          productIdOrRandom: productIdOrRandom,
        }),
      );

      axios
        .post("/api/CmsUpload/PostFormData_cms", formData, {
          headers: {
            Authorization: `Bearer ${""}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          if (response.data.success) {
            switch (_item) {
              case "logo":
                showUploadDiv.value = false;
                break;
              case "image_1":
                showProductUploadDiv_1.value = false;
                break;
              case "image_2":
              //showProductUploadDiv_2.value = false;
              case "image_3":
              //showProductUploadDiv_3.value = false;
              case "image_4":
              case "image_5":
                //if (image_product_2.value != '' && image_product_3.value != '' &&
                //    image_product_4.value != '' && image_product_5.value != '') {
                ////showProductUploadDiv_2.value = false;
                //}

                break;
              default:
            }

            console.log(response.data);
            console.log("SUCCESS!!");
          } else {
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
          console.log("FAILURE!!");
        })
        .finally(() => {
          console.log("完成");
        });
    };
    //---------------------------------------------------------------------------

    //新增商品
    addProduct = () => {
      //init
      _randomString.value = generateRandomString(16);
      //addProductSpec();
      productJson.value = {
        product_spec: [
          { name: "", qty: 0, cash: 0, car_checked: false, home_checked: true },
        ],
        product_class: storeJson.value.product_class,
      };
      console.log(productJson.value.product_class);

      image_product_1.value = "";
      image_product_2.value = "";
      image_product_3.value = "";
      image_product_4.value = "";
      image_product_5.value = "";
      showProductUploadDiv_1.value = true;
      showProductUploadDiv_2.value = true;
      showProductUploadDiv_3.value = true;

      $("#add-product-modal").modal("show");
      quill.setContents(""); //init
    };
    //放棄保存
    unDo = () => {
      storeJson.value = {};
    };
    //店家保存設定
    storeSave = (v) => {
      console.log(v);

      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      if (typeof v.store_name == "undefined" || v.store_name == "") {
        alert("商店名稱不可空白");
        return;
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/SaveDealer",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: {
          member_id: member.id,
          store_no: member.dealer_acc,
          dealer_status: v.store_checked ? "*" : "",
          dealer_name: v.store_name,
          dealer_address: v.store_address,
          dealer_desc: v.store_desc,
        },
      })
        .then((response) => {
          $.unblockUI();
          if (response.data.success) {
            //image1_path.value = '';
            //showUploadDiv.value = true;
            alert("保存設定成功");
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
    //刪除店家 LOGO
    delLogoImg = () => {
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/DelLogoImg",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: { store_no: member.dealer_acc },
      })
        .then((response) => {
          $.unblockUI();
          if (response.data.success) {
            image1_path.value = "";
            showUploadDiv.value = true;
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

    //刪除商品照
    delProductImg = (_image, _product_id) => {
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      console.log(_randomString.value);
      console.log(_product_id);

      if (typeof _product_id == "undefined") _product_id = 0;
      var productIdOrRandom =
        _product_id == 0 ? _randomString.value : _product_id;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/DelProductImg",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: {
          store_no: member.dealer_acc,
          product_id: _product_id,
          image: _image,
          productIdOrRandom: productIdOrRandom,
        },
      })
        .then((response) => {
          $.unblockUI();
          if (response.data.success) {
            switch (_image) {
              case "image_1.jpg":
                image_product_1.value = "";
                showProductUploadDiv_1.value = true;
                break;
              case "image_2.jpg":
                image_product_2.value = "";
                break;
              case "image_3.jpg":
                image_product_3.value = "";
                break;
              case "image_4.jpg":
                image_product_4.value = "";
                break;
              case "image_5.jpg":
                image_product_5.value = "";
                break;

              default:
            }
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
    //刪除商品
    var __product_id;
    delProduct = (_product_id) => {
      __product_id = _product_id;
      $("#del_product_modal").modal("show");
    };
    //確認刪除商品
    confirmDelProduct = () => {
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/DelProduct",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: { product_id: __product_id },
      })
        .then((response) => {
          $.unblockUI();
          if (response.data.success) {
            _getProductList();
            alert("已刪除");
            $("#del_product_modal").modal("hide");
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

    //商品存檔
    productSave = (v) => {
      console.log(v);
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      if (typeof v.product_name == "undefined" || v.product_name == "") {
        alert("商品名稱不可空白");
        return;
      }

      if (getDisplayLength(v.product_name) > 100) {
        alert("商品名稱太長(100字元,中文/全形/Emoji算2)");
        return;
      }

      if (v.product_spec[0].name == "") {
        alert("請填寫規格名稱");
        return;
      }

      if (
        typeof v.date_s == "undefined" ||
        v.date_s == "" ||
        v.date_e == "undefined" ||
        v.date_e == ""
      ) {
        alert("請填寫上下架時間");
        return;
      }

      var notRun_1 = false;
      var notRun_2 = false;
      v.product_spec.forEach((x) => {
        if (hasNextMothPay.value) {
          //有下月付 就可以150000以上
          if (x.cash > 150000) notRun_1 = true;
        } else {
          if (x.cash < 800 || x.cash > 150000) notRun_2 = true;
        }
      });
      if (notRun_1) {
        alert("銷售金額限制不可大於150,000元(店家未設定下月付)");
        return;
      }
      if (notRun_2) {
        alert("銷售金額限制800~150,000元");
        return;
      }

      //var _product_id;
      var _product_id = typeof v.product_id == "undefined" ? 0 : v.product_id;

      var productIdOrRandom =
        _product_id == 0 ? _randomString.value : v.product_id.toString();

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/SaveProduct",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        data: {
          member_id: member.id,
          product_id: _product_id,
          product_status: v.product_status ? "*" : "",
          product_name: v.product_name,
          date_s: v.date_s,
          date_e: v.date_e,
          store_no: member.dealer_acc,
          productIdOrRandom: productIdOrRandom,
          product_specList: v.product_spec,
          product_desc: JSON.stringify(quill.getContents()),
          product_class: JSON.stringify(v.product_class),
        },
      })
        .then((response) => {
          $.unblockUI();
          if (response.data.success) {
            $("#add-product-modal").modal("hide");
            alert("建立/保存成功");
            //console.log(currentPage.value);
            setPage(currentPage.value);
            //_getProductList();
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

    _getDealer = () => {
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) {
        //window.location.href = '../Home/Index';
        return;
      }
      //console.log(member);

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/GetDealer",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: { member_id: member.id },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            console.log(response.data.value);
            hasNextMothPay.value = response.data.value.hasNextMothPay;
            //image has value
            if (typeof response.data.value != "undefined") {
              storeJson.value = response.data.value;
              if (storeJson.value.store_imagebase64 != "") {
                image1_path.value = storeJson.value.store_imagebase64;
                showUploadDiv.value = false;
              }
            }
            initQuill();
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

    // 進入商品列表 tab 的入口
    //_getProductList = () => {
    //    const member = JSON.parse(localStorage.getItem('member'));
    //    if (member == null) return;

    //    blockUI();
    //    axios({
    //        method: 'post',
    //        url: '/api/DealerProduct/GetProductListForDealer',
    //        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
    //        params: { member_id: member.id }
    //    }).then((response) => {
    //        $.unblockUI();
    //        console.log(response.data);
    //        if (response.data.success) {

    //            console.log(response.data.productList);
    //            productListJson.value = response.data.productList;
    //            tmp_productListJson.value = response.data.productList;
    //            all_productListJson.value = response.data.productList;
    //            //product_class_listJson.value = response.data.product_class_list;

    //            console.log(currentPage.value);
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

    _getProductList = async () => {
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      blockUI();
      try {
        // 同時打兩支api 分別取的商品和分類資料
        const [resA, resB] = await Promise.all([
          axios.post("/api/DealerProduct/GetProductListForDealer", null, {
            headers: {
              Authorization: `Bearer ${""}`,
              "Content-Type": "application/json",
            },
            params: { member_id: member.id },
          }),
          axios.post("/api/DealerProduct/GetProductClassListByMemberId", null, {
            headers: {
              Authorization: `Bearer ${""}`,
              "Content-Type": "application/json",
            },
            params: { member_id: member.id },
          }),
        ]);

        console.log(resA.data);
        console.log(resB.data);

        //取得商品資料
        if (resA.data.success) {
          productListJson.value = resA.data.productList;
          all_productListJson.value = resA.data.productList; // 篩選用，先儲存所有商品
          totalCount.value = resA.data.totalCount; //計算totalPage
        }
        //取得分類資料
        if (resB.data.success) {
          product_class_listJson.value = resB.data.value;
        }
      } catch (error) {
        console.log(error);
      } finally {
        $.unblockUI();
      }
    };

    // 分類篩選時
    sel_product_class_list = (_sel_class_name) => {
      console.log(_sel_class_name);
      if (_sel_class_name == "") return;
      if (_sel_class_name == "all") {
        currentPage.value = 1;
        keep_class_id.value = "init";
        keep_class_name.value = "";
        //pageStart.value = 0; pageEnd.value = 0;
        productListJson.value = all_productListJson.value;
        return;
      }

      // 前端 filter，不打後端
      currentPage.value = 1;
      keep_class_id.value = "local"; // ← 新增狀態
      keep_class_name.value = _sel_class_name;
      productListJson.value = all_productListJson.value.filter((item) => {
        const matched = item.product_class.find(
          (c) => c.ClassName === _sel_class_name,
        );
        return matched && matched.ClassChecked === true;
      });

      //const member = JSON.parse(localStorage.getItem('member'));
      //if (member == null) return;

      //blockUI();
      //axios({
      //    method: 'post',
      //    url: '/api/DealerProduct/QueryProductClassForDealer',
      //    headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'application/json' },
      //    params: { member_id: member.id, class_name: _sel_class_name }
      //}).then((response) => {
      //    $.unblockUI();
      //    console.log(response.data);
      //    if (response.data.success) {
      //        keep_class_name.value = _sel_class_name;
      //        keep_class_id.value = 'class';
      //        //init var
      //        currentPage.value = 1;
      //        //pageStart.value = 0; pageEnd.value = 0;

      //        //console.log(response.data.productList);

      //        //tmp_productListJson.value = response.data.productList;

      //    }
      //    else {
      //        alert(response.data.msg);
      //    }

      //}).catch((function (error) {
      //    $.unblockUI();
      //    console.log(error);
      //})).finally(() => {
      //    console.log('完成');
      //});

      //var ary = [];
      //tmp_productListJson.value.forEach(x => {
      //    console.log(x.product_class.length);
      //    if (x.product_class.length > 0) {
      //        x.product_class.forEach(y => {
      //            if (y.ClassName == _sel_class_name && y.ClassChecked) {
      //                ary.push(x);
      //            }
      //        });
      //    }

      //});
      //console.log(ary);
      //productListJson.value = ary;
    };

    sel_up_down_class_list = (_sel_up_down) => {
      //console.log(_sel_up_down);
      if (_sel_up_down == "") return;
      if (_sel_up_down == "all") {
        currentPage.value = 1;
        keep_class_id.value = "init";
        keep_class_name.value = "";
        //pageStart.value = 0; pageEnd.value = 0;
        productListJson.value = all_productListJson.value;
        return;
      }

      var ary = [];
      tmp_productListJson.value.forEach((x) => {
        if (_sel_up_down == "up") {
          if (x.product_status) ary.push(x);
        } else if (_sel_up_down == "down") {
          if (!x.product_status) ary.push(x);
        }
      });
      //console.log(ary);

      productListJson.value = ary;
    };

    query = (_query_value) => {
      //console.log(_query_value);

      //若搜尋為空值，則顯示全部
      if (_query_value == "") {
        currentPage.value = 1;
        keep_class_id.value = "init"; // init(顯示所有商品) or class(依分類篩選)
        keep_class_name.value = ""; //紀錄目前分類是哪個名稱 換頁時 _getClassForPage 需要帶這個值去打後端
        productListJson.value = all_productListJson.value;
        return;
      }

      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;
      //console.log(member.id);

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/GetProductListForDealer",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: { member_id: member.id, query_value: _query_value },
      })
        .then((response) => {
          $.unblockUI();
          //console.log(response.data);
          if (response.data.success) {
            productListJson.value = response.data.productList;
            tmp_productListJson.value = response.data.productList;
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

    initQuill = () => {
      const normalizeVideoSize = (input, allowPercent) => {
        if (!input) return "";
        const value = input.toString().trim();
        if (value === "") return "";
        if (/^\d+$/.test(value)) return value;
        if (/^\d+px$/.test(value)) return value.replace("px", "");
        if (allowPercent && /^\d+%$/.test(value)) return value;
        return "";
      };

      const applyVideoSize = (videoIndex, widthInput, heightInput) => {
        const width = normalizeVideoSize(widthInput, true);
        const height = normalizeVideoSize(heightInput, false);

        if (width !== "")
          quill.formatText(videoIndex, 1, "width", width, "user");
        if (height !== "")
          quill.formatText(videoIndex, 1, "height", height, "user");
      };

      const toEmbedVideoUrl = (rawUrl) => {
        const value = (rawUrl || "").toString().trim();
        if (value === "") return "";
        try {
          const url = new URL(value);
          const host = url.hostname.replace(/^www\./i, "").toLowerCase();
          let videoId = "";

          if (host === "youtube.com" || host === "m.youtube.com") {
            if (url.pathname === "/watch") {
              videoId = url.searchParams.get("v") || "";
            } else if (url.pathname.indexOf("/shorts/") === 0) {
              videoId = url.pathname.split("/shorts/")[1].split("/")[0];
            } else if (url.pathname.indexOf("/embed/") === 0) {
              videoId = url.pathname.split("/embed/")[1].split("/")[0];
            }
          } else if (host === "youtu.be") {
            videoId = url.pathname.replace(/^\/+/, "").split("/")[0];
          }

          if (videoId) return "https://www.youtube.com/embed/" + videoId;
        } catch (e) {}
        return value;
      };

      var toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["link", "video"],
        ["blockquote", "code-block"],

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }], // superscript/subscript
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ direction: "rtl" }], // text direction

        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"], // remove formatting button
      ];

      quill = new Quill("#editor", {
        //debug: 'info',
        modules: {
          imageResize: {
            //Add
            displayStyles: {
              //Add
              backgroundColor: "black",
              border: "none",
              color: "white",
            },
            modules: ["Resize", "DisplaySize", "Toolbar"], //Add
          },
          toolbar: toolbarOptions,
        },
        theme: "snow",
        placeholder: "5000字內容...",
        //readOnly: true,
        handlers: {
          image: function () {
            //alert(12);
            document.getElementById("getFile").click();
          },
          imageResize: {},
        },
      });

      const toolbar = quill.getModule("toolbar");
      if (toolbar) {
        toolbar.addHandler("video", function () {
          const range = quill.getSelection(true) || {
            index: quill.getLength(),
            length: 0,
          };
          const inputUrl = prompt("請輸入 YouTube 影片網址");
          if (!inputUrl) return;
          const embedUrl = toEmbedVideoUrl(inputUrl);
          if (!embedUrl) return;

          const widthInput = prompt(
            "請輸入影片寬度（例如：560 或 100%）",
            "560",
          );
          const heightInput = prompt("請輸入影片高度（例如：315）", "315");

          quill.insertEmbed(range.index, "video", embedUrl, "user");
          quill.setSelection(range.index + 1, 0, "silent");

          applyVideoSize(range.index, widthInput, heightInput);
        });
      }
    };

    //編輯商品
    showEditProduct = (v) => {
      _randomString.value = ""; //init
      console.log(v);
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/GetProduct",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: { product_id: v.product_id },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            $("#add-product-modal").modal("show");
            productJson.value = response.data.product;
            //quill
            if (productJson.value.product_desc !== null)
              quill.setContents(JSON.parse(productJson.value.product_desc));
            else quill.setContents(""); //init

            //console.log(productJson.value.product_desc);
            //show image
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
            //check show upload image
            if (image_product_1.value != "")
              showProductUploadDiv_1.value = false;
            else showProductUploadDiv_1.value = true;

            if (
              image_product_2.value == "" ||
              image_product_3.value == "" ||
              image_product_4.value == "" ||
              image_product_5.value == ""
            ) {
            } else {
            }
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

    //置頂
    toFirstUp = (_product_id) => {
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/ToFirstUp",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: { product_id: _product_id },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            alert("置頂成功");
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

    addProductSpec = () => {
      productJson.value.product_spec.push({
        name: "",
        qty: 0,
        cash: 0,
        car_checked: false,
        home_checked: true,
      });
      console.log(productJson.value.product_spec);
    };
    delProductSpec = (_index) => {
      productJson.value.product_spec.splice(_index, 1);
    };

    onMounted(() => {
      if (member.value == null) {
        alert("請先登入");
        window.location.href = "../Home/Index";
        return;
      }

      if (!member.value.authority_mall) {
        alert("請先開通商城");
        window.location.href = "../Home/Index";
        return;
      }

      image1_path.value = "";
      image_product_1.value = "";
      image_product_2.value = "";
      image_product_3.value = "";
      image_product_4.value = "";
      image_product_5.value = "";
      showUploadDiv.value = true;
      showProductUploadDiv_1.value = true;
      showProductUploadDiv_1.value = true;

      _getDealer();

      //按下tab 商品列表
      $("#myTab").on("shown.bs.tab", function (e, ui) {
        //console.log(e.target.id);
        switch (e.target.id) {
          case "productList-tab": //商品列表
            sel_class_name.value = "";
            sel_up_down.value = "";
            keep_class_name.value = "";
            keep_class_id.value = "init";
            _getProductList();
            break;
          case "productClass-tab": //分類管理
            _getProductClass();
            break;

          default:
        }
      });

      return;

      //------------------------------
      //自訂日期 menu hide
      //$("#selectDate-modal").on("hide.bs.modal", function (e) {
      //    selected.value = "";//init
      //});
      //_getOrder('0', '1911/01/01', '2028/12/31');//init today 白吃user改100年
    });

    //選擇日期
    //change_date = (_selected) => {
    //    switch (_selected) {
    //        case '1':
    //        case '2':
    //        case '3':
    //        case '4':
    //        case '5':
    //            _getOrder(_selected, '', '');
    //            break;
    //        case '6':
    //            show_selectDate.value = true;
    //            _changeDate();
    //            selected_date.value = "";//init
    //            break;
    //        default:
    //    }
    //};

    //顯示日期menu
    //_changeDate = () => {
    //    //var a = date_s.getFullYear() + '/' + ('0' + (date_s.getMonth() + 1)).slice(-2) + '/' + ('0' + date_s.getDate()).slice(-2);
    //    //console.log(a);

    //    //init date_s
    //    var date_s = new Date();
    //    date_s.setDate(date_s.getDate() - 3600);
    //    //init date_e
    //    var date_e = new Date();
    //    //date_e.setDate(date_e.getDate());

    //    var optional_config_s = {
    //        enableTime: false,
    //        dateFormat: "Y/m/d",
    //        disableMobile: true,
    //        maxDate: "today",
    //        minDate: "2000/01/05",
    //        mode: 'range',
    //        //defaultDate: '2024/01/01 to 2024/01/25' //date_s.getFullYear() + '/' + ('0' + (date_s.getMonth() + 1)).slice(-2) + '/' + ('0' + date_s.getDate()).slice(-2)
    //        defaultDate: date_s.getFullYear() + '/' + ('0' + (date_s.getMonth() + 1)).slice(-2) + '/' + ('0' + date_s.getDate()).slice(-2) + ' to ' +
    //            date_e.getFullYear() + '/' + ('0' + (date_e.getMonth() + 1)).slice(-2) + '/' + ('0' + date_e.getDate()).slice(-2)
    //    };

    //    //init
    //    date_value.value = optional_config_s.defaultDate;
    //    $("#datetimepicker").flatpickr(optional_config_s);
    //};

    //自訂日期查詢
    //selfDateQuery = (_date_value) => {
    //    //console.log(_date_value);

    //    if (_date_value == '') return;

    //    //同一天
    //    if (_date_value.indexOf(' to ') < 0) {
    //        _getOrder('6', _date_value, _date_value);
    //        show_selectDate.value = false;
    //    }
    //    else {//區間
    //        var arr = _date_value.split(' to ');
    //        _getOrder('6', arr[0], arr[1]);
    //        show_selectDate.value = false;
    //    }
    //};

    //選擇狀態
    //var json_tmp = [];
    //change_status = (_selected) => {
    //    if (_selected == '') return;

    //    //clear json
    //    json_tmp.length = 0;
    //    jsonShow.value = [];
    //    //move to tmp json
    //    if (_selected == 9) {//all
    //        jsonShow.value = jsonData.value;
    //    }
    //    else {// not all
    //        jsonData.value.forEach(function (item) {
    //            if (item.trade_status == _selected) json_tmp.push(item);
    //        });
    //        jsonShow.value = json_tmp;//binding
    //    }

    //    //reset init
    //    totalPage;
    //    pageStart;
    //    pageEnd;
    //    setPage(1);//回到預設第一頁

    //};

    //排序
    //changeSort = (type, num_type) => {
    //    //console.log(type);
    //    var _isReverse;
    //    //set icon
    //    switch (type) {
    //        case 'kc_order_no':
    //            isReverse.kc_order_no = isReverse.kc_order_no ? false : true;
    //            _isReverse = isReverse.kc_order_no;
    //            break;
    //        case 'cust_name':
    //            isReverse.cust_name = isReverse.cust_name ? false : true;
    //            _isReverse = isReverse.cust_name;
    //            break;
    //        case 'kc_item_desc':
    //            isReverse.kc_item_desc = isReverse.kc_item_desc ? false : true;
    //            _isReverse = isReverse.kc_item_desc;
    //            break;
    //        case 'kc_loan_amt':
    //            isReverse.kc_loan_amt = isReverse.kc_loan_amt ? false : true;
    //            _isReverse = isReverse.kc_loan_amt;
    //            break;
    //        case 'date':
    //            isReverse.date = isReverse.date ? false : true;
    //            _isReverse = isReverse.date;
    //            break;
    //        default:
    //    }

    //    console.log(pageStart.value);
    //    console.log(pageEnd.value);
    //    //get ui items
    //    var sort_json = jsonShow.value.slice(pageStart.value, pageEnd.value);

    //    //文字或數字排序
    //    var sorts = sort_json.sort(function (a, b) {
    //        if (num_type == 'str') {
    //            if (_isReverse) return a[type].localeCompare(b[type]);
    //            else return b[type].localeCompare(a[type]);
    //        }
    //        else {
    //            if (_isReverse) return a[type] - b[type];
    //            else return b[type] - a[type];
    //        }
    //    });
    //    //splice 插回
    //    var start_index = pageStart.value;
    //    for (var i = 0; i < sorts.length; i++) {

    //        jsonShow.value.splice(start_index, 1, sorts[i]);
    //        start_index++;
    //    }

    //};

    //顯示確認刪除
    //clearOrder = (_v) => {
    //    confirm.value = _v;
    //    //confirm.order_no = _v.kc_order_no;
    //    $('#clear_modal').modal('show');

    //};

    //確認刪除
    //confirmDelete = (_confirm) => {

    //    var member = JSON.parse(localStorage.getItem('member'));
    //    blockUI_txt();
    //    axios({
    //        method: 'post',
    //        url: '/api/Cms/DeleteQueryOrder_Transaction',
    //        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'multipart/form-data' },
    //        params: { member_id: member.id, order_no: _confirm.kc_order_no, price: _confirm.kc_loan_amt }
    //    }).then((response) => {
    //        $.unblockUI();
    //        console.log(response.data);
    //        if (response.data.success) {
    //            $('#clear_modal').modal('hide');
    //            _confirm.trade_status = "1";//取消訂單
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
    //};

    //關鍵字查詢
    //seoQuery = (_seoInput) => {
    //    if (_seoInput == '') return;

    //    var member = JSON.parse(localStorage.getItem('member'));
    //    blockUI();
    //    axios({
    //        method: 'post',
    //        url: '/api/Cms/SeoQuery',
    //        headers: { Authorization: `Bearer ${''}`, 'Content-Type': 'multipart/form-data' },
    //        params: { member_id: member.id, seo_string: _seoInput, type: 1 }
    //    }).then((response) => {
    //        $.unblockUI();
    //        console.log(response.data);
    //        if (response.data.success) {
    //            jsonShow.value = response.data.value;
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
    //};

    setProductStatus = (_v) => {
      console.log(_v);
      console.log(_v.product_status);
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/SetProductStatus",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: {
          product_id: _v.product_id,
          product_status: _v.product_status ? "" : "*",
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
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

    _getProductClass = () => {
      var member = JSON.parse(localStorage.getItem("member"));
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/GetProductClassList",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: { store_no: member.store_no },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            productClassJson.value = response.data.value;
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

    addClass = (className) => {
      console.log(className);
      if (className == "" || typeof className == "undefined") return;

      var member = JSON.parse(localStorage.getItem("member"));
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/AddProductClass",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: {
          member_id: member.id,
          store_no: member.store_no,
          class_name: className,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            productClassJson.value = response.data.value;
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
    editClass = (_v) => {
      console.log(_v);
      productClass.value = _v;
      $("#product_class_modal").modal("show");
    };
    confirmEditProductClass = (productClassName) => {
      console.log(productClassName);
      console.log(productClass.value);
      if (productClassName == "" || typeof productClassName == "undefined")
        return;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/EditProductClass",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: {
          product_class_id: productClass.value.product_class_id,
          class_name: productClassName,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            $("#product_class_modal").modal("hide");
            productClassJson.value = response.data.value;
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
    delClass = (_v) => {
      console.log(_v);
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerProduct/DelProductClass",
        headers: {
          Authorization: `Bearer ${""}`,
          "Content-Type": "application/json",
        },
        params: { product_class_id: _v.product_class_id },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            productClassJson.value = response.data.value;
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

    selClass = (_v) => {
      console.log(_v);
      _v.ClassChecked = _v.ClassChecked ? false : true;
    };

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
    };
  },
};

Vue.createApp(App).mount("#app");

$(window).on("load", function () {
  var member = JSON.parse(localStorage.getItem("member"));
  if (member == null || member.login_ok_msg != "*" || member.role != "dealer") {
    window.location.href = "../Home/Index";
    return;
  }
});
