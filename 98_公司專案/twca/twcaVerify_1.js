const App = {
  setup() {
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const u = reactive({
      agree: { v: false, error: "0", msg: "" },
      isSelf: "0",
    });
    const showMsg = ref(true);

    onMounted(() => {});

    const Send = (u) => {
      console.log(u);

      //check 同意否
      if (!u.agree.v && u.isSelf == "0") {
        //門號為本人
        u.agree.error = "ng";
        u.agree.msg = "請關閉手機的WI-FI並使用4G/5G網路";
        alert("請關閉手機的WI-FI並使用4G/5G網路");
        //return;
      } else {
        u.agree.error = "ok";
        u.agree.msg = "";
      }

      if (u.agree.error == "ok" && u.isSelf == "0") {
        window.location.href = "../Home/TwcaVerify_2";
      } else if (u.isSelf == "1") {
        //write db 選擇門號非本人
        blockUI();
        axios({
          method: "post",
          url: "/api/Member/WriteTwcaMsg",
          headers: { "Content-Type": "application/json" },
        })
          .then((response) => {
            console.log(response.data);
          })
          .catch(function (error) {
            console.log(error);
          })
          .finally(() => {
            $.unblockUI();
            console.log("完成");
          });

        window.location.href = "../Home/MemberSign2";
      }
    };

    const changed = (_type) => {
      if (_type == "0") showMsg.value = true;
      else showMsg.value = false;
    };

    //initCheckbox = () => {
    //    u.agree.v = false;
    //}

    return {
      u,
      Send,
      showMsg,
      changed,
    };
  },
};

const vml = Vue.createApp(App).mount("#app");

$(window).on("load", function () {
  //上一頁
  //if (!!window.performance && window.performance.navigation.type === 2) {
  //    //!! 用來檢查 window.performance 是否存在
  //    //window.performance.navigation.type ===2 表示使用 back or forward
  //    console.log('Reloading');
  //    initCheckbox();
  //    //window.location.reload();//或是其他動作
  //}
});
