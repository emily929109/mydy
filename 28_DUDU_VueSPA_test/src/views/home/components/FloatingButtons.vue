<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '@/stores/member'
import { mobilecheck } from '@/utils'

const memberStore = useMemberStore()
const { memberIsShow } = storeToRefs(memberStore)
const showLineCode = ref(false)

// 對應原站 index.js showLine()
function showLine() {
  if (mobilecheck()) window.location.href = 'https://lin.ee/S1imNhV'
  else showLineCode.value = !showLineCode.value
}
</script>

<template>
  <div class="position-fixed fixbtn-wrapper">
    <!-- Line（會員登入後顯示） -->
    <div v-show="memberIsShow">
      <div
        @click="showLine()"
        style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; box-shadow: 1px 1px 10px #0003; cursor: pointer"
      >
        <img style="width: 100%; height: auto" src="/assets/img/dudu/icon-line2.png" />
      </div>
      <transition>
        <div
          v-if="showLineCode"
          style="position: absolute; left: -213px; top: -460px; max-height: 460px; background-color: #fff; box-shadow: 1px 1px 10px #0003; transition: all 1.5s ease; pointer-events: auto"
        >
          <div class="mb-0 p-2" style="background-color: #00c300"><span style="color: white">LINE</span></div>
          <div style="color: #fff; padding: 10px 15px; position: relative; pointer-events: auto">
            <img style="width: 100%; height: auto" src="/assets/img/dudu/1717472476544.jpg" />
          </div>
          <div class="d-flex justify-content-center mb-1">
            <p class="fw-bold fs-0">透過行動條碼加入LINE好友</p>
          </div>
          <div class="d-flex justify-content-center mb-1 p-1">
            <p class="fs--1">請在LINE應用程式上開啟「好友」分頁，點選畫面右上方用來加入好友的圖示，接著點選「行動條碼」，然後掃描此行動條碼。</p>
          </div>
        </div>
      </transition>
    </div>

    <!-- 立即申辦（非會員顯示） -->
    <div v-show="!memberIsShow" class="register-btn">
      <a href="/Home/Register">
        <div style="width: 100%"><img style="width: 100%; height: auto" src="/img/banner/立即申辦按鈕-02.png" /></div>
        <div class="register-btn-text">立即申辦</div>
      </a>
    </div>
  </div>
</template>

<style>
/* 由原站 Index.cshtml「立即申辦按鈕」CSS 搬移 */
.fixbtn-wrapper {
  position: fixed;
  bottom: 70px;
  right: 20px;
  z-index: 3;
}

.register-btn {
  align-items: center;
  background: #00ac97;
  border-radius: 50%;
  box-shadow: 0 2px 4px 0 #a6a6a6;
  cursor: pointer;
  display: flex;
  width: 135px;
  height: 135px;
  justify-content: center;
}

.register-btn-text {
  position: absolute;
  inset: 0px;
  width: 65px;
  height: 65px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 27px;
  font-weight: bold;
  text-shadow: 3px 2px 1px #00897b;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 125%;
}

.register-btn div:first-of-type img {
  animation: rotation 20s linear infinite;
}

@keyframes rotation {
  100% {
    transform: rotate(-1turn);
  }
}
</style>
