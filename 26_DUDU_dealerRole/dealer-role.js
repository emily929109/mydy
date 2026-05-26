/* ===== Vue 3 + Element Plus：角色管理 Modal ===== */
const { createApp, ref } = Vue;

const ALL_PERMS = ["訂單查詢", "申請報數", "角色管理", "商品管理"];

const roleApp = createApp({
  setup() {
    const roleModalVisible = ref(false);
    const activeTab = ref("role");

    /* 建立新角色 */
    const newRoleName = ref("");
    const newRolePerms = ref([...ALL_PERMS]); // 預設全選

    function toggleNewPerm(perm) {
      const i = newRolePerms.value.indexOf(perm);
      if (i >= 0) newRolePerms.value.splice(i, 1);
      else newRolePerms.value.push(perm);
    }

    function addRole() {
      const name = newRoleName.value.trim();
      if (!name) return;
      roles.value.push({ name, perms: [...newRolePerms.value] });
      newRoleName.value = "";
      newRolePerms.value = [...ALL_PERMS];
    }

    /* 現有角色 */
    const roles = ref([
      {
        name: "負責人",
        perms: ["訂單查詢", "申請報數", "角色管理", "商品管理"],
      },
      { name: "店長", perms: ["訂單查詢", "申請報數", "角色管理"] },
      { name: "店員", perms: ["訂單查詢"] },
    ]);

    function deleteRole(idx) {
      if (confirm(`確定要刪除角色「${roles.value[idx].name}」嗎？`)) {
        roles.value.splice(idx, 1);
        if (editingIdx.value === idx) editingIdx.value = -1;
      }
    }

    /* 角色內聯編輯 */
    const editingIdx = ref(-1);
    const editingName = ref("");
    const editingPerms = ref([]);

    function startEditRole(idx) {
      editingIdx.value = idx;
      editingName.value = roles.value[idx].name;
      editingPerms.value = [...roles.value[idx].perms];
    }

    function toggleEditPerm(perm) {
      const i = editingPerms.value.indexOf(perm);
      if (i >= 0) editingPerms.value.splice(i, 1);
      else editingPerms.value.push(perm);
    }

    function saveRole() {
      const name = editingName.value.trim();
      if (!name) return;
      roles.value[editingIdx.value].name = name;
      roles.value[editingIdx.value].perms = [...editingPerms.value];
      editingIdx.value = -1;
    }

    function cancelEditRole() {
      editingIdx.value = -1;
    }

    /* 暴露給外部按鈕呼叫 */
    window.openRoleModal = () => {
      roleModalVisible.value = true;
    };

    return {
      roleModalVisible,
      activeTab,
      ALL_PERMS,
      newRoleName,
      newRolePerms,
      toggleNewPerm,
      addRole,
      roles,
      deleteRole,
      editingIdx,
      editingName,
      editingPerms,
      startEditRole,
      toggleEditPerm,
      saveRole,
      cancelEditRole,
    };
  },
});

roleApp.use(ElementPlus);
roleApp.mount("#role-modal-app");
