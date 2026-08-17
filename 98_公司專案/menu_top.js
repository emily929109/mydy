const menuApp = {
  setup() {
    //console.log('menu_topApp');
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const u = reactive({
      mobile: "",
      pw: "",
      code: "",
      role: "member",
      mobile2: "",
      pw2: "",
      code2: "",
      role2: "dealer",
    });
    const showPassword = ref(false);
    const showPassword2 = ref(false);
    const pwFieldType = ref("password");
    const pwFieldType2 = ref("password");
    const register_url = ref("");
    const otp_code = ref("");
    const otp_timeout = ref(false);
    const verify_code = ref("");

    showLogin = (member) => {
      if (member == null || member.login_ok_msg != "*")
        $("#authentication-modal").modal("show");
    };

    onMounted(() => {
      //登入頁
      $("#authentication-modal").on("shown.bs.modal", function () {
        options.txt = randomNum(100000, 999999).toString();
        var helper = new writeAuthCode(options);
        //console.log(helper);
        //console.log(helper.options.txt);
      });

      $("#authentication-modal-2").on("shown.bs.modal", function () {
        options2.txt = randomNum(100000, 999999).toString();
        var helper = new writeAuthCode(options2);
        //console.log(helper);
        //console.log(helper.options2.txt);
      });

      //console.log('member', member.value);

      ////send all user notify
      ////header.js 已經做了hub connect
      //var memberHub = $.connection.memberHub;
      //memberHub.client.notify = function (data) {
      //    $('#notifyModal').modal('show');
      //    notifyMsg.value = data[0];
      //};
    });

    Login = (_u) => {
      if (_u.mobile == "" || _u.pw == "") return;
      if (_u.code == "") {
        alert("請輸入驗證碼！");
        return;
      }
      if (_u.code != getCode()) {
        alert("驗證碼輸入錯誤！@_@");
        return;
      }

      if (_u.mobile.length == 4) {
        alert("帳號有誤,您可能使用了「特約商登入」功能");
        return;
      }

      var _login_type = "";
      var dudu_order = JSON.parse(localStorage.getItem("dudu_order"));

      //交易頁面
      var url = window.location.href.toLowerCase();
      if (
        dudu_order != null &&
        (url.indexOf("order_2") != -1 ||
          url.indexOf("order_3") != -1 ||
          url.indexOf("orderapi") != -1)
        //|| url.indexOf('orderpurchase') != -1
      ) {
        if (dudu_order.order_type == "註冊帶訂單") _login_type = "註冊帶訂單";
      } else {
        localStorage.removeItem("dudu_order");
      }

      login(_u.mobile, _u.pw, _u.role, _login_type);
    };

    const login = (_mobile, _pw, _role, _login_type) => {
      $.blockUI({
        baseZ: 99999,
        css: {
          border: "none",
          backgroundColor: "none",
          top: "45%",
          zIndex: "99999",
        },
        overlayCSS: { backgroundColor: "#DCDCDC" },
        message: '<img style="width:4rem;" src="../img/duprocess.gif" />',
      });

      axios({
        method: "post",
        url: "/api/Member/Login",
        headers: { "Content-Type": "application/json" },
        params: {
          mobile: _mobile,
          pw: _pw,
          role: _role,
          browser:
            _getNavigatorVersion() + getAndroidVersion() + "|" + iOSversion(),
          login_type: _login_type,
        },
      })
        .then((response) => {
          $.unblockUI();
          if (response.data.success) {
            if (response.data.needWebAuthn) {
              startWebAuthnLogin();
              return;
            }

            localStorage.removeItem("member");
            localStorage.setItem("member", JSON.stringify(response.data.value));

            //alert(JSON.stringify(response.data.value));
            //(1)註冊未完成 轉址
            if (response.data.value.login_ok_msg != "*") {
              //檢查購物車
              if (
                response.data.value.cart &&
                response.data.value.cart.success
              ) {
                console.log(response.data.value.cart.groups);
                window.dispatchEvent(
                  new CustomEvent("cartUpdated", {
                    detail: response.data.value.cart.groups,
                  }),
                );
              }

              $("#authentication-modal").modal("hide");

              switch (response.data.value.register_step) {
                case 0:
                  $("#regist-notfinsh-modal").modal("show");
                  register_url.value = "/Home/UploadFile";
                  break;
                case 1:
                  $("#regist-notfinsh-modal").modal("show");
                  register_url.value = "/Home/MemberInfo";
                  break;
                case 2:
                  var url = window.location.pathname.trim().toLowerCase();
                  if (
                    (url.indexOf("membersign2") >= 0 &&
                      url.indexOf("code=" >= 0)) ||
                    (url.indexOf("membersign2_easy") >= 0 &&
                      url.indexOf("code=" >= 0))
                  ) {
                    //轉手機簽署頁
                    //不顯示註冊未完成
                    //alert('不顯示註冊未完成');
                    location.reload();
                  } else {
                    $("#regist-notfinsh-modal").modal("show");
                    register_url.value = "/Home/MemberSign2";
                  }
                  break;
                case 12: //簡易註冊
                  $("#regist-notfinsh-modal").modal("show");
                  register_url.value = "/Home/MemberInfo_easy";
                  break;
                case 13: //簡易註冊
                  $("#regist-notfinsh-modal").modal("show");
                  register_url.value = "/Home/TwcaVerify_1_easy";
                  break;
                //case 11://註冊帶訂單
                //    //交易頁面  reload
                //    var url = window.location.href.toLowerCase();
                //    if (url.indexOf('order_2') != -1 || url.indexOf('order_3') != -1 || url.indexOf('orderapi') != -1)  location.reload();
                //    break;
                default:
                  $("#regist-notfinsh-modal").modal("show");
                  register_url.value = "/Home/MemberInfo";
              }
            } else {
              //(2)註冊完成

              $("#authentication-modal").modal("hide");
              //header_app.setMemberNo(response.data.value.kc_member_no);//會員編號
              //東元自動成為會員者
              if (IdCardNumberCheck(_pw)) {
                //console.log(_pw);
                $("#bobo-modal").modal("show");
                return;
              }

              //show menu with role
              //header_app.setMenuForRole(response.data.value.role);
              //menuLeftApp.setMenuForRole(response.data.value.role);
              //buttom_menuApp.setMenuForRole(response.data.value.role);
              //index page
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
              ) {
                index_app.checkRole(response.data.value);
              }
              //補件 init load data
              if (href == "/home/memberinfo_s") {
                memberinfo_s.loginInitLoad();
                return;
              }
              if (
                href == "/home/uploadfile_s" ||
                href == "/home/membersign2_s" ||
                href == "/home/notetime"
              ) {
                return;
              }
              //補M1
              if (href == "/home/twcaverify_2_s") {
                location.reload();
                return;
              }
              //----------------

              //$('#regist-notfinsh-modal').modal('show');
              //var member = JSON.parse(localStorage.getItem('member'));
              //member.login_ok_msg = '';//init
              //localStorage.setItem("member", JSON.stringify(member));
              //register_url.value = '/Home/MemberInfo';
              //return;

              //test eantodo
              //response.data.value.applyCheckMsg.type = 4

              //(2.1)等待徵審
              //TODO 有些功能是不是要避開徵審 如更改照會時間 補件
              if (response.data.value.applyCheckMsg != null) {
                if (!response.data.value.applyCheckMsg.check) {
                  //過程有錯
                  alert(response.data.value.applyCheckMsg.error_msg);
                  return;
                } else {
                  //發不同訊息
                  switch (response.data.value.applyCheckMsg.type) {
                    case 1:
                      header_app.Link_Logout(); //登出
                      alert(
                        "您有尚須補送(件)的資料，請確認手機簡訊連結，並在指定時間內完成",
                      );
                      return;
                    case 2: //跳轉註冊流程
                      alert("逾時未補件，請重新提交資料並申請額度");
                      $("#regist-notfinsh-modal").modal("show");
                      //後來才加 未測試 連動UploadFile.js  須 login_ok_msg='*'
                      var member = JSON.parse(localStorage.getItem("member"));
                      member.login_ok_msg = ""; //init
                      localStorage.setItem("member", JSON.stringify(member));
                      register_url.value = "/Home/UploadFile";
                      return;
                    case 3: //退件< 180天
                    case 7:
                    case 11:
                    case 15:
                      header_app.Link_Logout(); //登出
                      alert(
                        "感謝您的支持，因資料審核未通過，可於半年後再重新申辦DUDUPAY分期，謝謝",
                      );
                      return;
                    case 17: //退件 >= 180天
                    case 18:
                    case 19:
                    case 20:
                      $("#regist-notfinsh-modal").modal("show");
                      var member = JSON.parse(localStorage.getItem("member"));
                      member.login_ok_msg = ""; //init
                      localStorage.setItem("member", JSON.stringify(member));
                      register_url.value = "/Home/UploadFile";
                      return;
                    case 6: //跳轉註冊流程
                    case 10:
                    case 14:
                      alert("審核已取消，請[繼續註冊]重新提交資料並重審額度");
                      $("#regist-notfinsh-modal").modal("show");
                      var member = JSON.parse(localStorage.getItem("member"));
                      member.login_ok_msg = ""; //init
                      localStorage.setItem("member", JSON.stringify(member));
                      register_url.value = "/Home/UploadFile";
                      return;
                    case 5:
                    case 9:
                    case 13:
                      header_app.Link_Logout(); //登出
                      alert(
                        "資料審核中，請先耐心等待簡訊通知。收到通過訊息，即可登入使用！",
                      );
                      return;
                    case 21: //註冊帶訂單 可下單
                      console.log("註冊帶訂單 可下單");
                      //alert('註冊帶訂單 可下單');
                      break;
                    case 4: //核准
                    case 8:
                    case 12:
                    case 16:
                    case 22:
                      //show menu with role
                      header_app.setMenuForRole(response.data.value.role);
                      menuLeftApp.setMenuForRole(response.data.value.role);
                      buttom_menuApp.setMenuForRole(response.data.value.role);
                      //檢查購物車
                      if (
                        response.data.value.cart &&
                        response.data.value.cart.success
                      ) {
                        console.log(response.data.value.cart.groups);
                        window.dispatchEvent(
                          new CustomEvent("cartUpdated", {
                            detail: response.data.value.cart.groups,
                          }),
                        );
                      }

                      break;
                    //default:
                  }
                }
              } else {
                //show menu with role
                header_app.setMenuForRole(response.data.value.role);
                menuLeftApp.setMenuForRole(response.data.value.role);
                buttom_menuApp.setMenuForRole(response.data.value.role);
                //檢查購物車
                if (
                  response.data.value.cart &&
                  response.data.value.cart.success
                ) {
                  console.log(response.data.value.cart.groups);
                  window.dispatchEvent(
                    new CustomEvent("cartUpdated", {
                      detail: response.data.value.cart.groups,
                    }),
                  );
                }
              }
              //console.log(994);
              //(2.2)有逾期帳單未繳
              if (response.data.value.checkAmountMsg != null) {
                if (response.data.value.checkAmountMsg.success) {
                  switch (response.data.value.checkAmountMsg.type) {
                    case 1: //<10天 提示後 繼續交易
                      alert(
                        "您有逾期帳單未繳, 請盡早完成繳納以免影響您的消費, 如您已完成繳納,則無需理會本通知。",
                      );
                      return;
                    case 2: //提示 不可交易 >10天
                      //header_app.Link_Logout();//登出
                      alert("您有逾期未繳帳單。請先完成繳納後，再進行消費。");
                      //window.location.href = '../Home/Account';
                      window.location.href = dudu_url + "Home/Account";
                      return;
                  }
                  //可用額度
                  //response.data.value.checkAmountMsg.loc_remaining;
                }
              }

              //(2.3)交易頁面  reload
              var url = window.location.href.toLowerCase();
              console.log(url);
              if (
                url.indexOf("order_2") != -1 ||
                url.indexOf("order_3") != -1 ||
                url.indexOf("orderapi") != -1 ||
                url.indexOf("orderpurchase") != -1
              )
                location.reload();

              //(2.4)超額時
              if (url.indexOf("membersign2") != -1) location.reload();
              //會員中心
              if (url.indexOf("membercenter") != -1) location.reload();

              //首頁登入時到會員中心
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
              ) {
                window.location.href = "../Home/MemberCenter";
                return;
              }
            }
          } else {
            console.log(response.data.msg);
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

    async function startWebAuthnLogin() {
      const options = await fetch("/WebAuthn/LoginOptions", {
        method: "POST",
      }).then((r) => r.json());

      if (options.success === false) {
        alert(options.msg || "安全金鑰驗證初始化失敗");
        return;
      }

      const credential = await navigator.credentials.get({
        publicKey: prepareAssertionOptions(options),
      });

      const result = await fetch("/WebAuthn/LoginVerify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertionToJson(credential)),
      }).then((r) => r.json());
      console.log(result);
      if (result.success) {
        console.log(result.value);
        localStorage.removeItem("member");
        localStorage.setItem("member", JSON.stringify(result.value));
        location.href = "/Home/Index";
      } else {
        alert(result.msg);
      }
    }

    function prepareAssertionOptions(options) {
      options.challenge = base64UrlToArrayBuffer(options.challenge);

      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map(
          function (credential) {
            return {
              type: credential.type,
              id: base64UrlToArrayBuffer(credential.id),
              transports: credential.transports,
            };
          },
        );
      }

      return options;
    }

    function assertionToJson(credential) {
      return {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: arrayBufferToBase64Url(
            credential.response.authenticatorData,
          ),
          clientDataJson: arrayBufferToBase64Url(
            credential.response.clientDataJSON,
          ),
          signature: arrayBufferToBase64Url(credential.response.signature),
          userHandle: credential.response.userHandle
            ? arrayBufferToBase64Url(credential.response.userHandle)
            : null,
        },
        extensions: credential.getClientExtensionResults
          ? credential.getClientExtensionResults()
          : {},
      };
    }

    function base64UrlToArrayBuffer(value) {
      var base64 = value.replace(/-/g, "+").replace(/_/g, "/");
      var pad = base64.length % 4;
      if (pad) {
        base64 += "=".repeat(4 - pad);
      }

      var binary = window.atob(base64);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }

    function arrayBufferToBase64Url(buffer) {
      var bytes = new Uint8Array(buffer);
      var binary = "";
      for (var i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      return window
        .btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    }

    sendMobile = () => {
      var member = JSON.parse(localStorage.getItem("member"));
      axios({
        method: "post",
        url: "/api/Member/SendMobileCode",
        headers: { "Content-Type": "application/json" },
        params: { mobile: member.mobile },
      })
        .then((response) => {
          console.log(response.data);
          if (response.data.success) {
            //$('#bobo-modal').modal('hide');
            //自動OTP填入
            navigator.credentials
              .get({
                otp: { transport: ["sms"] },
              })
              .then((otp) => {
                verify_code.value = otp.code;
              });

            //disabled
            //sendCoded.value = true;
            //var intervalID = setInterval(function () {
            //    //console.log(123);
            //    sendCoded.value = false;
            //}, 1000 * 60 * 5);
            //clearInterval(intervalID);
            //console.log(sendCoded.value);
            //keep otp code
            otp_code.value = response.data.value;
            //show time bar
            $("#otp_msg_layout").modal("show");
            timeBar();
            //showBar.value = true;
            //showtxtMsg.value = true;
          } else {
            alert("發送驗證碼失敗！");
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          console.log("完成");
        });
    };
    //bar 時間過期
    code_timeout = () => {
      otp_timeout.value = true;
      otp_code.value = "";
      alert("驗證碼已過期，請重新獲取驗證碼！");
    };

    confirmOTP = () => {
      //check otp Num
      if (otp_code.value == "" || verify_code.value != otp_code.value) {
        alert("驗證碼錯誤");
        return;
      }

      window.location.href = "../Home/BoBoResetPw";
    };

    unDo = () => {
      $("#bobo-modal").modal("hide");
      $("#authentication-modal").modal("show");
    };

    boboChangePw = () => {
      window.location.href = "../Home/MemberCenter";
    };

    //刪除狀態後 再重新登入一次
    //deleteLoginStatus = (apply_status) => {
    //    var member = JSON.parse(localStorage.getItem('member'));
    //    if (member == null) return;

    //    $.blockUI({
    //        baseZ: 99999,
    //        css: { border: 'none', backgroundColor: 'none', top: '45%', zIndex: '99999' },
    //        overlayCSS: { backgroundColor: '#DCDCDC' },
    //        message: '<img style="width:4rem;" src="../img/duprocess.gif" />'
    //    });
    //    axios({
    //        method: 'post',
    //        url: '/api/Member/DeleteLoginStatus',
    //        headers: { 'Content-Type': 'application/json' },
    //        params: { member_id: member.id, apply_status: apply_status }
    //    }).then((response) => {
    //        $.unblockUI();
    //        console.log(response.data);
    //        if (response.data.success) {

    //            //再重新登入一次 跳轉繼續註冊
    //            Login(u);
    //        }
    //        else {
    //            console.log(response.data.msg);
    //            alert(response.data.msg)
    //        }
    //    }).catch((function (error) {
    //        console.log(error);
    //    })).finally(() => {
    //        console.log('完成');
    //    });
    //}

    Login2 = (_u) => {
      if (_u.mobile2 == "" || _u.pw2 == "") return;
      if (_u.code2 == "") {
        alert("請輸入驗證碼！");
        return;
      }
      console.log(_u);
      if (_u.code2 != getCode2()) {
        alert("驗證碼輸入錯誤！@_@");
        return;
      }

      $.blockUI({
        baseZ: 99999,
        css: {
          border: "none",
          backgroundColor: "none",
          top: "45%",
          zIndex: "99999",
        },
        overlayCSS: { backgroundColor: "#DCDCDC" },
        message: '<img style="width:4rem;" src="../img/duprocess.gif" />',
      });
      axios({
        method: "post",
        url: "/api/Member/Login2",
        headers: { "Content-Type": "application/json" },
        params: {
          mobile: _u.mobile2,
          pw: _u.pw2,
          role: _u.role2,
          browser:
            _getNavigatorVersion() + getAndroidVersion() + "|" + iOSversion(),
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            if (response.data.msg == "admin") {
              $("#authentication-modal-2").modal("hide");
              window.location.href = "../Home/Dealer_Admin";
              return;
            }

            localStorage.removeItem("member");
            localStorage.setItem("member", JSON.stringify(response.data.value));
            //if (response.data.value.login_ok_msg == '*') {
            $("#authentication-modal-2").modal("hide");
            //show menu with role
            header_app.setMenuForRole(response.data.value.role);
            menuLeftApp.setMenuForRole(response.data.value.role);
            buttom_menuApp.setMenuForRole(response.data.value.role);

            //check role authority show item
            //header_app.setAuthorityShowItem(
            //    response.data.value.authority_query,
            //    response.data.value.authority_cashApply,
            //    response.data.value.authority_admin,
            //    response.data.value.authority_mall
            //);
            //menuLeftApp.setAuthorityShowItem(
            //    response.data.value.authority_query,
            //    response.data.value.authority_cashApply,
            //    response.data.value.authority_admin,
            //    response.data.value.authority_mall
            //);

            header_app.setAuthorityShowItem(response.data.value.authoritys);
            menuLeftApp.setAuthorityShowItem(response.data.value.authoritys);

            //index page
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
            ) {
              index_app.checkRole(response.data.value);
            }
          } else {
            console.log(response.data.msg);
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          $.unblockUI();
          console.log("完成");
        });
    };

    eye = () => {
      pwFieldType.value = pwFieldType.value == "password" ? "text" : "password";
      showPassword.value = !showPassword.value;
    };
    eye2 = () => {
      pwFieldType2.value =
        pwFieldType2.value == "password" ? "text" : "password";
      showPassword2.value = !showPassword2.value;
    };

    //更新驗證碼
    changeCode = () => {
      options.txt = randomNum(100000, 999999).toString();
      var helper = new writeAuthCode(options);
      //console.log(helper);
      //console.log(helper.options.txt);
      //createCode();
    };
    //更新驗證碼
    changeCode2 = () => {
      options2.txt = randomNum(100000, 999999).toString();
      var helper = new writeAuthCode(options2);
      //console.log(helper);
      //console.log(helper.options2.txt);
      //createCode2();
    };

    //checkDifDateReLogin = (member) => {
    //    console.log('diff day', member);
    //    //不同天時 clear localStorage  表示localstorage 一天後要再重登
    //    if (member != null) {
    //        if (typeof member.login_day !== 'undefined') {
    //            var time_now = (new Date()).getDate();
    //            if ((time_now != member.login_day)) {
    //                //clear local storage
    //                localStorage.clear();
    //                //clear role menu
    //                header_app.clearMenuForRole();
    //                menuLeftApp.clearMenuForRole();
    //                window.location.href = '../Home/Index';
    //                //show login
    //                $('#authentication-modal').modal('show');
    //            }
    //        }

    //    }
    //};

    // data 內容為 base64 加密字串，QRCode 產生時已用 encodeURIComponent 編碼過(避免 +,/,= 被部分手機或APP誤判)
    // URLSearchParams 會把舊版(未encode)的QRCode +號解析成空白，因此需用 decodeURIComponent
    getQueryParam = (name) => {
      var m = RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
      if (!m) return null;
      try {
        return decodeURIComponent(m[1]);
      } catch (e) {
        return m[1];
      }
    };

    //非會員 只要由訂單帶過來的都要寫入店家推薦
    nonMemberRegister = async (_buy) => {
      var url = window.location.pathname.trim().toLowerCase();
      //下單頁
      //if (url.indexOf('order_2') != -1 || url.indexOf('order_3') != -1 || url.indexOf('orderapi') != -1 || url.indexOf('orderpurchase') != -1) {
      if (
        url.indexOf("order_2") != -1 ||
        url.indexOf("order_3") != -1 ||
        url.indexOf("orderapi") != -1
      ) {
        var _data = getQueryParam("data");
        if (_data != "null") {
          //解密data get AE86
          var _type = 0;
          var _store_id = 0;
          if (url.indexOf("order_2") != -1) {
            _store_id = getQueryParam("c");
            _type = 2;
          }
          if (url.indexOf("order_3") != -1) {
            _store_id = getQueryParam("c");
            _type = 3;
          }

          var res = await _getPuchCodeDecoding(_data, _type, _store_id);
          console.log(res);
          if (res.success) {
            if (_buy == 1) {
              //註冊帶訂單
              var dudu_order = {
                order_type: "註冊帶訂單",
                order_url: window.location.href,
              };
              console.log(dudu_order);
              localStorage.removeItem("dudu_order");
              localStorage.setItem("dudu_order", JSON.stringify(dudu_order));
              console.log(localStorage.getItem("dudu_order"));
              //window.location.href = '../Home/Register';//不照會時間
              window.location.href = "../Home/Register?push=" + res.value; //不照會時間
            } else {
              //註冊不買
              localStorage.removeItem("dudu_order");
              window.location.href = "../Home/Register?push=" + res.value;
            }
          } else {
            localStorage.removeItem("dudu_order");
            alert(res.msg);
            return;
          }
        }
        //非會員註冊沒帶訂單(走一般註冊流程)
        else {
          localStorage.removeItem("dudu_order");
          window.location.href = "../Home/Register"; //有照會時間
        }
      } else {
        localStorage.removeItem("dudu_order");
        window.location.href = "../Home/Register"; //有照會時間
        //alert('非註冊帶訂單,請按否,註冊即可');
      }
    };

    const _getPuchCodeDecoding = (_data, _type, _store_id) => {
      return axios({
        method: "post",
        url: "/api/Member/GetPuchCodeDecoding",
        headers: { "Content-Type": "application/json" },
        params: { data: _data, type: _type, store_id: _store_id }, //要解密的內容
      })
        .then((response) => {
          return response.data;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          console.log("完成");
        });
    };

    //立即註冊
    register_now = () => {
      var url = window.location.pathname.trim().toLowerCase();
      //下單頁
      //if (url.indexOf('order_2') != -1 || url.indexOf('order_3') != -1 || url.indexOf('orderapi') != -1 || url.indexOf('orderpurchase') != -1) {
      if (
        url.indexOf("order_2") != -1 ||
        url.indexOf("order_3") != -1 ||
        url.indexOf("orderapi") != -1
      ) {
        sessionStorage.removeItem("purchase_item");
        $("#authentication-modal").modal("hide");
        $("#non-member-regist-modal").modal("show");
      } else if (url.indexOf("purchase") != -1) {
        localStorage.removeItem("dudu_order");
        window.location.href = "../Home/Register"; //有照會時間
      } else {
        sessionStorage.removeItem("purchase_item");
        localStorage.removeItem("dudu_order");
        window.location.href = "../Home/Register"; //有照會時間
      }
    };

    openRegistModal = () => {
      $("#authentication-modal").modal("show");
    };

    return {
      u,
      showPassword,
      pwFieldType,
      eye,
      changeCode,
      showPassword2,
      pwFieldType2,
      eye2,
      changeCode2,
      Login,
      Login2,
      showLogin,
      register_url,
      nonMemberRegister,
      sendMobile,
      unDo,
      otp_timeout,
      verify_code,
      confirmOTP,
      boboChangePw,
      login,
      register_now,
      openRegistModal,
    };
  },
};

const top_menuApp = Vue.createApp(menuApp).mount("#menuTopApp");

//首登 新手導覽
$(window).on("load", function () {
  //if (JSON.parse(localStorage.getItem('member')).first_login) $('#helpModal').modal('toggle');
  //window.addEventListener("resize", reportWindowSize);
  //防右鍵
  //document.oncontextmenu = function () { return false; }
  //var member = JSON.parse(localStorage.getItem('member'));
  //checkDifDateReLogin(member);
});

function reportWindowSize() {
  //console.log(screen.width);
  //show menu with role
  //header_app.setMenuForRole(response.data.member.role);
  //menuLeftApp.setMenuForRole(response.data.member.role);
  //heightOutput.textContent = window.innerHeight;
  //widthOutput.textContent = window.innerWidth;
}

//var DD;//數字字串
//var D2;//大寫數字字串

//產生驗證碼
//function createCode() {
//    var checkCode = document.getElementById("code");
//    //設定數字
//    var aa = [5, 6, 7, 8, 9];//十位數
//    var bb = [0, 1, 2, 3, 4];//個位數
//    var cc = ['+', '-', '*'];//運算符號
//    //設定大寫數字
//    var a2 = ["五", "六", "七", "八", "九"];//十位數
//    var b2 = ["零", "一", "二", "三", "四"];//個位數
//    var c2 = ['加', '減', '乘'];//運算符號
//    //var a2 = ["1", "2", "3", "4", "5"];//十位數
//    //var b2 = ["6", "7", "8", "9", "0"];//個位數
//    //var c2 = ['A', 'B', 'C'];//運算符號

//    //取得隨機數字
//    var r1 = Math.floor(Math.random() * aa.length);
//    var r2 = Math.floor(Math.random() * bb.length);
//    var r3 = Math.floor(Math.random() * cc.length);
//    //alert(r1+"-"+r2+"-"+r3);

//    var AA = aa[r1];
//    var BB = bb[r2];
//    var CC = cc[r3];
//    DD = "";
//    DD = AA + CC + BB;//數字字串
//    Md = eval(DD);//透過eval強制運算
//    //alert(eval(DD));

//    var A2 = a2[r1];
//    var B2 = b2[r2];
//    var C2 = c2[r3];
//    D2 = "";
//    D2 = A2 + C2 + B2;//大寫數字字串

//    checkCode.innerHTML = D2//寫出驗證碼
//};

//function getCode() {
//    return Md
//};

//function createCode2() {
//    var checkCode = document.getElementById("code2");
//    //設定數字
//    var aa = [5, 6, 7, 8, 9];//十位數
//    var bb = [0, 1, 2, 3, 4];//個位數
//    var cc = ['+', '-', '*'];//運算符號
//    //設定大寫數字
//    var a2 = ["五", "六", "七", "八", "九"];//十位數
//    var b2 = ["零", "一", "二", "三", "四"];//個位數
//    var c2 = ['加', '減', '乘'];//運算符號

//    //取得隨機數字
//    var r1 = Math.floor(Math.random() * aa.length);
//    var r2 = Math.floor(Math.random() * bb.length);
//    var r3 = Math.floor(Math.random() * cc.length);
//    //alert(r1+"-"+r2+"-"+r3);

//    var AA = aa[r1];
//    var BB = bb[r2];
//    var CC = cc[r3];
//    DD = "";
//    DD = AA + CC + BB;//數字字串
//    Md = eval(DD);//透過eval強制運算
//    //alert(eval(DD));

//    var A2 = a2[r1];
//    var B2 = b2[r2];
//    var C2 = c2[r3];
//    D2 = "";
//    D2 = A2 + C2 + B2;//大寫數字字串
//    //alert(D2);
//    //checkCode.style["font-family"]="Microsoft JhengHei";
//    //checkCode.style["font-style"]="normal";
//    checkCode.innerHTML = D2//寫出驗證碼
//};

//function getCode2() {
//    return Md
//};

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

let options = {
  canvasId: "auth-code" /**canvas的id*/,
  txt: randomNum(100000, 999999).toString() /**傳入驗證碼內容*/,
  height: 40 /**驗證碼高度 */,
  width: 150 /**驗證碼寬度 */,
  fontColor1: 0 /**隨機生成字型顏色*/,
  fontColor2: 50 /**隨機生成字型顏色*/,
  bgColor1: 180 /**這個範圍的顏色作背景看起來清晰一些*/,
  bgColor2: 255 /**這個範圍的顏色作背景看起來清晰一些*/,
  fontStyle: "24px SimHei",
};

let options2 = {
  canvasId: "auth-code2" /**canvas的id*/,
  txt: randomNum(100000, 999999).toString() /**傳入驗證碼內容*/,
  height: 40 /**驗證碼高度 */,
  width: 150 /**驗證碼寬度 */,
  fontColor1: 0 /**隨機生成字型顏色*/,
  fontColor2: 50 /**隨機生成字型顏色*/,
  bgColor1: 180 /**這個範圍的顏色作背景看起來清晰一些*/,
  bgColor2: 255 /**這個範圍的顏色作背景看起來清晰一些*/,
  fontStyle: "24px SimHei",
};

function getCode() {
  return options.txt;
}
function getCode2() {
  return options2.txt;
}

// --------------------------------------------------
/**驗證碼建構函式**/
function writeAuthCode(options) {
  this.options = options;
  let canvas = document.getElementById(options.canvasId);
  canvas.width = options.width || 150;
  canvas.height = options.height || 40;
  let ctx = canvas.getContext("2d"); /**建立一個canvas物件*/
  ctx.textBaseline = "middle";
  ctx.fillStyle = randomColor(options.bgColor1, options.bgColor2);
  ctx.fillRect(0, 0, options.width, options.height);
  for (let i = 0; i < options.txt.length; i++) {
    let txt = options.txt.charAt(i); /**讓每個字不一樣*/
    ctx.font = options.fontStyle;
    ctx.fillStyle = randomColor(options.fontColor1, options.fontColor2);
    ctx.shadowOffsetY = randomNum(-3, 3);
    ctx.shadowBlur = randomNum(-3, 3);
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    let x = (options.width / (options.txt.length + 1)) * (i + 1);
    let y = options.height / 2;
    let deg = randomNum(-30, 30);
    /**設定旋轉角度和座標原點*/
    ctx.translate(x, y);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.fillText(txt, 0, 0);
    /**恢復旋轉角度和座標原點*/
    ctx.rotate((-deg * Math.PI) / 180);
    ctx.translate(-x, -y);
  }
  /**1~4條隨機干擾線隨機出現*/
  for (let i = 0; i < randomNum(1, 4); i++) {
    ctx.strokeStyle = randomColor(40, 180);
    ctx.beginPath();
    ctx.moveTo(randomNum(0, options.width), randomNum(0, options.height));
    ctx.lineTo(randomNum(0, options.width), randomNum(0, options.height));
    ctx.stroke();
  }
  /**繪製干擾點*/
  for (let i = 0; i < options.width / 6; i++) {
    ctx.fillStyle = randomColor(0, 255);
    ctx.beginPath();
    ctx.arc(
      randomNum(0, options.width),
      randomNum(0, options.height),
      1,
      0,
      2 * Math.PI,
    );
    ctx.fill();
  }
  this.validate = function (code) {
    return this.options.txt == code;
  };
}
/**隨機數字**/
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
/**隨機顏色**/
function randomColor(min, max) {
  let r = randomNum(min, max);
  let g = randomNum(min, max);
  let b = randomNum(min, max);
  return "rgb(" + r + "," + g + "," + b + ")";
}

//以下是身分證檢核 JavaScript 程式函式 * /
//function checkPid(pid) {
//    //console.log(pid);
//    if (pid.length !== 10) return false;// '身分證字號長度不正確';

//    if (!/(^[A-Za-z][12][\d]{8}$)|(^[A-Za-z][A-Da-d][\d]{8}$)/.test(pid)) {
//        return false;// '身分證字號含不合法字元，請檢查';
//    }

//    if (/^[A-Za-z][\d]{9}$/.test(pid)) {     // 此為身分證字號

//        pid = pid.toUpperCase();                 // 即使輸入小寫字元，也將它轉成大寫字元
//        var codes = '0123456789ABCDEFGHJKLMNPQRSTUVXYWZIO';        // 注意英文字母順序
//        var pidCodes = {};
//        $(codes.split('')).each(function (index, elem) {
//            pidCodes[elem] = index;                                  // 建立字母vs數字對照表
//        });
//        // 依據前9碼權重總合與最後檢核碼比較
//        var sum = 0;
//        for (var i = 8; i > 0; i--) {
//            sum += parseInt(pidCodes[pid.charAt(i)]) * (9 - i);
//            //console.log(sum + '- ' + pid.charAt(i) + '= ' + parseInt(pidCodes[pid.charAt(i)]) * (9 - i));
//        }
//        var checkDigit = 10 - (sum + parseInt(pidCodes[pid.charAt(0)]) % 10 * 9 + parseInt(parseInt(pidCodes[pid.charAt(0)] / 10))) % 10;
//        return checkDigit === parseInt(pid.slice(-1)) ? true : false;
//    } else {

//        if (/^[A-Za-z][A-Da-d][\d]{8}$/.test(pid)) {      // 此為居留證證號
//            // 程式內容待補充
//            return true;
//        }
//    }
//}

function IdCardNumberCheck(_id) {
  var city = new Array(
    1,
    10,
    19,
    28,
    37,
    46,
    55,
    64,
    39,
    73,
    82,
    2,
    11,
    20,
    48,
    29,
    38,
    47,
    56,
    65,
    74,
    83,
    21,
    3,
    12,
    30,
  );
  var id = _id.toUpperCase();
  // 使用「正規表達式」檢驗格式
  if (!id.match(/^[A-Z]\d{9}$/) && !id.match(/^[A-Z][A-D]\d{8}$/)) {
    return false;
    //document.getElementById("PointMsg").innerHTML = "<span style='color:red; font-style:italic'>請輸入正確身分證字號格式</span>";
    //document.getElementById("IdCardText").value = "";
  } else {
    var total = 0;
    if (id.match(/^[A-Z]\d{9}$/)) {
      //身分證字號
      //將字串分割為陣列(IE必需這麼做才不會出錯)
      id = id.split("");
      //計算總分
      total = city[id[0].charCodeAt(0) - 65];
      for (var i = 1; i <= 8; i++) {
        total += eval(id[i]) * (9 - i);
      }
    } else {
      // 外來人口統一證號
      //將字串分割為陣列(IE必需這麼做才不會出錯)
      id = id.split("");
      //計算總分
      total = city[id[0].charCodeAt(0) - 65];
      // 外來人口的第2碼為英文A-D(10~13)，這裡把他轉為區碼並取個位數，之後就可以像一般身分證的計算方式一樣了。
      id[1] = id[1].charCodeAt(0) - 65;
      for (var i = 1; i <= 8; i++) {
        total += eval(id[i]) * (9 - i);
      }
    }
    //補上檢查碼(最後一碼)
    total += eval(id[9]);
    //檢查比對碼(餘數應為0);
    if (total % 10 == 0) {
      return true;
      //document.getElementById("PointMsg").innerHTML = "<span style='color:red; font-style:italic'></span>";
    } else {
      return false;
      //document.getElementById("PointMsg").innerHTML = "<span style='color:red; font-style:italic'>驗證錯誤，請輸入正確的身分證字號</span>";
      //document.getElementById("IdCardText").value = "";
    }
  }
}

//-----------------------------------
// Timer Bar
//-----------------------------------
// 目標時間(要倒數幾秒)。
const targetSeconds_menu_top = 300;
var timerId;
function timeBar() {
  clearInterval(timerId);

  // 起始時間(計時器的啟動時間)。
  const startTime = new Date().getTime();
  // 初始化。
  init(targetSeconds_menu_top);
  // start the timer.
  timerId = setInterval(function () {
    timer(startTime);
  }, 1000);
}

// timer.
var timer = function (startTime) {
  // 當前時間。
  var currentTime = new Date().getTime();

  // 當前時間 - 起始時間 = 經過時間。(因為不需要毫秒，所以將結果除以1000。)
  var diffSec = Math.round((currentTime - startTime) / 1000);

  // 目標時間 - 經過時間 = 剩餘時間。
  var remainingTime = targetSeconds_menu_top - diffSec;

  // update progess.
  update(remainingTime);

  if (remainingTime == 0) {
    code_timeout();
    // stop the timer.
    clearInterval(timerId);

    // do anything you want to.
    //$(".msg").text("時間過期!");
  }
};

// 初始化。此處借用update函式來初次設定進度條。
function init(seconds) {
  update(seconds);
}

// update progess with the timer.
function update(seconds) {
  barRenderer(seconds);
  textRenderer(seconds);
}

// refresh the bar.
function barRenderer(seconds) {
  var percent = (seconds / targetSeconds_menu_top) * 100;
  $(".bar").css("width", percent + "%");
}

// refresh the text of the bar.
function textRenderer(seconds) {
  var sec = seconds % 60;
  var min = Math.floor(seconds / 60);

  /* 兩種作法都可以 */
  //min = min > 9 ? min : "0" + min;
  //sec = sec > 9 ? sec : "0" + sec;
  min = min.toString().padStart(2, "0");
  sec = sec.toString().padStart(2, "0");

  $(".text").text(min + ":" + sec);
}
