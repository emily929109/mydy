const App = {
  setup() {
    const ru = ref({
      // 格式  v : 值，error : ng || ok，msg : 錯誤訊息
      mobile: { v: "", error: "0", msg: "" },
      mail: { v: "", error: "0", msg: "" },
      pw_register: { v: "", error: "0", msg: "" },
      repw_register: { v: "", error: "0", msg: "" },
      otpNum: { v: "", error: "0", msg: "" },
      agree: { v: false, error: "0", msg: "" },
      recommend_code: { v: "", error: "0", msg: "" },
    });

    const time_msg = ref("");
    const showPassword = ref(false);
    const pwFieldType = ref("password");
    const showRepw = ref(false);
    const repwFieldType = ref("password");
    const otp_code = ref("");
    const showBar = ref(false);
    const sendCoded = ref(false);
    const disabled = ref(false);
    const mail_disabled = ref(false);
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const showSecond = ref("0");
    const html_data = ref("");
    const dudu_order = JSON.parse(localStorage.getItem("dudu_order"));
    const purchase_item = JSON.parse(sessionStorage.getItem("purchase_item"));
    const previousUrl = ref("");

    onMounted(() => {
      // 已登入且已完成註冊流程
      if (member.value !== null && member.value.login_ok_msg == "*") {
        alert("您已經有帳號登入了,如要申請新帳號請先登出！");
        window.location.href = "../Home/Index";
        return;
      }

      // 尚未走完註冊流程且已離開過頁面，登入後由menutop.js決定要導去哪一步
      if (member.value !== null && member.value.login_ok_msg != "*") {
        alert("您已經有註冊帳號,請「會員登入」後繼續完成註冊流程！");
        window.location.href = "../Home/Index";
        return;
      }

      // 推薦碼入口 : 會員中心我的推薦
      var _push = getUrlParameter("push");
      if (_push != "null") {
        ru.value.recommend_code.v = _push.trim();
        disabled.value = true;
      }

      // 按上一頁跳提示
      window.addEventListener("popstate", onBack);
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
      var mail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/; // 使用「正規表達式」檢驗格式
      if (!ru.value.mail.v) {
        ru.value.mail.error = "ng";
        ru.value.mail.msg = "電子信箱不可為空";
      } else if (ru.value.mail.v.match(mail)) {
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

    const showPdf = () => {
      $("#pdf_msg")
        .one("shown.bs.modal", function (e) {
          LoadPdfFromUrl("/img/DUDUPAY隱私權政策條款1131101.pdf");
        })
        .modal("show");
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
      disabled,
      showSecond,
      // 推薦碼
      max: 11,

      showHtml,
      html_data,
      mail_disabled,
      leavePage,
      keepPage,
    };
  },
};

const vml = Vue.createApp(App).mount("#app");

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

//============PDF=======================
// pdf.js套件的原理 : 把 pdf 每一頁個別 render 在 canvas
// 用到的 API :
// 1. pdfjsLib.getDocument(url) : 下載 pdf 並解析成一個promise物件 PDFDocumentProxy
// 2. pdf.getPage(pageNum) :  針對某一頁，拿到該頁的繪圖資訊
// 3. page.render({ canvasContext, viewport })

var pdfjsLib = window["pdfjs-dist/build/pdf"];
pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";
var pdfDoc = null;
var scale = 1;

function LoadPdfFromUrl(url) {
  //Read PDF from URL.
  pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;

    //Reference the Container DIV.
    var pdf_container = document.getElementById("pdf_container");
    pdf_container.innerText = ""; //init
    pdf_container.style.display = "block";

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
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    //Render the PDF page.
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    page.render(renderContext);
  });
}

function onBack() {
  $("#backModal").modal("show");
  history.pushState(null, null, location.href);
}
