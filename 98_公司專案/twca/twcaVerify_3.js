const App = {
  setup() {
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const u = reactive({
      id: { v: "", error: "0", msg: "" },
      mobile: { v: "", error: "0", msg: "" },
      type: { v: "", error: "0", msg: "" },
    });
    const hasDisabled = ref(false);

    onMounted(() => {
      //get id_no
      blockUI();
      axios({
        method: "post",
        url: "/api/Twca/GetIdno",
        headers: { "Content-Type": "application/json" },
        params: { type: 0 },
      })
        .then((response) => {
          $.unblockUI();
          if (response.data.success) {
            u.id.v = response.data.value.id_no;
            u.mobile.v = response.data.value.mobile;
          } else {
            alert(response.data.msg);
          }
        })
        .catch(function (error) {
          $.unblockUI();
          console.log(error);
        })
        .finally(() => {});
    });

    const Send = (u) => {
      if (!checkID(u.id.v)) {
        u.id.error = "ng";
        u.id.msg = "身份證號碼寫錯了";
        //return;
      } else {
        u.id.error = "ok";
        u.id.msg = "";
      }
      //------------------------------------
      //check mobile ^(0)([0-9]{1})([-]?)([0-9]{6,8})$
      var mobile = /^09[0-9]{8}$/;
      if (u.mobile.v.search(mobile) == -1) {
        u.mobile.error = "ng";
        u.mobile.msg = "手機號碼格式錯誤 {範例：0920123456}";
      } else {
        u.mobile.error = "ok";
        u.mobile.msg = "";
      }

      if (u.type.v == "") {
        u.type.error = "ng";
        u.type.msg = "請選擇手機所屬電信公司";
      } else {
        u.type.error = "ok";
        u.type.msg = "";
      }

      if (
        u.id.error == "ok" &&
        u.mobile.error == "ok" &&
        u.type.error == "ok"
      ) {
        //check twca clausever
        var twca = JSON.parse(localStorage.getItem("twca"));
        if (twca == null) {
          window.location.href = "../Home/TwcaVerify_1";
          return;
        } else {
          if (twca.clausever == "") {
            window.location.href = "../Home/TwcaVerify_1";
            return;
          }
        }
        hasDisabled.value = true;
        blockUI();
        axios({
          method: "post",
          url: "/api/Twca/VerifyM1",
          headers: { "Content-Type": "application/json" },
          params: {
            clausever: twca.clausever,
            Operator: u.type.v,
            return_url: "",
            type: 0,
          },
        })
          .then((response) => {
            hasDisabled.value = false;
            $.unblockUI();
            console.log(response.data);
            if (response.data.msg == "OK") {
              //轉址  twca
              const form = document.createElement("form");
              form.method = "post";
              form.action = response.data.Url;
              for (const key in response.data.Params) {
                if (response.data.Params[key] != response.data.Url) {
                  if (response.data.Params.hasOwnProperty(key)) {
                    const hiddenField = document.createElement("input");
                    hiddenField.type = "hidden";
                    hiddenField.name = key;
                    hiddenField.value = response.data.Params[key];
                    form.appendChild(hiddenField);
                  }
                }
              }
              document.body.appendChild(form);
              form.submit();
              //-----
            } else {
              //alert(response.data.txt);
            }
          })
          .catch(function (error) {
            hasDisabled.value = false;
            $.unblockUI();
            console.log(error);
          })
          .finally(() => {
            console.log("完成");
          });
      }
    };

    return {
      u,
      Send,
      hasDisabled,
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
