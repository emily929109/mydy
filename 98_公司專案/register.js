const App = {
  setup() {
    const ru = ref({
      // v : 值，error : ng || ok，msg : 錯誤訊息
      mobile: { v: "", error: "0", msg: "" },
      mail: { v: "", error: "0", msg: "" },
      pw_register: { v: "", error: "0", msg: "" },
      repw_register: { v: "", error: "0", msg: "" },
      otpNum: { v: "", error: "0", msg: "" },
      agree: { v: false, error: "0", msg: "" },
      recommend_code: { v: "", error: "0", msg: "" },
      check_mail: { v: "", error: "0", msg: "" },
      mailNum: { v: "", error: "0", msg: "" },
    });

    const time_msg = ref("");
    const showPassword = ref(false);
    const pwFieldType = ref("password");
    const showRepw = ref(false);
    const repwFieldType = ref("password");
    const otp_code = ref("");
    const showBar = ref(false);
    const sendCoded = ref(false);
    const pdf_title = ref("");
    const disabled = ref(false);
    const mail_disabled = ref(false);
    const member = ref(JSON.parse(localStorage.getItem("member")));
    //const show = ref(false);
    const showSecond = ref("0");
    const html_data = ref("");
    const dudu_order = JSON.parse(localStorage.getItem("dudu_order"));
    const purchase_item = JSON.parse(sessionStorage.getItem("purchase_item"));
    const previousUrl = ref("");

    onMounted(() => {
      //已經在登入狀態
      if (member.value !== null && member.value.login_ok_msg == "*") {
        alert("您已經有帳號登入了,如要申請新帳號請先登出！");
        window.location.href = "../Home/Index";
        return;
      }

      if (member.value !== null && member.value.login_ok_msg != "*") {
        alert("您已經有註冊帳號,請「會員登入」後繼續完成註冊流程！");
        window.location.href = "../Home/Index";
        return;
      }

      //有推薦碼
      var _push = getUrlParameter("push");
      if (_push != "null") {
        ru.value.recommend_code.v = _push.trim();
        disabled.value = true;
      }

      //get mobile code token
      //_getMobileCodeToken();

      $("#pdf_msg").on("shown.bs.modal", function (e) {
        if (pdf_title.value == "1") {
          LoadPdfFromUrl("/img/DUDUPAY隱私權政策條款1131101.pdf");
          //$("#pdf-frame").attr('src', dudu_url + 'img/個人資料保護法_20231006.pdf');
        } else {
          LoadPdfFromUrl(
            "/img/行動身分識別服務使用者約定條款及隱私權告知條款_20231006.pdf",
          );
          //$("#pdf-frame").attr('src', dudu_url + 'img/行動身分識別服務使用者約定條款及隱私權告知條款_20231006.pdf');
        }
      });

      previousUrl.value = document.referrer;
      history.pushState(null, null, location.href);
    });

    eye = () => {
      pwFieldType.value = pwFieldType.value == "password" ? "text" : "password";
      showPassword.value = !showPassword.value;
    };

    eyeRepw = () => {
      repwFieldType.value =
        repwFieldType.value == "password" ? "text" : "password";
      showRepw.value = !showRepw.value;
    };

    const scrollToFirstError = () => {
      Vue.nextTick(() => {
        const el = document.querySelector("#register-form .error_border");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus({ preventScroll: true });
        }
      });
    };

    const Next = (u) => {
      // --------- 登入狀態 ---------
      var m = JSON.parse(localStorage.getItem("member"));
      if (m !== null) {
        alert("您已經登入了,如要申請新帳號請先登出！");
        return;
      }

      // --------- 密碼檢查 ---------
      // 1. 長度需 8~18 字   2. 需含至少一個英文大寫字母   3. 需含至少一個英文小寫字母   4. 需含至少一個數字 5. 只可包含ASCII鍵盤符號
      var hasUpper = /[A-Z]/.test(ru.value.pw_register.v);
      var hasLower = /[a-z]/.test(ru.value.pw_register.v);
      var hasNumber = /[0-9]/.test(ru.value.pw_register.v);
      // 只能由英數字 + 32 個符號組成， -、\、] 需加反斜線轉義
      var isValidChars =
        /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~]+$/.test(
          ru.value.pw_register.v,
        );

      if (!ru.value.pw_register.v) {
        ru.value.pw_register.error = "ng";
        ru.value.pw_register.msg = "密碼不可為空";
      } else if (
        ru.value.pw_register.v.length < 8 ||
        ru.value.pw_register.v.length > 18
      ) {
        ru.value.pw_register.error = "ng";
        ru.value.pw_register.msg = "密碼至少 8 字，至多 18 字";
      } else if (!isValidChars) {
        ru.value.pw_register.error = "ng";
        ru.value.pw_register.msg = "密碼包含不合法的特殊符號或全形字元";
      } else if (!hasUpper) {
        ru.value.pw_register.error = "ng";
        ru.value.pw_register.msg = "需含至少一個英文大寫字母";
      } else if (!hasLower) {
        ru.value.pw_register.error = "ng";
        ru.value.pw_register.msg = "需含至少一個英文小寫字母";
      } else if (!hasNumber) {
        ru.value.pw_register.error = "ng";
        ru.value.pw_register.msg = "需含至少一個數字";
      } else {
        ru.value.pw_register.error = "ok";
        ru.value.pw_register.msg = "";
      }

      // --------- 密碼確認檢查 ---------
      if (!ru.value.repw_register.v) {
        ru.value.repw_register.error = "ng";
        ru.value.repw_register.msg = "請再次輸入密碼";
      } else if (ru.value.pw_register.v != ru.value.repw_register.v) {
        ru.value.repw_register.error = "ng";
        ru.value.repw_register.msg = "兩次輸入的密碼不一致，請重新確認";
      } else if (ru.value.pw_register.error != "ok") {
        // 兩次輸入雖相符，但密碼本身未通過規則檢查，此欄不應顯示為通過
        ru.value.repw_register.error = "0";
        ru.value.repw_register.msg = "";
      } else {
        ru.value.repw_register.error = "ok";
        ru.value.repw_register.msg = "";
      }

      //------------------------------------
      //check mobile ^(0)([0-9]{1})([-]?)([0-9]{6,8})$
      var mobile = /^09[0-9]{8}$/;
      if (ru.value.mobile.v.search(mobile) == -1) {
        ru.value.mobile.error = "ng";
        ru.value.mobile.msg = "手機號碼格式錯誤 {範例：0920123456}";
      } else {
        ru.value.mobile.error = "ok";
        ru.value.mobile.msg = "";
      }
      //------------------------------------
      //check mail
      var mail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // 使用「正規表達式」檢驗格式
      if (ru.value.mail.v.match(mail)) {
        ru.value.mail.error = "ok";
        ru.value.mail.msg = "";
      } else {
        ru.value.mail.error = "ng";
        ru.value.mail.msg = "電子信箱格式錯誤";
      }

      //check otp Num
      if (ru.value.otpNum.v == "" || ru.value.otpNum.v != otp_code.value) {
        ru.value.otpNum.error = "ng";
        ru.value.otpNum.msg = "驗證碼錯誤";
      } else {
        ru.value.otpNum.error = "ok";
        ru.value.otpNum.msg = "";
      }
      //check 同意否
      if (!ru.value.agree.v) {
        ru.value.agree.error = "ng";
        ru.value.agree.msg = "請詳閱並勾選服務使用者約定條款及隱私權告知條款";
      } else {
        ru.value.agree.error = "ok";
        ru.value.agree.msg = "";
      }

      var isValid =
        ru.value.pw_register.error == "ok" &&
        ru.value.repw_register.error == "ok" &&
        ru.value.mobile.error == "ok" &&
        ru.value.mail.error == "ok" &&
        ru.value.otpNum.error == "ok" &&
        ru.value.agree.error == "ok";

      if (!isValid) {
        scrollToFirstError();
        return;
      }

      blockUI();
      //write db
      axios({
        method: "post",
        url: "/api/Member/Register_2",
        headers: { "Content-Type": "application/json" },
        params: {
          pw: ru.value.pw_register.v,
          mobile: ru.value.mobile.v,
          mail: ru.value.mail.v,
          recommend_code: ru.value.recommend_code.v,
          browser:
            _getNavigatorVersion() + getAndroidVersion() + "|" + iOSversion(),
          order_url:
            dudu_order != null && dudu_order.order_type == "註冊帶訂單"
              ? dudu_order.order_url
              : "",
          purchase_item:
            purchase_item === null ? "" : JSON.stringify(purchase_item),
        },
      })
        .then((response) => {
          console.log(response.data);
          if (response.data.success) {
            localStorage.removeItem("member");
            localStorage.setItem("member", JSON.stringify(response.data.value));

            //var m = JSON.parse(localStorage.getItem('member'));
            //console.log(m);
            $("#finish_msg").modal("show");
            //alert('已經註冊帳號成功,請繼續填寫資料');
          } else {
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          $.unblockUI();
          console.log(error);
        })
        .finally(() => {
          $.unblockUI();
          console.log("完成");
        });
    };

    //送簡訊驗證碼
    SendMobileCode = () => {
      //ru.value.mail.v = 'ean_shen3@yahoo.com.tw';

      //check mobile
      var mobile = /^09[0-9]{8}$/;
      if (ru.value.mobile.v.search(mobile) == -1) {
        ru.value.mobile.error = "ng";
        ru.value.mobile.msg = "手機號碼格式錯誤 {範例：0920123456}";
        return;
      } else {
        ru.value.mobile.error = "ok";
        ru.value.mobile.msg = "";
      }

      mail_disabled.value = true; //disabled
      axios({
        method: "post",
        url: "/api/AnonymousOTP/SendMobileCodeWithEatUser",
        headers: { "Content-Type": "application/json" },
        //headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('mobile_token'))}` },
        params: { mobile: ru.value.mobile.v, mail: ru.value.mail.v },
      })
        .then((response) => {
          //console.log(response.data);
          if (response.data.success) {
            //自動OTP填入
            navigator.credentials
              .get({
                otp: { transport: ["sms"] },
              })
              .then((otp) => {
                verify_code.value = otp.code;
              });

            //disabled
            sendCoded.value = true;
            var intervalID = setInterval(
              function () {
                //console.log(123);
                sendCoded.value = false;
                mail_disabled.value = false;
              },
              1000 * 60 * 5,
            );
            //clearInterval(intervalID);

            //keep otp code
            otp_code.value = response.data.value;
            //show time bar
            $("#otp_msg").modal("show");
            timeBar();
            showBar.value = true;
          } else {
            mail_disabled.value = false;
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
          if (error.response && error.response.status == 401)
            alert(error.response.data.Message);
        })
        .finally(() => {
          console.log("完成");
        });
    };

    close = () => {
      if (purchase_item !== null) {
        // 1. 商城帶購物車註冊
        window.location.href = "../Home/UploadFile?noshow=1";
        return;
      }

      var _push = getUrlParameter("push"); // 檢查網址是否帶店家碼
      if (_push != "null") {
        // 4 碼英數混合 → 店家代號（例：AE86）
        if (
          /^[A-Za-z0-9]{4}$/.test(_push) && // 長度 4 且英數字
          /[A-Za-z]/.test(_push) && // 至少一個英文字
          /\d/.test(_push)
        ) {
          // 至少一個數字
          //帶店家代號且是註冊帶訂單不可走簡易註冊
          if (dudu_order != null && dudu_order.order_type == "註冊帶訂單") {
            window.location.href = "../Home/UploadFile?noshow=1"; // 店家QR流程
          } else {
            window.location.href = "../Home/UploadFile"; //正常註冊
          }
        } else {
          //會員推薦/員工推薦 正常註冊
          window.location.href = "../Home/UploadFile";
        }
      } else {
        //無推薦 正常註冊
        window.location.href = "../Home/UploadFile";
      }
    };

    //bar 時間過期
    code_timeout = () => {
      otp_code.value = "";
    };

    showPdf = (_titleValue) => {
      pdf_title.value = _titleValue;
      $("#pdf_msg").modal("show");
    };

    // 發送驗證信 E-mail
    const getApiMessage = (data, defaultMessage) => {
      return (
        (data && (data.message || data.msg || data.Message)) || defaultMessage
      );
    };

    // ------------ mail 驗證流程 ------------
    const isSubmitting = ref(false);
    const countdown = ref(0);
    const hasSentMailCode = ref(false); // 是否已成功發送過一次驗證碼，之後皆視為重新發送

    const mailBtnText = computed(() => {
      if (isSubmitting.value) {
        return "發送中...";
      }
      if (countdown.value > 0) {
        return `重新發送 (${countdown.value}s)`;
      }
      return "發送驗證信";
    });

    SendMailCode = (check_mail) => {
      //check mail
      var mail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // 使用「正規表達式」檢驗格式
      if (!check_mail.match(mail)) {
        alert("E-mail 格式不正確");
        return;
      }

      sendMailCodeRequest(check_mail, hasSentMailCode.value)
        .then((response) => {
          if (response.data.success) {
            // 請求成功，開始倒數，並標記之後皆為重新發送
            hasSentMailCode.value = true;
            startCountdown();
          } else {
            console.log(response.data);
            const message = getApiMessage(response.data, "驗證碼發送失敗");
            console.log(message);
            if (message == "此Email已經註冊過了,可能您已經有帳號,請直接登入") {
              alert(message);
              $("#mail-modal").modal("hide");
              $("#authentication-modal").modal("show");
              $("#authentication-modal").on("hidden.bs.modal", function () {
                window.location.href = "../Home/Index";
              });
              return;
            }

            alert(message);
          }
        })
        .catch(function (error) {
          console.log(error);
          alert(
            getApiMessage(
              error.response && error.response.data,
              "驗證碼發送失敗",
            ),
          );
        })
        .finally(() => {
          isSubmitting.value = false;
          console.log("完成");
        });
    };

    // 發送驗證信
    const sendMailCodeRequest = (check_mail, isResend) => {
      isSubmitting.value = true;

      return axios({
        method: "post",
        url: "/api/AnonymousOTP/SendMailCode",
        headers: { "Content-Type": "application/json" },
        params: { mail: check_mail, IsResend: isResend },
      });
    };

    // 倒數計時器
    let mailCountdownTimer = null;
    const startCountdown = () => {
      countdown.value = 30;
      mailCountdownTimer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          clearInterval(mailCountdownTimer);
        }
      }, 1000);
    };

    const verifyMailCode = (code, mail) => {
      return axios({
        method: "post",
        url: "/api/AnonymousOTP/VerifyMailCode",
        headers: { "Content-Type": "application/json" },
        params: {
          code: code,
          mail: mail,
        },
      });
    };

    //確認mail驗證碼
    confirmMailCode = (code) => {
      if (!code) {
        alert("請輸入驗證碼");
        return;
      }

      blockUI();
      verifyMailCode(code, ru.value.check_mail.v)
        .then((response) => {
          $.unblockUI();
          if (response.data.success) {
            ru.value.mail.v = ru.value.check_mail.v; // 複製驗證過的mail
            $("#mail-modal").modal("hide");
            window.addEventListener("popstate", onBack);
          } else {
            alert(response.data.msg || "驗證碼錯誤或已過期！");
          }
        })
        .catch(function (error) {
          $.unblockUI();
          console.log(error);
          if (error.response && error.response.status == 401)
            alert(error.response.data.Message);
        })
        .finally(() => {
          console.log("完成");
        });
    };

    showHtml = () => {
      $("#show_html_modal").modal("show");

      axios({
        method: "get",
        url: "/api/Twca/MIDClause",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          console.log(response.data);
          if (response.data.code == "0000") {
            html_data.value = response.data.html;
            //    var twca = { clausever: response.data.clausever };
            //    localStorage.removeItem('twca');
            //    localStorage.setItem('twca', JSON.stringify(twca));
          } else {
            //alert('系統錯誤：' + response.data.code + response.data.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          console.log("完成");
        });

      //$.getJSON('https://midonline.twca.com.tw/IDPortal/MIDClause', function (data) {
      //    conso.log(data)
      //    var a = JSON.parse(data);
      //    console.log(a);
      //    conso.log(a.html)
      //    htmlJson.value = a.html;
      //});
    };

    leavePage = () => {
      $("#backModal").modal("hide");
      window.location.href = previousUrl.value;
    };
    keepPage = () => {
      $("#backModal").modal("hide");
    };

    // 組件銷毀時
    onUnmounted(() => {
      window.removeEventListener("popstate", onBack);

      // 清除計時器，防止記憶體洩漏
      if (mailCountdownTimer) clearInterval(mailCountdownTimer);
    });

    return {
      ru,
      Next,
      time_msg,
      minLength: 8,
      maxLength: 18,
      showPassword,
      pwFieldType,
      eye,
      showRepw,
      repwFieldType,
      eyeRepw,
      SendMobileCode,
      showBar,
      sendCoded,
      close,
      showPdf,
      pdf_title,
      disabled,
      SendMailCode,
      showSecond,
      confirmMailCode,
      max: 11,
      showHtml,
      html_data,
      mail_disabled,
      leavePage,
      keepPage,
      mailBtnText,
      isSubmitting,
      countdown,
    };
  },
};

