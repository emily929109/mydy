const {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  computed,
  onUpdated,
  onBeforeUnmount,
  onDeactivated,
  onBeforeMount,
  onBeforeUpdate,
} = Vue;

var baseUrl = window.location.href.indexOf("localhost") == -1 ? "/DuDuPay" : "";
const dudu_url = "https://www.dudupay.com.tw/";

const Appz = {
  setup() {
    console.log("headerapp");
    //const counterStore = useCounterStore();

    const member = ref(JSON.parse(localStorage.getItem("member")));

    const setMenu = reactive({
      member_1: false,
      dealer_1: false,
      showProfile: false,
      loginHide: true,
    });
    const showMenuBudge = ref(false);
    const showTeacherBudge = ref(false);
    const showNotifyBudge = ref(false);
    const notifyBudge = ref("");
    const teacherBudge = ref("");
    const menuBudge = ref("");
    const authority = reactive({
      query: false,
      cashApply: false,
      admin: false,
      mall: false,
      member_no: "",
    });
    const user = reactive({ member_no: "" });

    const cartCount = ref(0); // 購物車總數量
    const cartItems = ref([]); // 購物車項目列表
    const headerCartItems = computed(() => {
      return cartItems.value.flatMap((dealer) => dealer.cars);
    });

    axios.defaults.headers.common["Authorization"] = `Bearer ${""}`;

    //捕捉 401錯誤

    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.log(error.response);
        if (error.response.status === 401) {
          var member = JSON.parse(localStorage.getItem("member"));

          var _member_role = member.role;
          alert(error.response.data.Message);
          //localStorage.clear();

          localStorage.clear();
          setMenu.member_1 = false; //top menu
          setMenu.dealer_1 = false; //top menu
          //setMenu.loginHide
          menuLeftApp.clearMenuForRole(); //left menu
          buttom_menuApp.clearMenuForRole(); //buttom menu
          setMenu.showProfile = false;

          //show login
          if (_member_role != "member")
            $("#authentication-modal-2").modal("show");
          else $("#authentication-modal").modal("show");
        }
        console.log(error);
        return error;
      },
    );

    onMounted(() => {
      // 監聽 purchase.js 加入購物車後的更新事件
      window.addEventListener("cartUpdated", (event) => {
        //console.log('event.detail：', event.detail);
        cartItems.value = event.detail; // 陣列中有物件
        cartCount.value = cartItems.value.reduce((total, dealer) => {
          return (
            total +
            dealer.cars.reduce((sum, car) => sum + (car.buy_qty || 0), 0)
          );
        }, 0);
        //console.log(cartCount.value)
      });

      if (member.value != null && member.value.login_ok_msg == "*") {
        setMenuForRole(member.value.role);
        //特約商權限設定
        if (member.value.role == "dealer") {
          setAuthorityShowItem(member.value.authoritys);
        }

        // 從localstorage 讀取購物車資料
        if (
          member.value.role == "member" &&
          member.value.cart &&
          member.value.cart.success
        ) {
          console.log(member.value.cart.groups);
          window.dispatchEvent(
            new CustomEvent("cartUpdated", {
              detail: member.value.cart.groups,
            }),
          );
        }
      }

      /* --============== 購物車 開始 ================--*/

      // 點空白處收起購物車 dropdown
      document.addEventListener("click", (e) => {
        const wrap = document.querySelector(".header-cart-wrap");
        //若click不在購物車範圍內

        if (wrap != null && !wrap.contains(e.target)) {
          showCartDropdown.value = false;
        }
      });

      /* --============== 購物車 結束 ================--*/

      //if (window.location.href == 'http://localhost:14908/Home/FuckIndex' || window.location.href == 'http://localhost:14908/Home/Index') return;

      //未登入時
      //if (member.value === null) {
      //    window.location.href = '../Home/Login'; return;
      //}

      //不同天時 clear localStorage  表示localstorage 一天後要再重登
      //var time_now = (new Date()).getDate();
      //if ((time_now != member.value.date)) {
      //    localStorage.clear();
      //    window.location.href = '../Home/Login'; return;
      //}

      //顯示 budge
      //if (member.value.notifyReaded != '*') {
      //    showNotifyBudge.value = true;
      //    notifyBudge.value = '1';
      //}
      //if (member.value.menuReaded != '*') {
      //    showMenuBudge.value = true;
      //    menuBudge.value = '2';
      //}
      //if (member.value.teacherReaded != '*') {
      //    showTeacherBudge.value = true;
      //    teacherBudge.value = '1';
      //}

      //籌碼分析....
      //if (window.location.pathname.toLowerCase().indexOf('porfolio') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('profile') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('softuse') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('teacher') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('multistock') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('stocktime') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('usershare') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('videolist') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('videoplayer') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('trade') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('trade2') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('stock_max20') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('fundam') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('changepw') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('teststockcharts') > 0 ||
      //    window.location.pathname.toLowerCase().indexOf('article') > 0
      //)
      //    return;

      //_signalR();
    });

    //set role menu
    setMenuForRole = (role) => {
      //alert('header');
      //console.log(role);
      //console.log(setMenu);
      setMenuRole(role, setMenu);
      //setMenu.showProfile = true;

      var member = JSON.parse(localStorage.getItem("member"));
      //console.log(member);
      user.member_no = member.kc_member_no; //會員編號
    };
    //clear role menu
    clearMenuForRole = () => {
      //console.log(setMenu)
      clearMenuRole(setMenu);
      user.member_no = ""; //會員編號
    };

    onBeforeUnmount(() => {
      alert("onBeforeUnmount");
    });

    //文件
    //https://docs.microsoft.com/zh-tw/aspnet/signalr/overview/guide-to-the-api/hubs-api-guide-javascript-client
    _signalR = () => {
      ////(1)連線 signalR hub
      $.connection.hub.logging = true; //show log
      window.jQuery.connection.hub.url =
        "http://192.168.78.21/SaiRservice/SignalR";
      //window.jQuery.connection.hub.url = "http://www.ucoco.idv.tw:5168/SaiRservice/SignalR";
      //window.jQuery.connection.hub.url = "http://localhost:2151/SignalR";

      //(2)收到 server  data and binning
      var memberHub = $.connection.memberHub;
      //同帳號登入 清除 localStorage(如果client 斷線狀態 會未能清除 localStorage 還能用)
      memberHub.client.checkUser = function (data) {
        //console.log('clear storage');
        localStorage.clear();
        $("#tooltippopovers").modal("show");
      };

      //(3)登入 signalR server
      $.connection.hub
        .start({ transport: ["webSockets", "longPolling"] })
        .done(function () {
          //var today = new Date();
          //var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

          //console.log('start:' + time);
          //console.log('header Now connected, connection ID=' + $.connection.hub.id);
          //console.log("Connected, transport = " + $.connection.hub.transport.name);
          //console.log(window.location.pathname);///products/search.php '/'
          //console.log(window.location.search);//?q = ipad   ''
          //console.log(window.hash); //#featured  undefined

          //set user to signalR
          //var member = JSON.parse(localStorage.getItem('member'));
          if (member.value !== null) {
            var pageName;
            var href = window.location.pathname
              .trim()
              .toLowerCase()
              .replace("/DuDuPay", "");
            //console.log(href);
            if (
              href == "" ||
              href == "/home/index" ||
              href == "/home" ||
              href == "/home/" ||
              href == "/"
            )
              pageName = "/home/index";
            else pageName = href;
            memberHub.server.setUser(
              $.connection.hub.id,
              member.value.name,
              pageName,
            );
          }
        })
        .fail(function () {
          console.log("Could not Connect!");
        });

      //偵測中斷連接的原因 只要斷線就會被觸發
      $.connection.hub.disconnected(function () {
        if ($.connection.hub.lastError) {
          //console.log("斷線重連: " + $.connection.hub.lastError.message);

          //----重連線
          $.connection.hub
            .start({ transport: ["webSockets", "longPolling"] })
            .done(function () {
              //var today = new Date();
              //var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

              //console.log('斷線重連 ID=' + $.connection.hub.id + ' ' + time);
              //console.log("Connected, transport = " + $.connection.hub.transport.name);

              //set user to signalR
              //var member = JSON.parse(localStorage.getItem('member'));
              if (member.value !== null) {
                var pageName;
                var href = window.location.pathname
                  .trim()
                  .toLowerCase()
                  .replace("/DuDuPay", "");
                if (
                  href == "" ||
                  href == "/home/index" ||
                  href == "/home" ||
                  href == "/home/" ||
                  href == "/"
                )
                  pageName = "/home/index";
                else pageName = href;
                memberHub.server.setUser(
                  $.connection.hub.id,
                  member.value.name,
                  pageName,
                );
              }
            })
            .fail(function () {
              console.log("Could not Connect!");
            });
        }
      });

      // $.connection.hub.starting(function () {
      //     console.log('starting');
      // });

      //收到Tick 就fire received event
      $.connection.hub.received(function () {
        //console.log('已重新連上線');
      });

      //連線變慢時觸發
      $.connection.hub.connectionSlow(function () {
        console.log("連線變慢");
        //alert('網路連線變慢');
        //notifyUserOfConnectionProblem(); // Your function to notify user.
      });

      //意外斷線時會觸發
      //var tryingToReconnect = false;
      $.connection.hub.reconnecting(function () {
        console.log("意外斷線");
        //alert('意外斷線');
        //  tryingToReconnect = true;
      });

      ////重新連接上後會觸發
      // $.connection.hub.reconnected(function () {
      //     console.log('reconnected');
      // //    tryingToReconnect = false;
      // });

      // //只要狀態有改變就會觸發
      // $.connection.hub.stateChanged(function () {
      //     console.log('stateChanged');
      // });
    };

    //登出
    const Logout = () => {
      localStorage.clear();
      sessionStorage.clear();
      setMenu.member_1 = false; //top menu
      setMenu.dealer_1 = false; //top menu
      menuLeftApp.clearMenuForRole(); //left menu
      buttom_menuApp.clearMenuForRole(); //buttom menu
      setMenu.showProfile = false;
      alert("您已經登出");

      window.location.href = "../Home/Index";
    };

    //登出
    const Link_Logout = () => {
      localStorage.removeItem("member");
      setMenu.member_1 = false; //top menu
      setMenu.dealer_1 = false; //top menu
      menuLeftApp.clearMenuForRole(); //left menu
      buttom_menuApp.clearMenuForRole(); //buttom menu
      setMenu.showProfile = false;
    };

    //顯示文章
    showMenu = () => {
      $("#myModalMenu").modal("toggle");

      if (showMenuBudge.value) _setBudge(2);

      //set local storage
      //var member = JSON.parse(localStorage.member);
      member.value.menuReaded = "*";
      localStorage.setItem("member", JSON.stringify(member.value)); //put the object back

      showMenuBudge.value = false;
      menuBudge.value = "";
    };
    //顯示老師盤勢分析
    showTeacher = () => {
      $("#myModalTeacher").modal("toggle");

      if (showTeacherBudge.value) _setBudge(3);

      //set local storage
      //var member = JSON.parse(localStorage.member);
      member.value.teacherReaded = "*";
      localStorage.setItem("member", JSON.stringify(member.value)); //put the object back

      showTeacherBudge.value = false;
      teacherBudge.value = "";
    };

    //notify 標為已讀
    //showNotify = () => {
    //    _setBudge(1);

    //    //set local storage
    //    //var member = JSON.parse(localStorage.member);
    //    member.value.notifyReaded = '*';
    //    localStorage.setItem("member", JSON.stringify(member.value));  //put the object back

    //    showNotifyBudge.value = false;
    //    notifyBudge.value = '';
    //};

    //set budge readed
    _setBudge = (_type) => {
      axios({
        method: "post",
        url: baseUrl + "/api/Member/Readed/",
        headers: { "Content-Type": "application/json" },
        params: { name: member.value.name, type: _type },
      })
        .then((response) => {})
        .catch(function (error) {})
        .finally(() => {});
    };

    //showLoginMenu = (role) => {
    //    console.log(role);
    //    $('#authentication-modal').modal('show');
    //};

    //setAuthorityShowItem = (query, cashApply, admin, mall) => {
    //    //console.log(query);

    //    authority.query = query;
    //    authority.cashApply = cashApply;
    //    authority.admin = admin;
    //    authority.mall = mall;

    //}

    setAuthorityShowItem = (authoritysArray) => {
      console.log(authoritysArray);
      // 若後端傳回的 authoritys 是 null 或 undefined，則為空陣列
      const authList = authoritysArray || [];

      // 若找不到該項目則 false
      authority.query =
        authList.find((a) => a.authority === "訂單查詢")?.isCheck || false;
      authority.cashApply =
        authList.find((a) => a.authority === "申請撥款")?.isCheck || false;
      authority.admin =
        authList.find((a) => a.authority === "角色權限")?.isCheck || false;
      authority.mall =
        authList.find((a) => a.authority === "商品管理")?.isCheck || false;
    };

    /* --============== 購物車 開始 ================--*/
    const showCartDropdown = ref(false);

    const toggleCartDropdown = () => {
      showCartDropdown.value = !showCartDropdown.value;
    };

    headerCartClick = () => {
      const member = JSON.parse(localStorage.getItem("member"));
      if (member == null) {
        $("#authentication-modal").modal("show");
        return;
      }

      // 目前頁面是否為購物頁且非orderpurchase (選期數頁)
      const isAtShoppingPage =
        window.location.pathname.toLowerCase().includes("purchase") &&
        !window.location.pathname.toLowerCase().includes("orderpurchase");

      if (isAtShoppingPage) {
        // 在購物頁 -> 更換網址與瀏覽器歷史紀錄
        const url = new URL(window.location);
        url.searchParams.set("view", "cart");
        window.history.pushState({ view: "cart" }, "", url);

        // 觸發 purchase.js中的window.onpopstate 並改變視圖
        window.dispatchEvent(new Event("popstate"));
        showCartDropdown.value = false;
      } else {
        // 在其他頁面 -> 直接跳轉
        window.location.href = dudu_url + "Home/Purchase?view=cart";
        //console.log('不同頁，執行跳轉重整');
        //window.dispatchEvent(new Event('popstate'));
        showCartDropdown.value = false;
      }
    };

    /* --============== 購物車 結束 ================--*/
    /* --============== 系統總後台 開始 ================--*/
    const isAdmin = ref(true);

    /* --============== 系統總後台 結束 ================--*/

    return {
      Logout,
      Link_Logout,
      showMenu,
      showNotifyBudge,
      notifyBudge,
      menuBudge,
      showTeacherBudge,
      //showNotify,
      showMenuBudge,
      teacherBudge,
      showTeacher,
      setMenuForRole,
      clearMenuForRole,
      setMenu, //showLoginMenu
      setAuthorityShowItem,
      authority,
      user,
      //counterStore,
      showCartDropdown,
      toggleCartDropdown,
      headerCartClick,
      cartCount,
      cartItems,
      headerCartItems,
      isAdmin,
    };
  },
};

