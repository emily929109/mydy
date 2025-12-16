<script setup>
import { onMounted, ref, computed } from "vue";
import { initFlowbite } from "flowbite";

// --- 狀態變數 ---
const cities = ref([]); // 空陣列，儲存fetch後的資料
const selectedCityIndex = ref(null); // 原本未定義
const isDropdownOpen = ref(false); // 控制下拉選單開關

// --- 計算屬性 ---
const selectedCityLabel = computed(() => {
  if (selectedCityIndex.value === null) return "縣市";
  return cities.value[selectedCityIndex.value].CityName;
});

// --- 方法 ---
async function loadCityData() {
  try {
    const url =
      "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json";
    const res = await fetch(url);
    const data = await res.json();

    cities.value = data.filter(
      (item) => item.CityName !== "釣魚臺" && item.CityName !== "南海島"
    );
  } catch (error) {
    console.error("無法讀取資料", error);
  }
}

function pickCity(index) {
  selectedCityIndex.value = index;
  isDropdownOpen.value = false; // 選完後關閉選單
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

// --- 初始化 ---
onMounted(() => {
  loadCityData(); // 修正：原本忘了呼叫
  initFlowbite();
});
</script>
<template>
  <div class="section pt-8 max-w-5xl mx-auto">
    <div class="title text-3xl font-bold">商家資訊填寫</div>

    <!---------- radio切換 開始 ------------>
    <div class="mb-3 border-b border-default">
      <ul
        class="flex flex-wrap -mb-px text-sm font-medium text-center"
        id="default-tab"
        data-tabs-toggle="#default-tab-content"
        role="tablist"
      >
        <li class="me-2" role="presentation">
          <button
            class="radio-tab inline-block p-4 border-b-2 rounded-t-base"
            id="company-tab"
            data-tabs-target="#company"
            type="button"
            role="tab"
            aria-controls="company"
            aria-selected="false"
          >
            <span class="radio-dot"></span>
            公司法人
          </button>
        </li>
        <li class="me-2" role="presentation">
          <button
            class="radio-tab inline-block p-4 border-b-2 rounded-t-base"
            id="dashboard-tab"
            data-tabs-target="#dashboard"
            type="button"
            role="tab"
            aria-controls="dashboard"
            aria-selected="false"
          >
            <span class="radio-dot"></span>
            個人商家
          </button>
        </li>
      </ul>
    </div>
    <!---------- radio切換 結束 ------------>

    <div id="default-tab-content">
      <!---------- 公司法人 panel 開始 ------------>
      <div
        class="hidden rounded-base"
        id="company"
        role="tabpanel"
        aria-labelledby="company-tab"
      >
        <div class="basic-info">
          <!-- 公司統編 開始 -->
          <div class="relative z-0 mt-8">
            <input
              type="text"
              id="floating_standard"
              class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder=" "
            />
            <label
              for="floating_standard"
              class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              >公司統編</label
            >
          </div>
          <!-- 公司統編 結束 -->
          <!-- 公司登記名稱 開始 -->
          <div class="relative z-0 mt-8">
            <input
              type="text"
              id="floating_standard"
              class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder=" "
            />
            <label
              for="floating_standard"
              class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              >公司登記名稱</label
            >
          </div>
          <!-- 公司登記名稱 結束 -->
          <!-- 公司電話 開始 -->
          <div class="relative z-0 mt-8">
            <input
              type="text"
              id="floating_standard"
              class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder=" "
            />
            <label
              for="floating_standard"
              class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              >公司電話</label
            >
          </div>
          <!-- 公司電話 結束 -->
          <!-- 公司產品類別 開始 -->
          <div class="mx-auto w-full mt-8">
            <label for="underline_select" class="sr-only">產品類別</label>
            <select
              id="underline_select"
              class="py-2.5 ps-0 w-full text-sm text-body bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            >
              <option selected>產品類別</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
            </select>
          </div>
          <!-- 公司產品類別 結束 -->
          <div class="subtitle text-2xl font-bold mt-8">公司登記地址</div>
          <!---------- 縣市 開始 ---------->
          <div class="relative mt-4">
            <button
              @click="toggleDropdown"
              class="inline-flex items-center justify-center box-border font-medium leading-5 text-sm px-4 py-2.5 focus:outline-none border-0 border-b-2 border-default-medium cursor-pointer"
              type="button"
            >
              <span>{{ selectedCityLabel }}</span>
              <svg
                class="w-4 h-4 ms-1.5 -me-0.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 9-7 7-7-7"
                />
              </svg>
            </button>

            <div
              v-if="isDropdownOpen"
              class="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-44 max-h-60 overflow-y-auto mt-1"
            >
              <ul class="text-sm text-gray-700 font-medium py-3 cursor-pointer">
                <li
                  v-for="(c, idx) in cities"
                  :key="c.CityName"
                  class="px-4 py-2 hover:bg-gray-100"
                  @click="pickCity(idx)"
                >
                  {{ c.CityName }}
                </li>
              </ul>
            </div>
          </div>
          <!---------- 縣市 結束 ---------->
        </div>
      </div>
      <!---------- 個人商家 panel 開始 ------------>
      <div
        class="hidden p-4 rounded-base bg-neutral-secondary-soft"
        id="dashboard"
        role="tabpanel"
        aria-labelledby="dashboard-tab"
      >
        <p class="text-sm text-body">
          This is some placeholder content the
          <strong class="font-medium text-heading"
            >Dashboard tab's associated content</strong
          >. Clicking another tab will toggle the visibility of this one for the
          next. The tab JavaScript swaps classes to control the content
          visibility and styling.
        </p>
      </div>
      <!---------- 個人商家 panel 結束 ------------>
    </div>
  </div>
</template>
