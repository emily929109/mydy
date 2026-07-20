const App = {
  setup() {
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const u = reactive({
      pw: { v: "", error: "0", msg: "" },
      repw: { v: "", error: "0", msg: "" },
    });

    const showPassword = ref(false);
    const pwFieldType = ref("password");

    onMounted(() => {
      if (member.value == null) {
        window.location.href = "../Home/Index";
        return;
      }
    });

    eye = () => {
      pwFieldType.value = pwFieldType.value == "password" ? "text" : "password";
      showPassword.value = !showPassword.value;
    };

    confirm = () => {
      //check pw
      if (u.pw.v.length < 8 || u.pw.v.length > 18) {
        u.pw.error = "ng";
        u.pw.msg = "密碼至少 8 字，至多 18 字";
        //alert('至少 8 字，至多 18 字);
        return;
      } else {
        u.pw.error = "ok";
        u.pw.msg = "";
      }

      //------------------------------------
      //有大寫
      var hasUpper = /[A-Z]/.test(u.pw.v);
      if (!hasUpper) {
        u.pw.error = "ng";
        u.pw.msg = "要有英文大寫";
        //alert('要有英文大寫');
        return;
      } else {
        u.pw.error = "ok";
        u.pw.msg = "";
      }
      //---
      //有小寫
      var hasLower = /[a-z]/.test(u.pw.v);
      if (!hasLower) {
        u.pw.error = "ng";
        u.pw.msg = "要有英文小寫";
        //alert('要有英文小寫');
        return;
      } else {
        u.pw.error = "ok";
        u.pw.msg = "";
      }
      //有數字
      var hasNumber = /[0-9]/.test(u.pw.v);
      if (!hasNumber) {
        u.pw.error = "ng";
        u.pw.msg = "要有數字";
        //alert('要有數字');
        return;
      } else {
        u.pw.error = "ok";
        u.pw.msg = "";
      }

      //避開特殊字元
      var hasSpecChar = /[!！@#$%&]/.test(u.pw.v);
      if (hasSpecChar) {
        u.pw.error = "ng";
        u.pw.msg = "不能有特殊字如: !@#$%&";
        //alert('不能有特殊字如: !@#$%&');
        return;
      } else {
        u.pw.error = "ok";
        u.pw.msg = "";
      }

      //check repw
      if (u.pw.v != u.repw.v) {
        u.repw.error = "ng";
        u.repw.msg = "請再輸入相同的值";
      } else {
        u.repw.error = "ok";
        u.repw.msg = "";
      }

      if (u.pw.error != "ok" || u.repw.error != "ok") {
        return;
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/Member/ReSetPassword",
        headers: { "Content-Type": "application/json" },
        params: {
          pw: u.pw.v,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            //clear storage
            localStorage.clear();
            //set role
            header_app.clearMenuForRole(); //top menu
            menuLeftApp.clearMenuForRole(); //left menu
            buttom_menuApp.clearMenuForRole(); //buttom menu

            alert("變更密碼成功,請用新密碼重新登入！");
            $("#authentication-modal").modal("show");
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

    //bar 時間過期
    code_timeout = () => {
      otp_code.value = "";
    };

    return {
      confirm,
      showPassword,
      pwFieldType,
      u,
      eye,
    };
  },
};

Vue.createApp(App).mount("#app");

$(window).on("load", function () {
  //showLogin(JSON.parse(localStorage.getItem('member')));
});
