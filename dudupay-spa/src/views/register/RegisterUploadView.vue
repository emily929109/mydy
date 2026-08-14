<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../../stores/registration'
import { registrationSteps } from '../../config/registrationSteps'
import RegisterStepLayout from '../../components/register/RegisterStepLayout.vue'
import FileUploadSlot from '../../components/register/FileUploadSlot.vue'

const STEP_KEY = 'step2Upload'
const router = useRouter()
const store = useRegistrationStore()
const stepIndex = registrationSteps.findIndex((s) => s.key === STEP_KEY)
const nextStep = registrationSteps[stepIndex + 1]

// store.step2Upload 本身就是 reactive 物件，直接綁定即可，不用另外複製一份 local state。
const form = store.step2Upload

const errors = reactive<Record<string, string>>({
  idFront: '',
  idBack: '',
  selfie: '',
})

function validate(): boolean {
  errors.idFront = form.idFront ? '' : '請上傳身分證正面'
  errors.idBack = form.idBack ? '' : '請上傳身分證反面'
  errors.selfie = form.selfie ? '' : '請上傳自拍照'

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
    <FileUploadSlot
      v-model="form.idFront"
      label="身分證正面"
      required
      :error="errors.idFront"
    />
    <FileUploadSlot
      v-model="form.idBack"
      label="身分證反面"
      required
      :error="errors.idBack"
    />
    <FileUploadSlot v-model="form.secondId" label="第二證件（選填）" />
    <FileUploadSlot
      v-model="form.selfie"
      label="自拍照"
      required
      :error="errors.selfie"
    />
    <FileUploadSlot v-model="form.incomeProof" label="收入證明（選填）" />
  </RegisterStepLayout>
</template>
