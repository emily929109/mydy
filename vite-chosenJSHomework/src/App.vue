<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import axios from "axios";

const cities = ref([]);
const citySelectRef = ref(null);
const areaSelectRef = ref(null);
const selectedCityIndex1 = ref(null);
let cityChoicesInstance = null; // 存放 Choices 實體
let areaChoicesInstance = null;
const currentTab = ref("profile");
const u = ref({});

onMounted(() => {
  _initLoad();
});

// 4. 監聽 Tab 變動
// 使用 async/await 寫法，邏輯由上而下非常直觀
watch(
  currentTab,
  async (newValue, oldValue) => {
    // A. 等待 Vue 完成 DOM 的切換 (舊的 v-if 消失，新的 v-if 出現)
    await nextTick();

    // B. 此時 DOM 已經存在了，執行 MDB 初始化
    reinitMDB();
  },
  { immediate: true }
);

const reinitMDB = () => {
  // 1. 抓出所有原本應該要有特效的 Input 包裹層
  const inputWrappers = document.querySelectorAll(".form-outline");

  inputWrappers.forEach((wrapper) => {
    // 2. 直接用全域變數 mdb 實例化 Input 並執行 init()
    // 這行程式碼 = 告訴 MDB "這裡有個 Input，請幫我把 Label 浮上去"
    new mdb.Input(wrapper).init();
  });
};

const _initLoad = async () => {
  cities.value = await _loadCityData();
  cities.value = cities.value.filter(
    (item) => item.CityName !== "釣魚臺" && item.CityName !== "南海島"
  );

  await nextTick(); //等待 Vue 更新完 DOM (<option> 都長出來了)
  initChoices();
};

const initChoices = () => {
  if (cityChoicesInstance) {
    cityChoicesInstance.destroy();
  }

  if (areaChoicesInstance) {
    areaChoicesInstance.destroy();
  }

  cityChoicesInstance = new Choices(citySelectRef.value, {
    searchEnabled: false,
    itemSelectText: "", // 移除選取時顯示的文字
    shouldSort: false, // 不要自動排序，維持 API 回傳的順序
  });

  areaChoicesInstance = new Choices(areaSelectRef.value, {
    searchEnabled: false,
    itemSelectText: "",
    shouldSort: false,
  });
};

const initAreaChoices = () => {
  // A. 如果舊的實體存在，必須先銷毀！否則會重複綁定導致錯誤
  if (areaChoicesInstance) {
    areaChoicesInstance.destroy();
    areaChoicesInstance = null;
  }

  areaChoicesInstance = new Choices(areaSelectRef.value, {
    searchEnabled: false,
    itemSelectText: "",
    shouldSort: false,
    placeholder: true,
    placeholderValue: "請選擇區域",
  });
};

const _loadCityData = () => {
  return axios({
    method: "get",
    url: "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json",
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      console.log("完成");
    });
};

// --- 縣市改變時的處理 ---
const handleCityChange = async (which) => {
  const selectedCityName = event.target.value;

  selectedCityIndex1.value = cities.value.findIndex(
    (item) => item.CityName === selectedCityName
  );
  await nextTick();
  initAreaChoices();
};

const handleBlur = (e) => {
  const input = e.target;

  // 使用 HTML5 原生檢查 (會讀取 required 屬性)
  if (!input.checkValidity()) {
    input.classList.add("is-invalid"); // 加上這個 class，MDB 就會顯示紅框和錯誤訊息
    input.classList.remove("is-valid");
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid"); // (選用) 加上綠框
  }
};

const handleInput = (e) => {
  const input = e.target;
  if (input.classList.contains("is-invalid")) {
    input.classList.remove("is-invalid");
  }
};
</script>

