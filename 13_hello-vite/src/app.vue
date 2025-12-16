<script setup>
import { onMounted } from "vue";
import { initFlowbite } from "flowbite";

// initialize components based on data attribute selectors
onMounted(() => {
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