const vml = Vue.createApp(App).mount("#app");

function showMailModal() {
  $("#mail-modal").modal("show");
}

// register.js 是透過 loadVersionedScripts 非同步載入,手機網路較慢時
// window 的 load 事件可能在這支 script 掛上監聽器之前就已經觸發過了,
// 導致驗證信提示彈窗沒有跳出來。若 load 已經發生過就直接執行。
if (document.readyState === "complete") {
  showMailModal();
} else {
  $(window).on("load", showMailModal);
}

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

//-----------------------------------
// Timer Bar
//-----------------------------------
// 目標時間(要倒數幾秒)。
const targetSeconds = 300;
var timerId;
function timeBar() {
  clearInterval(timerId);

  // 起始時間(計時器的啟動時間)。
  const startTime = new Date().getTime();
  // 初始化。
  init(targetSeconds);
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
  var remainingTime = targetSeconds - diffSec;

  // update progess.
  update(remainingTime);

  if (remainingTime == 0) {
    code_timeout();
    // stop the timer.
    clearInterval(timerId);

    // do anything you want to.
    $(".text").text("時間過期!");
    $(".msg").text("時間過期!");
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
  var percent = (seconds / targetSeconds) * 100;
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

var pdfjsLib = window["pdfjs-dist/build/pdf"];
//pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";
var pdfDoc = null;
var scale = 1; //Set Scale for Zoom 大小
var resolution = IsMobile() ? 1.5 : 1; //Set Resolution as per Desktop and Mobile.
function LoadPdfFromUrl(url) {
  //Read PDF from URL.
  pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;

    //Reference the Container DIV.
    var pdf_container = document.getElementById("pdf_container");
    pdf_container.innerText = ""; //init
    pdf_container.style.display = "block";
    pdf_container.style.height = IsMobile() ? "500px" : "820px";

    //Loop and render all pages.
    for (var i = 1; i <= pdfDoc.numPages; i++) {
      RenderPage(pdf_container, i);
    }
  });
}
function RenderPage(pdf_container, num) {
  pdfDoc.getPage(num).then(function (page) {
    //Create Canvas element and append to the Container DIV.
    var canvas = document.createElement("canvas");

    canvas.id = "pdf-" + num;
    ctx = canvas.getContext("2d");
    pdf_container.appendChild(canvas);

    //Create and add empty DIV to add SPACE between pages.
    var spacer = document.createElement("div");
    spacer.style.height = "1px";
    spacer.style.background = "black";
    pdf_container.appendChild(spacer);

    //Set the Canvas dimensions using ViewPort and Scale.
    var viewport = page.getViewport({ scale: scale });
    canvas.height = resolution * viewport.height;
    canvas.width = resolution * viewport.width;

    //Render the PDF page.
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      transform: [resolution, 0, 0, resolution, 0, 0],
    };

    page.render(renderContext);
  });
}

function IsMobile() {
  var r = new RegExp(
    "Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini",
  );
  return r.test(navigator.userAgent);
}

function onBack() {
  $("#backModal").modal("show");
  history.pushState(null, null, location.href);
}