<template>
  <div class="fs-4 fw-bold subtitle mb-3">公司登記地址</div>
  <div class="d-flex">
    <!-- 縣市 -->
    <div class="field-wrapper mt-4">
      <select
        class="form-control js-choice"
        ref="citySelectRef"
        @change="handleCityChange(1)"
      >
        <option value="" placeholder>請選擇縣市</option>
        <option
          v-for="(c, index) in cities"
          :key="c.CityName"
          class="px-4 py-2 hover:bg-gray-100"
        >
          {{ c.CityName }}
        </option>
      </select>
    </div>
    <!-- 區域 -->
    <div class="field-wrapper mt-4">
      <select
        class="form-control js-choice"
        id="area-select"
        ref="areaSelectRef"
      >
        <option value="" placeholder>請選擇區域</option>
        <option
          v-for="(a, idx) in cities[selectedCityIndex1]
            ? cities[selectedCityIndex1].AreaList
            : []"
          :key="a.AreaName"
          :value="a.AreaName"
          class="px-4 py-2 hover:bg-gray-100"
        >
          {{ a.AreaName }}
        </option>
      </select>
    </div>
  </div>
  <div class="container mt-5">
    <div class="mb-4">
      <input
        type="radio"
        class="form-check-input"
        name="tab-options"
        id="radio-tab-1"
        autocomplete="off"
        value="profile"
        v-model="currentTab"
      />
      <label class="form-check-label" for="radio-tab-1">個人資料</label>

      <input
        type="radio"
        class="form-check-input"
        name="tab-options"
        id="radio-tab-2"
        autocomplete="off"
        value="settings"
        v-model="currentTab"
      />
      <label class="form-check-label" for="radio-tab-2">設定</label>

      <input
        type="radio"
        class="form-check-input"
        name="tab-options"
        id="radio-tab-3"
        autocomplete="off"
        value="logs"
        v-model="currentTab"
      />
      <label class="form-check-label" for="radio-tab-3">紀錄</label>
    </div>

    <div class="tab-content-wrapper p-4 border rounded">
      <transition>
        <div v-if="currentTab === 'profile'">
          <div class="form-outline" data-mdb-input-init>
            <input type="text" id="form12" class="form-control" />
            <label class="form-label" for="form12">Example label</label>
          </div>
        </div>

        <div v-else-if="currentTab === 'settings'">
          <h4>系統設定</h4>
          <p>這裡是 Radio Button 2 的內容。</p>
        </div>

        <div v-else-if="currentTab === 'logs'">
          <h4>操作紀錄</h4>
          <p>這裡是 Radio Button 3 的內容。</p>
        </div>
      </transition>
    </div>
  </div>

  <div class="basic-info">
    <!--公司統編-->
    <div>
      <div class="form-outline mt-4" data-mdb-input-init>
        <input
          type="text"
          class="form-control"
          maxlength="8"
          id="GUI"
          v-model.trim="u.c_taxid_no"
          @blur="handleBlur"
          @focus="handleInput"
          required
        />
        <label class="form-label" for="GUI">公司統編</label>
        <div class="invalid-feedback">此欄位為必填</div>
      </div>
    </div>

    <!--公司登記名稱-->
    <div>
      <div class="form-outline mt-4" data-mdb-input-init>
        <input
          type="text"
          id="c_name"
          class="form-control"
          v-model.trim="u.c_name"
        />
        <label class="form-label" for="c_name">公司登記名稱</label>
      </div>
    </div>

    <!--公司電話-->
    <div>
      <div class="form-outline mt-4" data-mdb-input-init>
        <input
          type="text"
          id="c_phone"
          class="form-control"
          v-model.trim="u.c_phone"
        />
        <label class="form-label" for="c_phone">公司電話</label>
      </div>
    </div>
  </div>
  <div class="d-flex gap-4">
    <div class="mt-4">營業型態(複選)</div>
    <div class="form-check mt-4">
      <input
        class="form-check-input"
        type="checkbox"
        value=""
        id="flexCheck1"
      />
      <label class="form-check-label" for="flexCheck1">實體商店(offline)</label>
    </div>
    <div class="form-check mt-4">
      <input
        class="form-check-input"
        type="checkbox"
        value=""
        id="flexCheck2"
      />
      <label class="form-check-label" for="flexCheck2">網路(online)</label>
    </div>
  </div>
</template>

<style scoped></style>
