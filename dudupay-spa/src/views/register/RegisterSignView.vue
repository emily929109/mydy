<script setup lang="ts">
import { computed } from 'vue'
import { useRegistrationStore } from '../../stores/registration'
import RegisterStepLayout from '../../components/register/RegisterStepLayout.vue'

const STEP_KEY = 'step7Sign'
const store = useRegistrationStore()

const isDone = computed(() => store.isStepCompleted(STEP_KEY))

function markComplete() {
  store.completeStep(STEP_KEY)
}
</script>

<template>
  <RegisterStepLayout
    :next-label="isDone ? '已完成' : '標記完成（確認簽署）'"
    :next-disabled="isDone"
    @next="markComplete"
  >
    <p class="text-muted">placeholder，實作見 issue 09</p>
  </RegisterStepLayout>
</template>
