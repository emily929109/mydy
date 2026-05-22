const App = {
  setup() {
    const member = ref(JSON.parse(localStorage.getItem("member")));
    const showRow = ref(false);
    const jsonMember = ref({});
    const sel_role = ref("");
    const sub_role = ref("");
    const jsonRole = ref({});
    const jsonAuthority_acc = ref({});
    const jsonAuthority_role = ref({});
    const showAuthority = ref(false);
    const u = reactive({
      isStart: false,
      acc: "",
      sel_role: "",
      sel_branch: "",
      dealer_acc_name: "",
    });
    const m = reactive({ dealer_acc: "", dealer_role: "" });
    const branch = ref("");
    const jsonBranch = ref([]);

    onMounted(() => {
      $("#role-modal").on("shown.bs.modal", function (e) {
        jsonBranch.value = jsonBranch.value;
      });

      _getMemberList();
    });

    _getMemberList = () => {
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/Init",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member.id },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            jsonMember.value = response.data.value;
            jsonRole.value = response.data.roles;
            jsonBranch.value = response.data.branchs;
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

    //顯示 角色名稱&權限管理
    showRoleModal = () => {
      $("#role-modal").modal("show");
    };

    //新增角色
    addRole_sub = (_sub_role) => {
      if (_sub_role == "") return;
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      if (_sub_role == "負責人") {
        alert("已經有負責人角色！");
        return;
      }
      if (hasFullShape(_sub_role)) {
        alert("不可用全形！");
        return;
      }
      if (hasSpecialStr(_sub_role)) {
        alert("不可用特殊字元");
        return;
      }
      if (_sub_role.length > 10) {
        //空白為null
        alert("不可超過10個字！");
        return;
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/addRole_sub",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member.id, role: _sub_role },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            jsonRole.value = response.data.value;
            alert("新增成功");
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
    //刪除角色
    delRole_sub = (_sel_role) => {
      if (_sel_role == "") return;
      sel_role.value = _sel_role; //ean new add
      $("#deleteRole_modal").modal("show");
    };

    //確認刪除角色
    confirmDeleteRole = () => {
      if (sel_role.value == "") return;
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      console.log(sel_role.value);
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/DeleteRole",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member.id, role: sel_role.value },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            $("#deleteRole_modal").modal("hide");
            //重新更新
            _getMemberList();
            alert("刪除成功！");
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

    //新增帳號中 選擇角色
    selRole = (_sel_role) => {
      if (_sel_role == "") {
        jsonAuthority_acc.value = []; //init clear
        return;
      }
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/GetAuthority",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member.id, role: _sel_role },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          console.log(response.data.success);
          if (response.data.success) {
            jsonAuthority_acc.value = response.data.value;
            console.log(jsonAuthority_acc.value);
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

    //角色管理中 選擇角色
    selRole_sub = (_sel_role) => {
      if (_sel_role == "") return;
      sel_role.value = _sel_role;
      console.log(sel_role.value);
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/GetAuthority",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member.id, role: _sel_role },
      })
        .then((response) => {
          $.unblockUI();
          //console.log(response.data);
          if (response.data.success) {
            showAuthority.value = true;
            jsonAuthority_role.value = response.data.value;
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

    //權限存檔
    save_sub = (_jsonAuthority) => {
      console.log(_jsonAuthority);
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/SaveAuthority",
        headers: { "Content-Type": "application/json" },
        params: {
          member_id: member.id,
          role: sel_role.value,
          auth_1: _jsonAuthority[0].authority,
          auth_2: _jsonAuthority[1].authority,
          auth_3: _jsonAuthority[2].authority,
          //auth_4: _jsonAuthority[3].authority,
          check_1: _jsonAuthority[0].isCheck,
          check_2: _jsonAuthority[1].isCheck,
          check_3: _jsonAuthority[2].isCheck,
          //check_4: _jsonAuthority[3].isCheck
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            alert("存檔成功！");
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

    //新增帳號
    add_acc = (_u) => {
      console.log(_u);
      if (
        _u.acc == "" ||
        _u.sel_role == "" ||
        _u.sel_branch == "" ||
        _u.dealer_acc_name == ""
      )
        return;

      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      if (hasFullShape(_u.acc) || hasFullShape(_u.dealer_acc_name)) {
        alert("不可用全形！");
        return;
      }
      if (hasSpecialStr(_u.acc) || hasSpecialStr(_u.dealer_acc_name)) {
        alert("不可用特殊字元");
        return;
      }
      if (_u.acc.length > 5) {
        alert("子帳號不可超過5個字！");
        return;
      }
      if (!isNumber(_u.acc)) {
        alert("子帳號只能用數字！");
        return;
      }

      if (_u.dealer_acc_name.length > 10) {
        alert("使用者不可超過10個字！");
        return;
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/AddAcc",
        headers: { "Content-Type": "application/json" },
        params: {
          member_id: member.id,
          acc: _u.acc,
          role: _u.sel_role,
          branch: _u.sel_branch,
          dealer_acc_name: _u.dealer_acc_name,
          isStart: _u.isStart,
        },
      })
        .then((response) => {
          $.unblockUI();
          //console.log(response.data);
          if (response.data.success) {
            jsonMember.value = response.data.value;
            jsonRole.value = response.data.roles;
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

    //修改帳號
    upd_acc = (_v) => {
      console.log(_v);
      if (
        _v.dealer_role == "" ||
        _v.dealer_branch == "" ||
        _v.dealer_acc_name == ""
      )
        return;

      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;
      console.log(member.id);

      if (hasFullShape(_v.dealer_acc_name)) {
        alert("不可用全形！");
        return;
      }
      if (hasSpecialStr(_v.dealer_acc_name)) {
        alert("不可用特殊字元");
        return;
      }
      if (_v.dealer_acc_name.length > 10) {
        alert("使用者不可超過10個字！");
        return;
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/UpdAcc",
        headers: { "Content-Type": "application/json" },
        params: {
          deal_member_id: member.id,
          member_id: _v.member_id,
          role: _v.dealer_role,
          branch: _v.dealer_branch,
          dealer_acc_name: _v.dealer_acc_name,
        },
      })
        .then((response) => {
          $.unblockUI();
          //console.log(response.data);
          if (response.data.success) {
            jsonMember.value = response.data.value;
            jsonRole.value = response.data.roles;
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

    //刪除帳號
    deleteAcc = (_member_id) => {
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/DeleteAcc",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member.id, del_id: _member_id },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            jsonMember.value = response.data.value;
            jsonRole.value = response.data.roles;
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

    //啟用
    OpenStart = (_v) => {
      console.log(_v);
      if (_v.role_color) {
        alert("無法啟用帳號(角色名稱不存在或已刪除)");
        _v.isStart = false;
        return;
      }
      if (_v.branch_color) {
        alert("無法啟用帳號(分公司稱不存在或已刪除)");
        _v.isStart = false;
        return;
      }

      if (_v.authoritys.length == 0) {
        alert("無法啟用帳號(分公司未設定權限)");
        _v.isStart = false;
        return;
      }

      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/OpenStart",
        headers: { "Content-Type": "application/json" },
        params: {
          member_id: member.id,
          upd_id: _v.member_id,
          isStart: _v.isStart,
        },
      })
        .then((response) => {
          $.unblockUI();
          //console.log(response.data);
          if (response.data.success) {
            jsonMember.value = response.data.value;
            jsonRole.value = response.data.roles;
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

    //新增分店
    addBranch = (_branch) => {
      if (_branch == "") return;
      console.log(_branch);
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      if (hasFullShape(_branch)) {
        alert("不可用全形！");
        return;
      }
      if (hasSpecialStr(_branch)) {
        alert("不可用特殊字元");
        return;
      }
      if (_branch.length > 10) {
        alert("不可超過10個字！");
        return;
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/AddBranch",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member.id, branch: _branch },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            jsonBranch.value = response.data.value;
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

    //分店名稱異動
    var _old_branch, _new_branch;
    changeBranch = (_v, event) => {
      _old_branch = _v.branch.trim();
      _new_branch = event.target.value.trim();
    };

    //角色名稱異動
    var _old_role, _new_role;
    changeRole = (_v, event) => {
      _old_role = _v.role.trim();
      _new_role = event.target.value.trim();
    };

    //更新分店
    updBranch = () => {
      if (
        typeof _old_branch == "undefined" ||
        typeof _new_branch == "undefined"
      )
        return;

      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      //console.log(_old_branch);
      //console.log(_new_branch);

      if (hasFullShape(_new_branch)) {
        alert("不可用全形！");
        return;
      }
      if (hasSpecialStr(_new_branch)) {
        alert("不可用特殊字元");
        return;
      }
      if (_new_branch.length > 10) {
        alert("不可超過10個字！");
        return;
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/UpdateBranch",
        headers: { "Content-Type": "application/json" },
        params: {
          member_id: member.id,
          old_branch: _old_branch,
          new_branch: _new_branch,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            jsonBranch.value = response.data.value;
            //重新更新
            _getMemberList();
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

    //更新角色
    updRole = () => {
      if (typeof _old_role == "undefined" || typeof _new_role == "undefined")
        return;

      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      console.log(_old_role);
      console.log(_new_role);

      if (hasFullShape(_new_role)) {
        alert("不可用全形！");
        return;
      }
      if (hasSpecialStr(_new_role)) {
        alert("不可用特殊字元");
        return;
      }
      if (_new_role.length > 10) {
        alert("不可超過10個字！");
        return;
      }

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/UpdateRole",
        headers: { "Content-Type": "application/json" },
        params: {
          member_id: member.id,
          old_role: _old_role,
          new_role: _new_role,
        },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            jsonRole.value = response.data.value;
            //重新更新
            _getMemberList();
            sel_role.value = _new_role;
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

    //刪除分店
    var _del_v;
    deleBranch = (_v) => {
      _del_v = _v;
      $("#deleteBranch_modal").modal("show");
    };

    //確認刪除分店
    confirmDeleteBranch = () => {
      var member = JSON.parse(localStorage.getItem("member"));
      if (member == null) return;

      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/DeleteBranch",
        headers: { "Content-Type": "application/json" },
        params: { member_id: member.id, branch: _del_v.branch },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            $("#deleteBranch_modal").modal("hide");
            jsonBranch.value = response.data.value;
            //重新更新
            _getMemberList();
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

    //顯示 要求重設密碼
    var _u_tmp;
    reSetPwShow = (_u) => {
      //create show form
      $("#resetpw_modal").modal("show");
      _u_tmp = _u;
      //console.log(_u_tmp);
    };

    //確定重設密碼
    reSetPw = () => {
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/ReSetPw",
        headers: { "Content-Type": "application/json" },
        params: { member_id: _u_tmp.member_id },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            $("#resetpw_modal").modal("hide");
            //重新查詢
            _getMemberList();
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

    //取消重設密碼
    cancelSetPw = () => {
      blockUI();
      axios({
        method: "post",
        url: "/api/DealerRole/CancelReSetPw",
        headers: { "Content-Type": "application/json" },
        params: { member_id: _u_tmp.member_id },
      })
        .then((response) => {
          $.unblockUI();
          console.log(response.data);
          if (response.data.success) {
            $("#resetpw_modal").modal("hide");
            //重新查詢
            _getMemberList();
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
      showRow,
      showRoleModal,
      jsonMember,
      sel_role,
      sub_role,
      addRole_sub,
      delRole_sub,
      jsonRole,
      selRole,
      selRole_sub,
      jsonAuthority_acc,
      jsonAuthority_role,
      save_sub,
      showAuthority,
      u,
      add_acc,
      upd_acc,
      deleteAcc,
      OpenStart,
      m,
      branch,
      addBranch,
      jsonBranch,
      updBranch,
      deleBranch,
      changeBranch,
      confirmDeleteRole,
      confirmDeleteBranch,
      reSetPwShow,
      reSetPw,
      cancelSetPw,
      changeRole,
      updRole,
    };
  },
};

Vue.createApp(App).mount("#app");

$(window).on("load", function () {
  var member = JSON.parse(localStorage.getItem("member"));
  if (member == null || member.login_ok_msg != "*" || member.role != "dealer") {
    window.location.href = "../Home/Index";
    return;
  }
});
