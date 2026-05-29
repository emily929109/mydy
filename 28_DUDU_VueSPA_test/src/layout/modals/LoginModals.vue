<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

// 注意：本次重構未接後端登入驗證 API。以下表單與按鈕僅還原 UI 與互動，
// Login/Login2 目前為占位（提示尚未接 API），驗證碼 canvas 不繪製。
const router = useRouter()

const u = reactive({ mobile: '', pw: '', code: '', mobile2: '', pw2: '', code2: '' })
const showPassword = ref(false)
const showPassword2 = ref(false)
const pwFieldType = ref('password')
const pwFieldType2 = ref('password')

function eye() {
  showPassword.value = !showPassword.value
  pwFieldType.value = showPassword.value ? 'text' : 'password'
}
function eye2() {
  showPassword2.value = !showPassword2.value
  pwFieldType2.value = showPassword2.value ? 'text' : 'password'
}
function login() {
  alert('登入功能尚未接後端 API（本次僅重構前端版面）。')
}
function login2() {
  alert('特約商登入功能尚未接後端 API（本次僅重構前端版面）。')
}
function registerNow() {
  router.push('/Home/Register')
}
</script>

<template>
  <div id="menuTopApp">
    <!-- 會員 登入 -->
    <div class="modal fade" id="authentication-modal" tabindex="-1" role="dialog" aria-labelledby="authentication-modal-label" aria-hidden="true">
      <div class="modal-dialog mt-6" role="document">
        <div class="modal-content border-0">
          <div class="modal-header px-5 position-relative modal-shape-header" style="overflow: hidden; background-color: #00af9a">
            <div class="position-relative z-index-1 light">
              <div class="fs-2 fw-bold text-white" id="authentication-modal-label">會員登入 DUDUPAY</div>
            </div>
            <div class="position-absolute top-0 end-0 mt-2 me-2 z-index-1">
              <button class="btn-close btn btn-sm btn-circle d-flex flex-center transition-base p-0 m-0" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
          </div>
          <div class="modal-body py-4 px-5">
            <form autocomplete="off" @submit.prevent>
              <div class="mb-3">
                <input class="form-control" type="text" placeholder="手機號碼或電子郵件" v-model.trim="u.mobile" />
              </div>
              <div class="mb-3">
                <div style="display: flex; align-items: center">
                  <input class="form-control" :type="pwFieldType" placeholder="密碼" v-model.trim="u.pw" />
                  <span @click="eye()" v-show="!showPassword"><span class="fas fa-eye-slash fs-2" style="margin-left: -30px; cursor: pointer"></span></span>
                  <span @click="eye()" v-show="showPassword"><span class="fas fa-eye fs-2" style="margin-left: -30px; cursor: pointer"></span></span>
                </div>
              </div>
              <div class="mb-3" style="display: flex; align-items: center">
                <input type="text" class="form-control" style="margin: 2px" v-model.trim="u.code" placeholder="請輸入驗證碼" />
                <canvas id="auth-code" style="height: 40px; width: 150px"></canvas>
              </div>
              <div class="mb-0">
                <div class="d-flex">
                  <div class="p-2 flex-fill"><router-link style="color: #00af9a" to="/Home/Forget">忘記密碼</router-link></div>
                  <div class="p-2 flex-fill text-end"><a style="color: #00af9a" href="#" @click.prevent="registerNow()">立即註冊</a></div>
                </div>
              </div>
              <div class="mb-3">
                <div class="btn btn-primary d-block w-100 mt-3" style="background-color: #00af9a; border-color: #00af9a" @click="login()">登 入</div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 特約商 登入 -->
    <div class="modal fade" id="authentication-modal-2" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog mt-6" role="document">
        <div class="modal-content border-0">
          <div class="modal-header px-5 position-relative modal-shape-header" style="overflow: hidden; background-color: #00af9a">
            <div class="position-relative z-index-1 light">
              <h4 class="mb-0 text-white">特約商登入 DUDUPAY</h4>
            </div>
            <button class="btn-close btn-close-white position-absolute top-0 end-0 mt-2 me-2" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body py-4 px-5">
            <form autocomplete="off" @submit.prevent>
              <div class="mb-3">
                <input class="form-control" type="text" placeholder="特約商帳號" v-model.trim="u.mobile2" />
              </div>
              <div class="mb-3">
                <div style="display: flex; align-items: center">
                  <input class="form-control" :type="pwFieldType2" placeholder="密碼" v-model.trim="u.pw2" />
                  <span @click="eye2()" v-show="!showPassword2"><span class="fas fa-eye-slash fs-2" style="margin-left: -30px; cursor: pointer"></span></span>
                  <span @click="eye2()" v-show="showPassword2"><span class="fas fa-eye fs-2" style="margin-left: -30px; cursor: pointer"></span></span>
                </div>
              </div>
              <div class="mb-3" style="display: flex; align-items: center">
                <input type="text" class="form-control" style="margin: 2px" v-model.trim="u.code2" placeholder="請輸入驗證碼" />
                <canvas id="auth-code2" style="height: 40px; width: 150px"></canvas>
              </div>
              <div class="mb-0">
                <router-link style="color: #00af9a" to="/Home/DealerForgetPw">忘記密碼</router-link>
              </div>
              <div class="mb-3">
                <div class="btn btn-primary d-block w-100 mt-3" style="background-color: #00af9a; border-color: #00af9a" @click="login2()">登 入</div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
