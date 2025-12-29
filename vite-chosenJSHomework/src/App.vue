<script setup>
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import axios from "axios";

const cities = ref([]);
const citySelectRef = ref(null);
const areaSelectRef = ref(null);
const selectedCityIndex1 = ref(null);

let cityChoicesInstance = null; // 存放 Choices 實體
let areaChoicesInstance = null;

onMounted(() => {
  _initLoad();
});

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
</template>

<style scoped></style>
