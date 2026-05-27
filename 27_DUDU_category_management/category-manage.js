const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    // === Demo: 模擬登入角色 ===
    const currentRole = ref("admin");
    const isAdmin = computed(() => currentRole.value === "admin");

    // === Categories（扁平 + parentId）===
    // Level 3 才有 productCount；Level 1/2 由 descendants 加總
    const categories = ref([
      // ----- 主分類 (Level 1) -----
      { id: 1, level: 1, parentId: null, name: "寵物用品", enabled: true },
      { id: 2, level: 1, parentId: null, name: "美容美體", enabled: true },
      { id: 3, level: 1, parentId: null, name: "3C周邊", enabled: true },
      { id: 4, level: 1, parentId: null, name: "汽機車用品", enabled: true },
      { id: 5, level: 1, parentId: null, name: "清潔用品", enabled: true },
      { id: 6, level: 1, parentId: null, name: "保健醫療", enabled: true },
      { id: 7, level: 1, parentId: null, name: "運動戶外", enabled: true },

      // ----- 次分類 (Level 2) -----
      // 寵物用品
      { id: 11, level: 2, parentId: 1, name: "犬(狗)", enabled: true },
      { id: 12, level: 2, parentId: 1, name: "貓", enabled: true },
      { id: 13, level: 2, parentId: 1, name: "醫療保健", enabled: true },
      { id: 14, level: 2, parentId: 1, name: "寵物美容", enabled: true },
      { id: 15, level: 2, parentId: 1, name: "寵物外出", enabled: true },
      { id: 16, level: 2, parentId: 1, name: "水族相關", enabled: true },
      { id: 17, level: 2, parentId: 1, name: "特寵/小寵物專區", enabled: true },
      { id: 18, level: 2, parentId: 1, name: "貓砂/尿布墊", enabled: true },
      // 美容美體
      { id: 21, level: 2, parentId: 2, name: "保養護膚", enabled: true },
      { id: 22, level: 2, parentId: 2, name: "彩妝", enabled: true },
      { id: 23, level: 2, parentId: 2, name: "香氛", enabled: true },
      // 3C
      { id: 31, level: 2, parentId: 3, name: "手機配件", enabled: true },
      { id: 32, level: 2, parentId: 3, name: "電腦周邊", enabled: true },
      { id: 33, level: 2, parentId: 3, name: "影音設備", enabled: true },
      // 汽機車
      { id: 41, level: 2, parentId: 4, name: "汽車百貨", enabled: true },
      { id: 42, level: 2, parentId: 4, name: "機車百貨", enabled: true },
      // 清潔用品
      { id: 51, level: 2, parentId: 5, name: "居家清潔", enabled: true },
      { id: 52, level: 2, parentId: 5, name: "個人清潔", enabled: true },
      // 保健醫療
      { id: 61, level: 2, parentId: 6, name: "保健食品", enabled: true },
      { id: 62, level: 2, parentId: 6, name: "醫療器材", enabled: true },
      // 運動戶外
      { id: 71, level: 2, parentId: 7, name: "運動配件", enabled: true },
      { id: 72, level: 2, parentId: 7, name: "戶外用品", enabled: true },

      // ----- 子分類 (Level 3) -----
      // 犬(狗)
      {
        id: 111,
        level: 3,
        parentId: 11,
        name: "飼料/乾糧",
        enabled: true,
        productCount: 8,
      },
      {
        id: 112,
        level: 3,
        parentId: 11,
        name: "狗罐頭/鮮食",
        enabled: true,
        productCount: 4,
      },
      {
        id: 113,
        level: 3,
        parentId: 11,
        name: "狗零食",
        enabled: true,
        productCount: 4,
      },
      // 貓
      {
        id: 121,
        level: 3,
        parentId: 12,
        name: "貓飼料",
        enabled: true,
        productCount: 8,
      },
      {
        id: 122,
        level: 3,
        parentId: 12,
        name: "貓罐頭/鮮食",
        enabled: true,
        productCount: 4,
      },
      {
        id: 123,
        level: 3,
        parentId: 12,
        name: "貓零食",
        enabled: true,
        productCount: 4,
      },
      // 醫療保健
      {
        id: 131,
        level: 3,
        parentId: 13,
        name: "寵物藥品",
        enabled: true,
        productCount: 8,
      },
      {
        id: 132,
        level: 3,
        parentId: 13,
        name: "寵物保健品",
        enabled: true,
        productCount: 6,
      },
      // 寵物美容
      {
        id: 141,
        level: 3,
        parentId: 14,
        name: "美容用品",
        enabled: true,
        productCount: 4,
      },
      // 寵物外出
      {
        id: 151,
        level: 3,
        parentId: 15,
        name: "外出袋/背包",
        enabled: true,
        productCount: 2,
      },
      {
        id: 152,
        level: 3,
        parentId: 15,
        name: "牽繩/胸背",
        enabled: true,
        productCount: 2,
      },
      // 水族相關
      {
        id: 161,
        level: 3,
        parentId: 16,
        name: "魚缸/水族箱",
        enabled: true,
        productCount: 2,
      },
      {
        id: 162,
        level: 3,
        parentId: 16,
        name: "魚飼料",
        enabled: true,
        productCount: 2,
      },
      // 特寵
      {
        id: 171,
        level: 3,
        parentId: 17,
        name: "兔子用品",
        enabled: true,
        productCount: 3,
      },
      {
        id: 172,
        level: 3,
        parentId: 17,
        name: "鳥類用品",
        enabled: true,
        productCount: 3,
      },
      // 貓砂/尿布墊
      {
        id: 181,
        level: 3,
        parentId: 18,
        name: "貓砂",
        enabled: true,
        productCount: 4,
      },
      {
        id: 182,
        level: 3,
        parentId: 18,
        name: "尿布墊",
        enabled: true,
        productCount: 4,
      },
      // 美容美體 leaves
      {
        id: 211,
        level: 3,
        parentId: 21,
        name: "面膜",
        enabled: true,
        productCount: 6,
      },
      {
        id: 212,
        level: 3,
        parentId: 21,
        name: "精華液",
        enabled: true,
        productCount: 6,
      },
      {
        id: 221,
        level: 3,
        parentId: 22,
        name: "口紅",
        enabled: true,
        productCount: 5,
      },
      {
        id: 222,
        level: 3,
        parentId: 22,
        name: "眼影",
        enabled: true,
        productCount: 5,
      },
      {
        id: 231,
        level: 3,
        parentId: 23,
        name: "香水",
        enabled: true,
        productCount: 8,
      },
      // 3C leaves
      {
        id: 311,
        level: 3,
        parentId: 31,
        name: "手機殼",
        enabled: true,
        productCount: 5,
      },
      {
        id: 312,
        level: 3,
        parentId: 31,
        name: "充電線",
        enabled: true,
        productCount: 5,
      },
      {
        id: 321,
        level: 3,
        parentId: 32,
        name: "滑鼠鍵盤",
        enabled: true,
        productCount: 6,
      },
      {
        id: 322,
        level: 3,
        parentId: 32,
        name: "螢幕",
        enabled: true,
        productCount: 6,
      },
      {
        id: 331,
        level: 3,
        parentId: 33,
        name: "耳機",
        enabled: true,
        productCount: 6,
      },
      // 汽機車 leaves
      {
        id: 411,
        level: 3,
        parentId: 41,
        name: "汽車保養",
        enabled: true,
        productCount: 10,
      },
      {
        id: 412,
        level: 3,
        parentId: 41,
        name: "汽車配件",
        enabled: true,
        productCount: 10,
      },
      {
        id: 421,
        level: 3,
        parentId: 42,
        name: "機車安全帽",
        enabled: true,
        productCount: 9,
      },
      {
        id: 422,
        level: 3,
        parentId: 42,
        name: "機車配件",
        enabled: true,
        productCount: 9,
      },
      // 清潔用品 leaves
      {
        id: 511,
        level: 3,
        parentId: 51,
        name: "洗衣精",
        enabled: true,
        productCount: 9,
      },
      {
        id: 512,
        level: 3,
        parentId: 51,
        name: "洗碗精",
        enabled: true,
        productCount: 9,
      },
      {
        id: 521,
        level: 3,
        parentId: 52,
        name: "沐浴乳",
        enabled: true,
        productCount: 6,
      },
      {
        id: 522,
        level: 3,
        parentId: 52,
        name: "洗髮精",
        enabled: true,
        productCount: 6,
      },
      // 保健醫療 leaves
      {
        id: 611,
        level: 3,
        parentId: 61,
        name: "維他命",
        enabled: true,
        productCount: 7,
      },
      {
        id: 612,
        level: 3,
        parentId: 61,
        name: "益生菌",
        enabled: true,
        productCount: 7,
      },
      {
        id: 621,
        level: 3,
        parentId: 62,
        name: "血壓計",
        enabled: true,
        productCount: 4,
      },
      {
        id: 622,
        level: 3,
        parentId: 62,
        name: "額溫槍",
        enabled: true,
        productCount: 4,
      },
      // 運動戶外 leaves
      {
        id: 711,
        level: 3,
        parentId: 71,
        name: "運動服飾",
        enabled: true,
        productCount: 9,
      },
      {
        id: 712,
        level: 3,
        parentId: 71,
        name: "運動器材",
        enabled: true,
        productCount: 9,
      },
      {
        id: 721,
        level: 3,
        parentId: 72,
        name: "露營用品",
        enabled: true,
        productCount: 5,
      },
      {
        id: 722,
        level: 3,
        parentId: 72,
        name: "登山用品",
        enabled: true,
        productCount: 5,
      },
    ]);

    // === Helpers ===
    // id → item map（查父層用，O(1)）
    const categoryMap = computed(() => {
      const m = new Map();
      for (const c of categories.value) m.set(c.id, c);
      console.log("categoryMap", m);
      return m;
    });

    // 衍生狀態：自己 enabled 且所有祖先也 enabled
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
    const handleAddCategory = (levelLabel) => {
      ElementPlus.ElMessage({
        message: `「+ 新增${levelLabel}分類」功能將於下一階段實作`,
        type: "info",
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
