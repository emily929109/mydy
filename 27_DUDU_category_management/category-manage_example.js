const { createApp, ref, computed, onMounted } = Vue;

const app = createApp({
  setup() {
    const categories = ref([]);

    onMounted(() => {
      // 模擬從後端 API 取得分類資料
      fetch("category_data.json")
        .then((res) => res.json())
        .then((data) => {
          categories.value = data;
        })
        .catch((err) => {
          console.error("Failed to load category data:", err);
        });
    });

    // === Demo: 模擬登入角色 ===
    const currentRole = ref("admin");
    const isAdmin = computed(() => currentRole.value === "admin");

    // === Helpers ===
    // id → item map（查父層用）
    const categoryMap = computed(() => {
      const m = new Map();
      for (const c of categories.value) m.set(c.id, c);
      console.log("categoryMap", m);
      return m;
    });

    // 衍生狀態derived state : 自己 enabled 或 父層 enabled，則 enabled
    // 前台是否上架、刪除線、灰階顯示，全部看這個值
    const effectiveEnabled = (item) => {
      let cur = item;
      while (cur) {
        if (!cur.enabled) return false;
        cur = cur.parentId == null ? null : categoryMap.value.get(cur.parentId);
      }
      return true;
    };

    // 取得該分類底下所有 leaf descendants（level 3 自己就是 leaf）
    const getDescendantLeaves = (item) => {
      if (item.level === 3) return [item];
      const result = [];
      const stack = categories.value.filter((c) => c.parentId === item.id);
      while (stack.length) {
        const c = stack.shift();
        if (c.level === 3) result.push(c);
        else stack.push(...categories.value.filter((x) => x.parentId === c.id));
      }
      return result;
    };

    // Raw productCount（不考慮 cascade）
    const getProductCount = (item) => {
      if (item.level === 3) return item.productCount;
      return getDescendantLeaves(item).reduce((s, l) => s + l.productCount, 0);
    };

    // Effective productCount（考慮 cascade — 只算 effectiveEnabled 的 leaves）
    const getEffectiveProductCount = (item) => {
      if (item.level === 3)
        return effectiveEnabled(item) ? item.productCount : 0;
      return getDescendantLeaves(item)
        .filter((l) => effectiveEnabled(l))
        .reduce((s, l) => s + l.productCount, 0);
    };

    // === 三欄選中狀態 ===
    const selectedMainId = ref(1);
    const selectedSubId = ref(11);

    const mainList = computed(() =>
      categories.value.filter((c) => c.level === 1),
    );
    const subList = computed(() =>
      categories.value.filter(
        (c) => c.level === 2 && c.parentId === selectedMainId.value,
      ),
    );
    const leafList = computed(() =>
      categories.value.filter(
        (c) => c.level === 3 && c.parentId === selectedSubId.value,
      ),
    );

    const selectedMain = computed(() =>
      categoryMap.value.get(selectedMainId.value),
    );
    const selectedSub = computed(() =>
      categoryMap.value.get(selectedSubId.value),
    );

    const selectMain = (id) => {
      selectedMainId.value = id;
      // 切到該主分類底下第一筆次分類
      // 主分類的id是次分類的parentId
      const firstSub = categories.value.find(
        (c) => c.level === 2 && c.parentId === id,
      );

      // 這個主分類底下「沒有任何次分類」→ find 回傳 undefined
      selectedSubId.value = firstSub ? firstSub.id : null;
    };
    const selectSub = (id) => {
      selectedSubId.value = id;
    };

    // === 全站上架數（effective）===
    const totalLeafActive = computed(() =>
      categories.value
        .filter((c) => c.level === 3 && effectiveEnabled(c))
        .reduce((s, c) => s + c.productCount, 0),
    );

    // === Action handlers（demo noop）===
    const handleSave = () => {
      ElementPlus.ElMessage({
        message: "已儲存所有變更（demo）",
        type: "success",
      });
    };
    const handleAddCategory = async (levelLabel) => {
      // ***** 待理解 *****
      const level = levelLabel === "主" ? 1 : levelLabel === "次" ? 2 : 3;

      let parentId = null;
      if (level === 2) {
        if (!selectedMainId.value) {
          ElementPlus.ElMessage({
            message: "請先選擇主分類",
            type: "warning",
          });
          return;
        }
        parentId = selectedMainId.value;
      } else if (level === 3) {
        if (!selectedSubId.value) {
          ElementPlus.ElMessage({
            message: "請先選擇次分類",
            type: "warning",
          });
          return;
        }
        parentId = selectedSubId.value;
      }

      let name;
      try {
        const result = await ElementPlus.ElMessageBox.prompt(
          `請輸入${levelLabel}分類名稱`,
          `新增${levelLabel}分類`,
          {
            confirmButtonText: "確認",
            cancelButtonText: "取消",

            // ***** inputValidator 待理解 *****
            inputValidator: (val) =>
              (val && val.trim().length > 0) || "名稱不可空白",
          },
        );
        name = result.value.trim();
      } catch {
        return;
      }

      const newId = categories.value.reduce((m, c) => Math.max(m, c.id), 0) + 1;
      const newItem = {
        id: newId,
        level,
        parentId,
        name,
        enabled: false,
      };
      if (level === 3) newItem.productCount = 0;

      categories.value.push(newItem);

      if (level === 1) selectMain(newId);
      else if (level === 2) selectSub(newId);

      ElementPlus.ElMessage({
        message: `已新增${levelLabel}分類「${name}」`,
        type: "success",
      });
    };

    return {
      currentRole,
      isAdmin,
      mainList,
      subList,
      leafList,
      selectedMainId,
      selectedSubId,
      selectedMain,
      selectedSub,
      selectMain,
      selectSub,
      effectiveEnabled,
      getProductCount,
      getEffectiveProductCount,
      totalLeafActive,
      handleSave,
      handleAddCategory,
    };
  },
});

app.use(ElementPlus);
app.mount("#app");
