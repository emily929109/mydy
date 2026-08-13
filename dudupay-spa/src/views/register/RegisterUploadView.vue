<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../../stores/registration'
import { registrationSteps } from '../../config/registrationSteps'
import RegisterStepLayout from '../../components/register/RegisterStepLayout.vue'

const STEP_KEY = 'step2Upload'
const router = useRouter()
const store = useRegistrationStore()
const stepIndex = registrationSteps.findIndex((s) => s.key === STEP_KEY)
const nextStep = registrationSteps[stepIndex + 1]

function markCompleteAndContinue() {
  store.completeStep(STEP_KEY)
  if (nextStep) router.push(nextStep.path)
}
</script>

<template>
  <RegisterStepLayout next-label="標記完成並前往下一步" @next="markCompleteAndContinue">
    <p class="text-muted">placeholder，實作見 issue 06</p>
  </RegisterStepLayout>
</template>
