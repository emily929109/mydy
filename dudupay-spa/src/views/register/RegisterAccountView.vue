<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../../stores/registration'
import { registrationSteps } from '../../config/registrationSteps'
import RegisterStepLayout from '../../components/register/RegisterStepLayout.vue'
import FormField from '../../components/register/FormField.vue'
import { isFakeOtpValid, FAKE_OTP_HINT } from '../../fixtures/registration'

const STEP_KEY = 'step1Account'
const router = useRouter()
const store = useRegistrationStore()
const stepIndex = registrationSteps.findIndex((s) => s.key === STEP_KEY)
const nextStep = registrationSteps[stepIndex + 1]

// store.step1Account 本身就是 reactive 物件，直接綁定即可，不用另外複製一份 local state。
const form = store.step1Account

const errors = reactive<Record<string, string>>({
  password: '',
  confirmPassword: '',
  email: '',
  mobile: '',
  smsOtp: '',
  emailOtp: '',
  agreedTerms: '',
})

// 比照現有系統 js/register.js 的手刻 regex 規則
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,18}$/
const MOBILE_RULE = /^09\d{8}$/
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(): boolean {
  errors.password = PASSWORD_RULE.test(form.password)
    ? ''
    : '密碼須為 8-18 碼，且同時包含大小寫英文字母與數字'
  errors.confirmPassword =
    form.confirmPassword !== '' && form.confirmPassword === form.password ? '' : '確認密碼與密碼不一致'
  errors.email = EMAIL_RULE.test(form.email) ? '' : 'Email 格式不正確'
  errors.mobile = MOBILE_RULE.test(form.mobile) ? '' : '手機格式須為 09 開頭、共 10 碼數字'
  errors.smsOtp = isFakeOtpValid(form.smsOtp) ? '' : `簡訊 OTP 錯誤（${FAKE_OTP_HINT}）`
  errors.emailOtp = isFakeOtpValid(form.emailOtp) ? '' : `Email OTP 錯誤（${FAKE_OTP_HINT}）`
  errors.agreedTerms = form.agreedTerms ? '' : '請先閱讀並同意服務條款'

  return Object.values(errors).every((message) => message === '')
}

function handleNext() {
  if (!validate()) return
  store.completeStep(STEP_KEY)
  if (nextStep) router.push(nextStep.path)
}
</script>

<template>
  <RegisterStepLayout next-label="下一步" @next="handleNext">
    <FormField id="password" v-model="form.password" type="password" label="密碼" :error="errors.password" />
    <FormField
      id="confirmPassword"
      v-model="form.confirmPassword"
      type="password"
      label="確認密碼"
      :error="errors.confirmPassword"
    />
    <FormField id="email" v-model="form.email" type="email" label="Email" :error="errors.email" />
    <FormField id="mobile" v-model="form.mobile" type="tel" label="手機號碼" :error="errors.mobile" />

    <p class="form-text">{{ FAKE_OTP_HINT }}</p>
    <FormField id="smsOtp" v-model="form.smsOtp" label="簡訊 OTP" :error="errors.smsOtp" />
    <FormField id="emailOtp" v-model="form.emailOtp" label="Email OTP" :error="errors.emailOtp" />

    <FormField id="referralCode" v-model="form.referralCode" label="推薦碼（選填）" />

    <div class="form-check mb-3">
      <input id="agreedTerms" v-model="form.agreedTerms" class="form-check-input" type="checkbox" />
      <label class="form-check-label" for="agreedTerms">我已閱讀並同意服務條款</label>
      <div v-if="errors.agreedTerms" class="text-danger small">{{ errors.agreedTerms }}</div>
    </div>
  </RegisterStepLayout>
</template>