//const header_app = Vue.createApp(Appz).use(pinia).mount("#headerapp");
const header_app = Vue.createApp(Appz).mount("#headerapp");

$(window).on("load", function () {
  //註冊過程/公司形象 不顯示登入頁
  var url = window.location.pathname.toLowerCase();
  //alert(url);
  //console.log(url);
  if (
    url.indexOf("register") > 0 ||
    url.indexOf("uploadfile") > 0 ||
    url.indexOf("memberinfo") > 0 ||
    url.indexOf("membersign2") > 0 ||
    url.indexOf("membersign2_updmobile") > 0 ||
    url.indexOf("membersign2_amountup") > 0 ||
    url.indexOf("membersign2_updidno") > 0 ||
    url.indexOf("twcaverify_1") > 0 ||
    url.indexOf("twcaverify_2") > 0 ||
    url.indexOf("twcaverify_3") > 0 ||
    url.indexOf("forget") > 0 ||
    url.indexOf("index") > 0 ||
    url == "" ||
    url == "/home/index" ||
    url == "/home" ||
    url == "/home/" ||
    url == "/" || //index
    url.indexOf("news") > 0 ||
    url.indexOf("about") > 0 ||
    url.indexOf("faq") > 0 ||
    url.indexOf("borrow_1") > 0 ||
    url.indexOf("borrow_2") > 0 ||
    url.indexOf("eanaccount") > 0 ||
    url.indexOf("ean88") > 0 ||
    url.indexOf("ean89") > 0 ||
    url.indexOf("largetosmall") > 0 ||
    url.indexOf("testmembersign2") > 0 ||
    //url.indexOf('smalltolargehome') > 0 ||
    url.indexOf("ean" > 0) ||
    url.indexOf("meetingminutes" > 0) ||
    url.indexOf("testyoutube" > 0) ||
    url.indexOf("genericerrorpage" > 0) ||
    url.indexOf("membercenter" > 0) ||
    url.indexOf("servicepact") > 0
  )
    return;

  var member = JSON.parse(localStorage.getItem("member"));
  if (member == null || member.login_ok_msg != "*") {
    $("#authentication-modal").modal("show");
  }
});

window.mobilecheck = function () {
  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4),
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
