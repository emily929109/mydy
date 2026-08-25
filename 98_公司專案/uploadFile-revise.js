//const { createApp, ref, reactive, onMounted } = Vue;

var baseUrl = window.location.href.indexOf("localhost") == -1 ? "/DuDuPay" : "";
const App = {
  setup() {
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const image1_path = ref(false);
    const image2_path = ref(false);
    const image3_path = ref(false);
    const image4_path = ref(false);
    const image5_path = ref(false);
    const file_1 = ref(null);
    const file_2 = ref(null);
    const file_3 = ref(null);
    const file_4 = ref(null);
    const file_5 = ref(null);
    const isDisabled = ref(true);
    const showEasyButton = ref(true);
    const uploadCheck = ref({
      file_1: { error: "0", msg: "" },
      file_2: { error: "0", msg: "" },
      file_4: { error: "0", msg: "" },
    });

    onMounted(() => {
      if (member.value == null) {
        window.location.href = "../Home/Index";
        return;
      }

      //eantodo註冊帶訂單AE86 不顯示簡易註冊按鈕
      var _noshow = getUrlParameter("noshow");
      if (_noshow != "null") {
        if (_noshow == "1") //hidden button
        {
          showEasyButton.value = false;
        } else {
          alert("url參數錯誤,請勿自行更改");
          window.location.href = "../Home/Index";
          return;
        }
      }
    });

    handleFileUpload = (item, e) => {
      console.log(e);
      isDisabled.value = true;
      const file = e.target.files[0],
        // file size
        fileSize = Math.round((file.size / 1024 / 1024) * 100) / 100,
        // 副檔名，pop為取最後一個元素
        fileExtention = file.name.split(".").pop(),
        // 檔名
        fileName = file.name.split(".").shift(),
        // 檢查檔案型式
        isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtention);

      if (!isImage) {
        alert("檔案格式不正確！(只適用以下檔案格式jpg,jpeg,png,gif)");
        return;
      }

      if (fileSize >= 9.9) {
        alert("不允許,檔案過大！");
        return;
      }

      blockUI();
      createImage(item, file);
    };

    //  產生預覽圖並上傳
    createImage = (item, file) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);

      // 註冊監聽事件：當檔案讀取並將二進為轉換成base64 url後
      reader.onload = (e) => {
        let img = new Image();

        img.onload = () => {
          // 3. 瀏覽器解碼完成，觸發 onload，這時才執行 switch case 賦值
          switch (item) {
            case "ID0A":
              image1_path.value = e.target.result;
              break;
            case "ID0B":
              image2_path.value = e.target.result;
              break;
            case "ID0Q":
              image3_path.value = e.target.result;
              break;
            case "ID0L":
              image4_path.value = e.target.result;
              break;
            case "ID0C":
              image5_path.value = e.target.result;
              break;
            default:
          }

          var per = 1;
          var width = img.width;
          if (img.width > 400) {
            width = 400;
            per = 400 / img.width;
          }

          // 1. 瀏覽器先讀到這一行，把 Base64 塞給 img.src
          submitFile(item, file, width, Math.ceil(per * img.height));

          // 2. 瀏覽器看到 src 有東西了，開始在背景解碼這張圖片（非同步消耗時間）
        };
        img.src = e.target.result;
      };
    };

    submitFile = (item, file, _width, _height) => {
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      let formData = new FormData();

      formData.append("file", file);
      formData.append(
        "data",
        JSON.stringify({ img: item, width: _width, height: _height }),
      );

      axios({
        method: "post",
        url: "/api/Upload/PostFormData",
        //Content-Type': 'multipart/form-data' 會覆蓋header.js Authorization 所以要重新設Authorization
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${""}`,
        },
        data: formData,
      })
        .then((response) => {
          $.unblockUI();
          isDisabled.value = false;
          if (response.data.success) {
          } else {
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          $.unblockUI();
        })
        .finally(() => {});
    };

    const scrollToFirstError = () => {
      Vue.nextTick(() => {
        const el = document.querySelector("#upload-section .error_border");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus({ preventScroll: true });
        }
      });
    };

    const next = () => {
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      //身分證正面
      if (typeof file_1.value.files[0] == "undefined") {
        uploadCheck.value.file_1.error = "ng";
        uploadCheck.value.file_1.msg = "請上傳身分證正面";
      } else {
        uploadCheck.value.file_1.error = "ok";
        uploadCheck.value.file_1.msg = "";
      }

      //身分證反面
      if (typeof file_2.value.files[0] == "undefined") {
        uploadCheck.value.file_2.error = "ng";
        uploadCheck.value.file_2.msg = "請上傳身分證反面";
      } else {
        uploadCheck.value.file_2.error = "ok";
        uploadCheck.value.file_2.msg = "";
      }

      //自拍照
      if (typeof file_4.value.files[0] == "undefined") {
        uploadCheck.value.file_4.error = "ng";
        uploadCheck.value.file_4.msg = "請上傳自拍照";
      } else {
        uploadCheck.value.file_4.error = "ok";
        uploadCheck.value.file_4.msg = "";
      }

      var isValid =
        uploadCheck.value.file_1.error == "ok" &&
        uploadCheck.value.file_2.error == "ok" &&
        uploadCheck.value.file_4.error == "ok";

      if (!isValid) {
        scrollToFirstError();
        return;
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/Upload/SaveStep",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${""}`,
        },
        params: {},
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            var _type = getUrlParameter("type");
            if (_type != "null") {
              //超額申請時 填超額申請的基本資料畫面
              if (_type == "D") window.location.href = "../Home/MemberInfo_D";
              else alert("url參數錯誤,請勿自行更改");
            } else {
              window.location.href = "../Home/MemberInfo";
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

    //eantodo簡易註冊按鈕 click 寫入db member 註冊方式
    easy = () => {
      var member = JSON.parse(localStorage.getItem("member"));
      blockUI();
      axios({
        method: "post",
        url: "/api/Upload/EasyRegister",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${""}`,
        },
        params: {},
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            window.location.href = "../Home/MemberInfo_easy";
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
      image1_path,
      image2_path,
      image3_path,
      image4_path,
      image5_path,
      file_1,
      file_2,
      file_3,
      file_4,
      file_5,
      handleFileUpload,
      submitFile,
      next,
      isDisabled,
      easy,
      showEasyButton,
      uploadCheck,
    };
  },
};

const vml = Vue.createApp(App).mount("#app");

$(window).on("load", function () {});

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
