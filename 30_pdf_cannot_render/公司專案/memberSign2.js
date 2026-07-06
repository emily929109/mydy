//const { createApp, ref, onMounted, reactive, onUnmounted } = Vue;

var video;
var canvas_video;
var canvas_signature;
var sign_show = false;

const App = {
  setup() {
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const constraints = {
      audio: false,
      video: {
        facingMode: "user", // "user" 前鏡頭，"environment" 後鏡頭
        //width: 1280, height: 720
      },
    };

    const msg = ref("");
    const error_msg = ref("");
    const checked = ref(false);
    //const contractImage = ref('/img/DUDUPAY享額度約定約定書_20231006.pdf');
    //const contractImage = ref('/img/聲明書.jpg');

    const google = reactive({ longitude: "", latitude: "" });
    const finish = ref(false);
    const showSignButton = ref(false);
    const order = ref({});
    const test_order = ref("");

    //var count = 0;

    _initLoad = () => {
      localStorage.removeItem("dudu_order");
      //read db get 訂單 //save localStorage
      var member = JSON.parse(localStorage.getItem("member"));
      //alert(JSON.stringify(member));
      blockUI();
      axios({
        method: "post",
        url: "/api/Member/CheckRegisterOrder",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          console.log(response.data);
          if (response.data.success) {
            test_order.value = response.data.order_type; //'註冊帶訂單';
            order.value = response.data;
            //alert(JSON.stringify(response.data));
            //save to localStorage
            localStorage.setItem("dudu_order", JSON.stringify(response.data));
          } else {
            alert(response.data.msg);
            return;
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

    onMounted(() => {
      //return axios({
      //    method: 'post',
      //    url: '/api/Member/DecryptByDES',
      //    headers: { 'Content-Type': 'application/json' },
      //    params: { code: 'jIQ8iGB4xWqQ8uYQM67d7g==' }//要解密的內容
      //}).then((response) => {
      //    return response.data;
      //}).catch((function (error) {
      //    console.log(error);
      //})).finally(() => {
      //    console.log('完成');
      //});

      var _code = getUrlParameter("code");
      if (_code == "null") {
        //PC
        //未登入或己完成註冊
        var member = JSON.parse(localStorage.getItem("member"));
        if (member == null) {
          //if (member.value == null) {
          window.location.href = "../Home/Index";
          return;
        }
      } else {
        //轉手機
      }

      // _signalR();

      //簽名板 顯示時的處理 因應 modal
      $("#sign_msg").on("shown.bs.modal", function (e) {
        sign_show = true;
        //if (count == 0) {

        let canvas = $("#signature-pad");
        let parentWidth = $(canvas).parent().outerWidth();
        let parentHeight = $(canvas).parent().outerHeight();
        canvas
          .attr("width", parentWidth + "px")
          .attr("height", parentHeight + "px");
        signaturePad.clear(); //init

        //--
        let canvas_video = $("#video-pad");
        let parentWidth2 = $(canvas_video).parent().outerWidth();
        let parentHeight2 = $(canvas_video).parent().outerHeight();
        canvas_video
          .attr("width", parentWidth2 + "px")
          .attr("height", parentHeight2 + "px");

        //};
        // count = count + 1;
      });

      $("#sign_msg").on("hide.bs.modal", function (e) {
        sign_show = false;
        console.log(sign_show);
      });
    });

    _signalR = () => {
      ////(1)連線 signalR hub
      //$.connection.hub.logging = true;//show log
      //window.jQuery.connection.hub.url = "http://192.168.78.21/SaiRservice/SignalR";
      window.jQuery.connection.hub.url = "http://localhost:14908/SignalR";

      //(2)收到 server  data and binning
      var signHub = $.connection.signHub;
      signHub.client.sign = function (data) {
        console.log("signR ok");
      };

      //(3)登入 signalR server
      $.connection.hub
        .start({ transport: ["webSockets", "longPolling"] })
        .done(function () {
          //var today = new Date();
          //var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

          //console.log('start:' + time);
          console.log(
            "header Now connected, connection ID=" + $.connection.hub.id,
          );
          console.log(
            "Connected, transport = " + $.connection.hub.transport.name,
          );
          //console.log(window.location.pathname);///products/search.php '/'
          //console.log(window.location.search);//?q = ipad   ''
          //console.log(window.hash); //#featured  undefined

          ////set user to signalR
          ////var member = JSON.parse(localStorage.getItem('member'));
          //if (member.value !== null) {
          //    var pageName;
          //    var href = window.location.pathname.trim().toLowerCase().replace('/DuDuPay', '');
          //    //console.log(href);
          //    if (href == '' || href == '/home/index' || href == '/home' || href == '/home/' || href == '/')
          //        pageName = '/home/index';
          //    else
          //        pageName = href;
          //    memberHub.server.setUser($.connection.hub.id, member.value.name, pageName);
          //}
        })
        .fail(function () {
          console.log("Could not Connect!");
        });

      ////偵測中斷連接的原因 只要斷線就會被觸發
      //$.connection.hub.disconnected(function () {
      //    if ($.connection.hub.lastError) {
      //        //console.log("斷線重連: " + $.connection.hub.lastError.message);

      //        //----重連線
      //        $.connection.hub.start({ transport: ['webSockets', 'longPolling'] }).done(function () {
      //            //var today = new Date();
      //            //var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

      //            //console.log('斷線重連 ID=' + $.connection.hub.id + ' ' + time);
      //            //console.log("Connected, transport = " + $.connection.hub.transport.name);

      //            //set user to signalR
      //            //var member = JSON.parse(localStorage.getItem('member'));
      //            if (member.value !== null) {
      //                var pageName;
      //                var href = window.location.pathname.trim().toLowerCase().replace('/DuDuPay', '');
      //                if (href == '' || href == '/home/index' || href == '/home' || href == '/home/' || href == '/')
      //                    pageName = '/home/index';
      //                else
      //                    pageName = href;
      //                memberHub.server.setUser($.connection.hub.id, member.value.name, pageName);
      //            }

      //        }).fail(function () { console.log('Could not Connect!'); });

      //    }

      //});
    };

    //送出
    const Send = () => {
      if (signaturePad.isEmpty() && !finish.value) {
        alert("請先提供簽名！");
        //error_msg.value = '請先提供簽名！';
        //$('#toolmsg').modal('show');
        return;
      }
      if (!finish.value) {
        alert("簽名過程有錯誤，請洽客服");
        return;
      }

      console.log(order.value);
      //alert(JSON.stringify(order.value));

      if (
        order.value.order_type == "綜合" ||
        order.value.order_type == "足額"
      ) {
        //綜合 不帶訂單 顯示照會時間
        msg.value =
          "已收到您的申請資料，我們將儘快審核您的數位額度，審查結果將以簡訊通知，您也可以於1個工作日後登入會員，查詢您的數位額度。";
        $("#finishmsg").modal("show");
      } else if (order.value.order_type == "超額") {
        //alert('超額');
        _nonMemberClose("超額");
      } else if (order.value.order_type == "註冊帶訂單") {
        //帶訂單 不顯示照會時間 直接存檔
        _nonMemberClose("註冊帶訂單");
      }
    };

    //顯示簽名板
    signButton = () => {
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) {
        $("#authentication-modal").modal("show");
        return;
      }

      VideoInit();
    };

    //顯示簽名板
    var changeWidth = 0;
    showSignPad = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches; //直立 true
      //橫式 控制video
      if (!portrait) changeWidth = 250;
      else changeWidth = 0;
      //---
      $("#sign_msg").modal("show");
      // 經緯度
      navigator.geolocation.getCurrentPosition(function (position) {
        google.longitude = position.coords.longitude;
        google.latitude = position.coords.latitude;
      });
    };

    clearImage = () => {
      signaturePad.clear();
    };

    //確定簽名
    saveImage = async () => {
      if (signaturePad.isEmpty()) {
        alert("請先提供簽名！");
        return;
      }

      video.pause();
      video.currentTime = 0;

      var member = JSON.parse(localStorage.getItem("member"));
      //get url to page check 是否電腦轉手機簽
      var _code = getUrlParameter("code");
      console.log(_code);
      var _id;
      var _mobile;
      //手機簽署解密
      if (_code !== "null") {
        var code = await DecryptByDES(_code);
        console.log(code);
        var data = code.split("|"); //解密後 id|mobile
        _id = data[0];
        _mobile = data[1];
      } else {
        _id = member.id;
        _mobile = member.mobile;
      }

      if (_id != member.id) {
        alert("目前登入的帳號與要簽署的會員不同人,請先登出後再繼續操作");
        return;
      }

      blockUI_txt();
      //去背
      removeImgBg(canvas_signature);
      var ctx = canvas_video.getContext("2d");

      var img = new Image();
      img.src = "";
      img.src = canvas_signature.src;
      img.onload = function () {
        //merge image
        //ctx.drawImage(img, 0, 0);

        //send to web api
        //save base64
        var sign_image = signaturePad
          .toDataURL("image/jpeg")
          .replace("data:image/jpeg;base64,", "");
        axios({
          method: "post",
          url: "/api/Member/SaveImageMerge",
          headers: { "Content-Type": "application/json" },
          //id:
          data: {
            sign_base64: sign_image,
            video_base64: canvas_video
              .toDataURL()
              .replace("data:image/png;base64,", ""),
          },
        })
          .then((response) => {
            $.unblockUI();
            console.log(response);
            if (response.data.success) {
              finish.value = true;
              $("#sign_msg").modal("hide");
              LoadPdfFromUrl("/img/" + _mobile + "/ID0K-000.pdf");

              alert("簽名成功,請繼續按送出");

              //contractImage.value = 'data:image/jpeg;base64,' +  response.data.base64;
              //contractImage.value = 'data:image/jpeg;base64,' + response.data.base64[0];
              //contractImage.value = 'data:image/jpeg;base64,' + response.data.base64[1];
              //contractImage.value = 'data:image/jpeg;base64,' + response.data.base64[2];
            } else {
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
    };

    //----video pad
    const getCameraStream = (video) => {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function success(stream) {
          showSignPad();
          video.srcObject = stream;
        })
        .catch((err) => {
          //電腦轉手機簽署
          //如果不允許攝影 也變進入此 顯示qrcode
          //showSignPad();//test debug
          computeToMobileSign();
        });
    };

    //電腦轉手機簽署
    const computeToMobileSign = async () => {
      //error_msg.value = '請掃描 QR-code 使用手機確定簽名';
      $("#toolmsg").modal("show");

      if (typeof qrcode == "undefined" && member != null) {
        CreateQRCode(await GetEncrypt());
      }
    };
    //加密
    const GetEncrypt = () => {
      var member = JSON.parse(localStorage.getItem("member"));
      // alert(member.id + ' ' + member.mobile);
      //get url string
      //加密 後產生 string qrcode
      return axios({
        method: "post",
        url: "/api/Member/EncryptByDES",
        headers: { "Content-Type": "application/json" },
        params: { code: member.id + "|" + member.mobile }, //要加密的內容
      })
        .then((response) => {
          //alert(response.data);
          return response.data;
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          console.log("完成");
        });
    };
    //解密
    const DecryptByDES = (code) => {
      return axios({
        method: "post",
        url: "/api/Member/DecryptByDES",
        headers: { "Content-Type": "application/json" },
        params: { code: code }, //要解密的內容
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

    var qrcode;
    const CreateQRCode = (EncryptTxt) => {
      console.log(EncryptTxt);
      //var code_text;
      ////註冊帶訂單
      //if (order_register != null) {
      //    code_text = dudu_url + 'Home/MemberSign2?openExternalBrowser=1&code=' + EncryptTxt
      //        + '&order_register=' + order_register.url;

      //}
      //else {
      //    //超額
      //    if (order_amount != null && !order_amount.ok && order_amount.order != null) {
      //        console.log(order_amount);
      //        var _n = order_amount.period.hasOwnProperty('n') ? order_amount.period.n : order_amount.period
      //        console.log(_n);
      //        //alert('超額');
      //        //var o = order_amount.order;
      //        code_text = dudu_url + 'Home/MemberSign2?openExternalBrowser=1&code=' + EncryptTxt
      //            + '&order_amount=' + order_amount.url
      //            + '&order=' + encodeURIComponent(JSON.stringify(order_amount.order))

      //            + '&period=' + _n
      //        console.log(order_amount);

      //    }
      //    else {
      //        code_text = dudu_url + 'Home/MemberSign2?openExternalBrowser=1&code=' + EncryptTxt;
      //    }

      //}

      //console.log(code_text);

      //console.log(EncryptTxt);//已加密過
      qrcode = new QRCode(document.getElementById("qrcode"), {
        //text: code_text, //dudu_url + 'Home/MemberSign2?openExternalBrowser=1&code=' + EncryptTxt,//加密後內容"
        text:
          dudu_url +
          "Home/MemberSign2?openExternalBrowser=1&code=" +
          EncryptTxt, //加密後內容"
        width: 300,
        height: 300,
        colorDark: "#5868bf",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    };

    getFrameFromVideo = (video, canvas) => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.shadowColor = "rgb(255, 255, 255)";
      //SignaturePad.prototype.removeBlanks(ctx);
      ctx.save();
      ctx.translate(video.width - changeWidth, 0); //橫式 - changeWidth
      ctx.scale(-1, 1);
      //ctx.scale(1, 1);
      ctx.drawImage(video, 0, 0, video.width, video.height);
      ctx.restore();

      //tmpbase64.value = canvas.toDataURL();//test
      canvas_video = canvas;

      requestAnimationFrame(() => getFrameFromVideo(video, canvas));
    };

    VideoInit = () => {
      canvas_video = document.getElementById("video-pad");
      canvas_video.height = 400;
      canvas_video.width = screen.width;

      //video
      video = document.getElementById("signature-video");
      video.height = 400;
      video.width = screen.width;
      //更正 safari video stream 黑頻
      //https://stackoverflow.com/questions/68797537/accessing-the-camera-in-ios-safari-on-an-iphone
      //https://leemartin.dev/hello-webrtc-on-safari-11-e8bcb5335295
      video.setAttribute("autoplay", "");
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");

      //video.autoplay = true;
      //video.controls = true;

      getCameraStream(video); //video pad
      getFrameFromVideo(video, canvas_video);
    };

    //一般流程 照會時間 完成註冊
    const Close = async (_checked) => {
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) {
        $("#authentication-modal").modal("show");
        return;
      }

      if (!_checked) {
        alert("請選擇方便聯絡您的時間！");
        return;
      }
      var member = JSON.parse(localStorage.getItem("member"));
      //get url to page check 是否電腦轉手機簽
      var _code = getUrlParameter("code");
      var _id;
      //手機簽署解密
      if (_code !== "null") {
        var code = await DecryptByDES(_code);
        var data = code.split("|"); //解密後 id|mobile
        _id = data[0];
      } else {
        _id = member.id;
      }

      if (_id != member.id) {
        alert("目前登入的帳號與要簽署的會員不同人,請先登出後再繼續操作");
        return;
      }

      blockUI_txt();
      //axios write db
      axios({
        method: "post",
        url: "/api/Member/FinishRegister",
        headers: { "Content-Type": "application/json" },
        params: {
          time: _checked,
          longitude: google.longitude,
          latitude: google.latitude,
          order_type: "綜合",
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            $("#finishmsg").modal("hide");
            $("#registerOK").modal("show");
          } else {
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          $.unblockUI();
          console.log("FinishRegister 完成");
        });
    };
    //註冊帶訂單或超額 完成註冊
    const _nonMemberClose = async (_order_type) => {
      var member = JSON.parse(localStorage.getItem("member"));
      //get url to page check 是否電腦轉手機簽
      var _code = getUrlParameter("code");
      var _id;
      //手機簽署解密
      if (_code !== "null") {
        var code = await DecryptByDES(_code);
        var data = code.split("|"); //解密後 id|mobile
        _id = data[0];
      } else {
        _id = member.id;
      }

      if (_id != member.id) {
        alert("目前登入的帳號與要簽署的會員不同人,請先登出後再繼續操作");
        return;
      }

      //alert(_id );
      //alert(google.longitude);
      //alert(google.latitude);
      console.log(_id);
      console.log(google.longitude);
      console.log(google.latitude);

      blockUI_txt();
      //axios write db
      axios({
        method: "post",
        url: "/api/Member/FinishRegister",
        headers: { "Content-Type": "application/json" },
        params: {
          time: "",
          longitude: google.longitude,
          latitude: google.latitude,
          order_type: _order_type,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            //註冊帶訂單 轉到訂單頁
            if (order.value.order_type == "註冊帶訂單") {
              window.location.href = order.value.order_url;
            }
            //超額 顯示訂單確認
            else if (order.value.order_type == "超額") {
              console.log(order.value.trade_url);
              window.location.href = order.value.trade_url;
            }
          } else {
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          $.unblockUI();
          console.log("FinishRegister 完成");
        });
    };

    //page load save twca message
    pageLoad_save_twca_message = (twca_msg) => {
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;
      axios({
        method: "post",
        url: "/api/Member/SaveTwcaMessage",
        headers: { "Content-Type": "application/json" },
        params: { id: member.id, twcaMessage: twca_msg },
      })
        .then((response) => {
          console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          console.log("SaveTwcaMessage 完成");
        });
    };

    closeRegisterOK = () => {
      localStorage.removeItem("member");
      $("#registerOK").modal("hide");
      //顯示加頼
      $("#lineModal").modal("show");
      // window.location.href = '../Home/Index';
    };

    showButton = () => {
      showSignButton.value = true;
    };

    return {
      msg,
      Send,
      checked,
      error_msg,
      signButton,
      clearImage,
      saveImage,
      //img_path,
      //contractImage,
      VideoInit,
      google,
      finish, //tmpbase64
      Close,
      closeRegisterOK,
      showSignButton,
      test_order,
    };
  },
};

const vml = Vue.createApp(App).mount("#app");

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
//var iframe;
$(window).on("load", function () {
  //alert('1');
  //M1 手機驗證回寫db
  var twca = localStorage.getItem("twca_msg");
  if (typeof twca !== "undefined" && twca !== null) {
    //alert('2');
    var twca_msg = JSON.parse(
      twca.replaceAll('"', "").replaceAll("&quot;", '"'),
    );
    //取消簽章返回(3000-0000)
    if (twca_msg.ReturnCode == "2033000") {
      localStorage.removeItem("twca_msg");
      window.location.href = "../Home/TwcaVerify_1";
      return;
    }
    pageLoad_save_twca_message(JSON.stringify(twca_msg));
  } else {
    // 若尚未重整過才執行 reload
    if (!sessionStorage.getItem("reloadedOnce")) {
      sessionStorage.setItem("reloadedOnce", "true");
      location.reload(); // ✅ 只重整一次
    }
  }
  //alert('享後付條款暨約定書');
  LoadPdfFromUrl("/img/DUDUPAY享後付條款暨約定書.pdf");
  //alert('享後付條款暨約定書end');

  var member = JSON.parse(localStorage.getItem("member"));
  if (member == null) {
    $("#authentication-modal").modal("show");
    return;
  }

  _initLoad();
});

canvas_signature = document.getElementById("signature-pad");
function resizeCanvas() {
  var ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas_signature.width = canvas_signature.offsetWidth * ratio;
  canvas_signature.height = canvas_signature.offsetHeight * ratio;
  canvas_signature.getContext("2d").scale(ratio, ratio);

  //顯示簽名板且轉動手機時
  if (sign_show) {
    location.reload();
  }
}

window.onresize = resizeCanvas;
resizeCanvas();

var signaturePad = new SignaturePad(canvas_signature, {
  backgroundColor: "rgb(255, 255, 255)", // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG
  penColor: "Blue",
});

//============PDF=======================
var pdfjsLib = window["pdfjs-dist/build/pdf"];
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";
var pdfDoc = null;
var scale = 1; //Set Scale for Zoom.
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

    //顯示簽名處
    showButton();
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
    spacer.style.height = "20px";
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

    //到合約底部
    pdf_container.scrollTo(0, pdf_container.scrollHeight - 0); //550
  });
}

function IsMobile() {
  var r = new RegExp(
    "Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini",
  );
  return r.test(navigator.userAgent);
}
