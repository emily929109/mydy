<script setup>
import { onMounted, ref, computed, nextTick } from "vue";
import { initFlowbite } from "flowbite";

// --- 狀態變數 ---
const cities = ref([]); // 空陣列，儲存fetch後的資料
const ddCityBtn1 = ref(null);
const ddCityBtn2 = ref(null);
const ddAreaBtn1 = ref(null);
const ddAreaBtn2 = ref(null);
const selectedCityIndex1 = ref(null);
const selectedCityIndex2 = ref(null);
const selectedAreaIndex1 = ref(null);
const selectedAreaIndex2 = ref(null);
const MAX = 200;
const message = ref("");

// --- 計算屬性 ---
const selectedCity1 = computed(() => {
  if (selectedCityIndex1.value === null) return "請選擇縣市";
  return cities.value[selectedCityIndex1.value].CityName;
});

const selectedArea1 = computed(() => {
  if (selectedAreaIndex1.value === null) return "請選擇區域";
  return cities.value[selectedCityIndex1.value].AreaList[
    selectedAreaIndex1.value
  ].AreaName;
});

const used = computed(() => message.value.length);
const remaining = computed(() => MAX - used.value);

// --- 初始化 ---
onMounted(() => {
  loadCityData();
  initFlowbite();
});

async function loadCityData() {
  try {
    const url =
      "https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json";
    const res = await fetch(url);
    const data = await res.json();

    cities.value = data.filter(
      (item) => item.CityName !== "釣魚臺" && item.CityName !== "南海島"
    );
    console.log(cities);
  } catch (error) {
    console.error("無法讀取資料", error);
  }
}

function pickCity(which, index) {
  if (which === 1) {
    selectedCityIndex1.value = index;
    ddCityBtn1.value.click();
  } else if (which === 2) {
    selectedCityIndex2.value = value;
    ddCityBtn2.value.click();
  }
}

function pickArea(which, index) {
  if (which == 1) {
    selectedAreaIndex1.value = index;
    ddAreaBtn1.value.click();
  } else if (which === 2) {
    selectedAreaIndex2.value = value;
    ddAreaBtn2.value.click();
  }
}
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
          <!-- 公司統編 -->
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
          <!-- 公司登記名稱 -->
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
          <!-- 公司電話 -->
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
          <!-- 公司產品類別-->
          <div class="mx-auto w-full mt-8">
            <label for="underline_select" class="sr-only">產品類別</label>
            <select
              id="underline_select"
              class="py-2.5 w-full text-sm text-body bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            >
              <option selected>產品類別</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
            </select>
          </div>
          <div class="subtitle text-2xl font-bold mt-8">公司登記地址</div>
          <!---------- 公司登記地址 開始 ---------->
          <div class="flex gap-4">
            <!-- 縣市 -->
            <div class="relative mt-4 grow shrink-0 basis-0">
              <button
                ref="ddCityBtn1"
                data-dropdown-toggle="ddCityMenu1"
                class="inline-flex items-center justify-between box-border font-medium leading-5 text-sm py-2.5 focus:outline-none border-0 border-b-2 border-default-medium cursor-pointer w-full"
                type="button"
              >
                <span>{{ selectedCity1 }}</span>
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
                id="ddCityMenu1"
                class="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1 hidden w-full"
              >
                <ul
                  class="text-sm text-gray-700 font-medium py-3 cursor-pointer"
                >
                  <li
                    v-for="(class, index) in cities"
                    :key="c.CityName"
                    class="px-4 py-2 hover:bg-gray-100"
                    @click="pickCity(1, idx)"
                  >
                    {{ c.CityName }}
                  </li>
                </ul>
              </div>
            </div>
            <!-- 區域 -->
            <div class="relative mt-4 grow shrink-0 basis-0">
              <button
                ref="ddAreaBtn1"
                data-dropdown-toggle="ddAreaMenu1"
                class="inline-flex items-center justify-between box-border font-medium leading-5 text-sm py-2.5 focus:outline-none border-0 border-b-2 border-default-medium cursor-pointer w-full"
                type="button"
              >
                <span>{{ selectedArea1 }}</span>
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
                id="ddAreaMenu1"
                class="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1 hidden w-full"
              >
                <ul
                  class="text-sm text-gray-700 font-medium py-3 cursor-pointer"
                >
                  <li
                    v-for="(a, idx) in selectedCityIndex1 !== null
                      ? cities[selectedCityIndex1].AreaList
                      : []"
                    :key="a.AreaName"
                    class="px-4 py-2 hover:bg-gray-100"
                    @click="pickArea(1, idx)"
                  >
                    {{ a.AreaName }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- 詳細地址 -->
          <div class="relative z-0 mt-4">
            <input
              type="text"
              id="floating_standard"
              class="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder=" "
            />
            <label
              for="floating_standard"
              class="absolute text-sm text-body duration-300 transform -translate-y-6 scale-75 top-3 -z-10 peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
              >詳細地址</label
            >
          </div>
          <!---------- 公司登記地址 結束 ---------->
          <!-- 營業型態 -->
          <div class="flex gap-8 mt-8">
            <div>營業型態(複選)</div>
            <div class="flex items-center">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
              />
              <label
                for="default-checkbox"
                class="select-none ms-2 text-sm font-medium"
                >Default checkbox</label
              >
            </div>
            <div class="flex items-center">
              <input
                id="checked-checkbox"
                type="checkbox"
                value=""
                class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
              />
              <label
                for="checked-checkbox"
                class="select-none ms-2 text-sm font-medium"
                >Checked state</label
              >
            </div>
          </div>
        </div>
        <!-- basic-info 結束 -->
        <!-- 留言內容 -->
        <div class="mt-8">
          <label
            for="message"
            class="block mb-2.5 text-sm font-medium text-heading"
            >業務內容說明</label
          >
          <textarea
            id="message"
            rows="4"
            class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body"
            placeholder="業務內容說明"
            v-model="message"
            :maxlength="MAX"
          ></textarea>
          <div class="flex justify-end text-xs text-gray-500">
            <span :class="remaining < 0 ? 'text-red-600' : ''">
              {{ used }}/{{ MAX }}
            </span>
          </div>
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
