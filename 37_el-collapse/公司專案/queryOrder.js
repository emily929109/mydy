const App = {
  setup() {
    //----page
    const perpage = ref(10); //一頁的資料數
    const currentPage = ref(1);
    const disabled_prev = ref(true);
    const disabled_next = ref(false);
    const totalPage = computed(() => {
      var total_page = Math.ceil(jsonShow.value.length / perpage.value);
      if (total_page == 1) {
        disabled_prev.value = true;
        disabled_next.value = true;
      }
      return total_page;
    });
    const pageStart = computed(() => {
      return (currentPage.value - 1) * perpage.value;
      //取得該頁第一個值的index
    });
    const pageEnd = computed(() => {
      return currentPage.value * perpage.value;
      //取得該頁最後一個值的index
    });
    //const setPage = (page) => {
    //    //總頁=1
    //    if (totalPage.value == 1) {
    //        disabled_prev.value = true;
    //        disabled_next.value = true;
    //    }
    //    else if (page == 1) {
    //        disabled_prev.value = true;
    //        disabled_next.value = false;
    //    }
    //    else if (page == totalPage.value) {
    //        disabled_prev.value = false;
    //        disabled_next.value = true;
    //    }
    //    else {
    //        disabled_prev.value = false;
    //        disabled_next.value = false;
    //    }
    //    currentPage.value = page;
    //};
    const isReverse = reactive({
      kc_order_no: true,
      cust_name: true,
      kc_item_desc: true,
      kc_loan_amt: true,
      date: true,
    });

    //-----------------------------------------------------
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const selected_date = ref("");
    const selected_status = ref("");
    const selected_send_type = ref("");
    const date_value = ref("");
    const show_selectDate = ref(false);
    const jsonData = ref({});
    const jsonShow = ref([]);
    const confirm = ref({});
    const seoInput = ref("");
    const m = reactive({ dealer_acc: "", dealer_role: "" });
    //取貨資訊 展開狀態，key: kc_order_no
    const expandedOrders = reactive({});
    const togglePickupInfo = (order_no) => {
      expandedOrders[order_no] = !expandedOrders[order_no];
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
      //_getListForPage();
    };

    _getOrder = (date_type, date_s, date_e) => {
      selected_status.value = ""; //init
      selected_send_type.value = ""; //init
      //init query today
      var member = JSON.parse(localStorage.getItem("member"));
      console.log(member);
      if (member == null) return;

      blockUI();
      axios({
        method: "post",
        url: "/api/Cms/QueryOrder",
        headers: { "Content-Type": "application/json" },
        params: {
          date_type: date_type,
          date_s: date_s,
          date_e: date_e,
          type: 1,
        },
      })
        .then((response) => {
          $.unblockUI();
          //init
          jsonData.value.length = 0;
          jsonShow.value.length = 0;
          console.log(response.data);
          if (response.data.success) {
            jsonData.value = response.data.value;
            jsonShow.value = response.data.value;
            //init
            m.dealer_acc = member.dealer_acc;
            m.dealer_role = member.dealer_role;
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

    onMounted(() => {
      //自訂日期 menu hide
      $("#selectDate-modal").on("hide.bs.modal", function (e) {
        selected.value = ""; //init
      });

      //_getOrder('1', '', '');//init today 白吃user改100年
      _getOrder("0", "1911/01/01", "2028/12/31"); //init today 白吃user改100年
    });

    //選擇日期
    change_date = (_selected) => {
      switch (_selected) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          _getOrder(_selected, "", "");
          break;
        case "6":
          show_selectDate.value = true;
          _changeDate();
          selected_date.value = ""; //init
          break;
        default:
      }
    };

    //顯示日期menu
    _changeDate = () => {
      //var a = date_s.getFullYear() + '/' + ('0' + (date_s.getMonth() + 1)).slice(-2) + '/' + ('0' + date_s.getDate()).slice(-2);
      //console.log(a);

      //init date_s
      var date_s = new Date();
      date_s.setDate(date_s.getDate() - 3600);
      //init date_e
      var date_e = new Date();
      //date_e.setDate(date_e.getDate());

      var optional_config_s = {
        enableTime: false,
        dateFormat: "Y/m/d",
        disableMobile: true,
        maxDate: "today",
        minDate: "2000/01/05",
        mode: "range",
        //defaultDate: '2024/01/01 to 2024/01/25' //date_s.getFullYear() + '/' + ('0' + (date_s.getMonth() + 1)).slice(-2) + '/' + ('0' + date_s.getDate()).slice(-2)
        defaultDate:
          date_s.getFullYear() +
          "/" +
          ("0" + (date_s.getMonth() + 1)).slice(-2) +
          "/" +
          ("0" + date_s.getDate()).slice(-2) +
          " to " +
          date_e.getFullYear() +
          "/" +
          ("0" + (date_e.getMonth() + 1)).slice(-2) +
          "/" +
          ("0" + date_e.getDate()).slice(-2),
      };

      //init
      date_value.value = optional_config_s.defaultDate;
      $("#datetimepicker").flatpickr(optional_config_s);
    };

    //自訂日期查詢
    selfDateQuery = (_date_value) => {
      //console.log(_date_value);

      if (_date_value == "") return;

      //同一天
      if (_date_value.indexOf(" to ") < 0) {
        _getOrder("6", _date_value, _date_value);
        show_selectDate.value = false;
      } else {
        //區間
        var arr = _date_value.split(" to ");
        _getOrder("6", arr[0], arr[1]);
        show_selectDate.value = false;
      }
    };

    //選擇狀態
    var json_tmp = [];
    change_status = (_selected) => {
      if (_selected == "") return;

      //clear json
      json_tmp.length = 0;
      jsonShow.value = [];
      //move to tmp json
      if (_selected == 99) {
        //all
        jsonShow.value = jsonData.value;
      } else {
        // not all
        jsonData.value.forEach(function (item) {
          if (item.trade_status == _selected) json_tmp.push(item);
        });
        jsonShow.value = json_tmp; //binding
      }

      //reset init
      totalPage;
      pageStart;
      pageEnd;
      setPage(1); //回到預設第一頁
    };
    //取貨資訊
    change_send_type = (_selected_send_type) => {
      if (_selected_send_type == "") return;
      //clear json
      json_tmp.length = 0;
      jsonShow.value = [];

      //move to tmp json
      if (_selected_send_type == 99) {
        //all
        jsonShow.value = jsonData.value;
      } else {
        // not all
        jsonData.value.forEach(function (item) {
          //console.log(item.send_type);
          //console.log(_selected_send_type);
          if (item.send_type == _selected_send_type) json_tmp.push(item);
        });
        jsonShow.value = json_tmp; //binding
      }

      //console.log(jsonShow.value);

      //reset init
      totalPage;
      pageStart;
      pageEnd;
      setPage(1); //回到預設第一頁
    };

    //排序
    changeSort = (type, num_type) => {
      //console.log(type);
      var _isReverse;
      //set icon
      switch (type) {
        case "kc_order_no":
          isReverse.kc_order_no = isReverse.kc_order_no ? false : true;
          _isReverse = isReverse.kc_order_no;
          break;
        case "cust_name":
          isReverse.cust_name = isReverse.cust_name ? false : true;
          _isReverse = isReverse.cust_name;
          break;
        case "kc_item_desc":
          isReverse.kc_item_desc = isReverse.kc_item_desc ? false : true;
          _isReverse = isReverse.kc_item_desc;
          break;
        case "kc_loan_amt":
          isReverse.kc_loan_amt = isReverse.kc_loan_amt ? false : true;
          _isReverse = isReverse.kc_loan_amt;
          break;
        case "date":
          isReverse.date = isReverse.date ? false : true;
          _isReverse = isReverse.date;
          break;
        default:
      }

      console.log(pageStart.value);
      console.log(pageEnd.value);
      //get ui items
      var sort_json = jsonShow.value.slice(pageStart.value, pageEnd.value);

      //文字或數字排序
      var sorts = sort_json.sort(function (a, b) {
        if (num_type == "str") {
          if (_isReverse) return a[type].localeCompare(b[type]);
          else return b[type].localeCompare(a[type]);
        } else {
          if (_isReverse) return a[type] - b[type];
          else return b[type] - a[type];
        }
      });
      //splice 插回
      var start_index = pageStart.value;
      for (var i = 0; i < sorts.length; i++) {
        jsonShow.value.splice(start_index, 1, sorts[i]);
        start_index++;
      }
    };

    //顯示確認刪除
    clearOrder = (_v) => {
      confirm.value = _v;
      //confirm.order_no = _v.kc_order_no;
      $("#clear_modal").modal("show");
    };

    //確認刪除
    confirmDelete = (_confirm) => {
      var member = JSON.parse(localStorage.getItem("member"));
      blockUI_txt();
      axios({
        method: "post",
        url: "/api/Cms/DeleteQueryOrder_Transaction",
        headers: { "Content-Type": "application/json" },
        params: { order_no: _confirm.kc_order_no, price: _confirm.kc_loan_amt },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            $("#clear_modal").modal("hide");
            _confirm.trade_status = "1"; //取消訂單
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

    //關鍵字查詢
    seoQuery = (_seoInput) => {
      //console.log(_seoInput);
      if (_seoInput == "") return;

      var member = JSON.parse(localStorage.getItem("member"));
      blockUI();
      axios({
        method: "post",
        url: "/api/Cms/SeoQuery",
        headers: { "Content-Type": "application/json" },
        params: { seo_string: _seoInput, type: 1 },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            //reset init
            totalPage;
            pageStart;
            pageEnd;
            setPage(1); //回到預設第一頁

            jsonShow.value = response.data.value;
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

    return {
      perpage,
      currentPage,
      setPage,
      totalPage,
      pageStart,
      pageEnd,
      disabled_prev,
      disabled_next,
      changeSort,
      isReverse, //page
      change_date,
      selected_date,
      date_value,
      show_selectDate,
      jsonShow,
      change_status,
      selected_status,
      selfDateQuery,
      clearOrder,
      confirm,
      confirmDelete,
      seoQuery,
      seoInput,
      m,
      change_send_type,
      selected_send_type,
      displayPages,
      expandedOrders,
      togglePickupInfo,
    };
  },
};

const app = Vue.createApp(App);
app.use(ElementPlus);
app.mount("#app");

$(window).on("load", function () {
  var member = JSON.parse(localStorage.getItem("member"));
  if (member == null || member.login_ok_msg != "*" || member.role != "dealer") {
    window.location.href = "../Home/Index";
    return;
  }
});
