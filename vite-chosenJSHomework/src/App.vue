<script setup>
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import axios from "axios";

const cities = ref([]);
const selectedCity = ref("");
const citySelectRef = ref(null); // 建立一個 ref 來綁定 HTML 中的 select 元素
// let choicesInstance = null; // 用來存放 Choices 的實體，方便之後銷毀或更新
const selectedCityIndex1 = ref(null);
const areaSelectRef = ref(null); // 追蹤選中的區域

// Instances: 存放 Choices 實體，分開管理
let cityChoicesInstance = null;
let areaChoicesInstance = null; // 2. 新增這個變數存放區域實體
// --- 初始化 ---
onMounted(() => {
  _initLoad();
});

// 記得在組件銷毀時清理 Choices 實體，避免記憶體洩漏
// onUnmounted(() => {
//   if (choicesInstance) {
//     choicesInstance.destroy();
//   }
// });

const _initLoad = async () => {
  cities.value = await _loadCityData();
  cities.value = cities.value.filter(
    (item) => item.CityName !== "釣魚臺" && item.CityName !== "南海島"
  );
  // 3. 關鍵步驟：等待 Vue 更新完 DOM (<option> 都長出來了)
  await nextTick();

  // 4. 初始化 Choices.js
  initChoices();
};

const initChoices = () => {
  // console.log(choicesInstance); //null
  // 如果已經有實體，先銷毀舊的 (避免重複綁定)
  if (cityChoicesInstance) {
    cityChoicesInstance.destroy();
  }

  // 綁定到我們在 template 設定的 ref

  cityChoicesInstance = new Choices(citySelectRef.value, {
    searchEnabled: false, // 開啟搜尋功能
    itemSelectText: "", // 移除選取時顯示的文字
    shouldSort: false, // 不要自動排序，維持 API 回傳的順序
  });
  console.log(cityChoicesInstance);
};

// --- 區域選單的初始化邏輯 ---
const initAreaChoices = () => {
  // A. 如果舊的實體存在，必須先銷毀！否則會重複綁定導致錯誤
  if (areaChoicesInstance) {
    areaChoicesInstance.destroy();
    areaChoicesInstance = null;
  }

  // B. 確保 DOM 存在 (且有資料) 才建立
  console.log("areaSelectRef.value", areaSelectRef.value);
  areaChoicesInstance = new Choices(areaSelectRef.value, {
    searchEnabled: false,
    itemSelectText: "",
    shouldSort: false,
    placeholder: true,
    placeholderValue: "請選擇區域",
  });
  console.log("areaSelectRef.value", areaSelectRef.value);
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

// const handleCityChange = (which) => {
//   if (which == 1) {
//     const selectedCityName = event.target.value;
//     selectedCityIndex1.value = cities.value.findIndex(
//       (item) => item.CityName === selectedCityName
//     );
//     console.log("selectedCityIndex1", selectedCityIndex1.value);
//     // nextTick(() => updateAreaChoices())
//     // 3. 重置區域的選取值 (避免縣市變了，區域還留在舊的)
//   // selectedArea.value = "";

//   // 4. 【關鍵步驟】：等待 Vue 把新的 <option> 渲染出來
//   await nextTick();

//   // 5. DOM 更新完畢，現在可以初始化 Choices.js 了
//   initAreaChoices();
//   } else if (which == 2) {
//     selectedCityIndex2.value = index;
//   }
// };

// --- 縣市改變時的處理 ---
const handleCityChange = async (event) => {
  consle.log("event", event.target);
  // 1. 取得選中的縣市名稱 (如果是用 Choices.js 觸發 change，event.target.value 通常還是抓得到的)
  const selectedCityName = event.target.value;

  // 2. 更新 Index，這會觸發 template 中的 v-for 更新區域列表
  selectedCityIndex1.value = cities.value.findIndex(
    (item) => item.CityName === selectedCityName
  );

  // 3. 重置區域的選取值 (避免縣市變了，區域還留在舊的)
  selectedArea.value = "";

  // 4. 【關鍵步驟】：等待 Vue 把新的 <option> 渲染出來
  await nextTick();

  // 5. DOM 更新完畢，現在可以初始化 Choices.js 了
  initAreaChoices();
};

const updateAreaChoices = () => {
  const areaSelectDom = document.getElementById("area-select");
  const newAreaList = cities.value[selectedCityIndex1.value].AreaList;
  console.log("newAreaList", newAreaList);

  if (!areaSelectDom) return;

  // 3. 使用 setChoices 更新選項
  // 參數解釋: (資料陣列, value欄位, label欄位, 是否取代舊資料)
  areaSelectDom.setChoices(
    newAreaList,
    "AreaName", // 你的資料結構中，value 是 AreaName
    "AreaName", // 你的資料結構中，顯示文字也是 AreaName
    true // ★關鍵：設為 true 代表「先清空舊選項，再加入新的」
  );

  //areaSelectDom.destroy();
  //console.log("destroy")

  // 1. 如果舊的 Choices 實例存在，先銷毀它 (Destroy)
  // 這樣它會把隱藏的 <select> 還原，並移除舊的假選單
  //if (areaSelectDom._choicesInstance) {

  //    areaSelectDom._choicesInstance = null;

  //}

  // 2. 重新初始化 (Re-init)
  // 這時候 Choices.js 會看到 Vue 剛剛產生好的新 option，並建立正確的選單
  const newInstance = new Choices(areaSelectDom, {
    searchEnabled: false,
    itemSelectText: "",
    shouldSort: false, // 建議關閉排序，不然區域會亂跳
  });

  // 3. 把新實例存回去
  areaSelectDom._choicesInstance = newInstance;
};
</script>

<template>
  <div class="fs-4 fw-bold subtitle">公司登記地址</div>
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
</template>

<style scoped></style>
