<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registrationSteps } from '../../config/registrationSteps'
import RegisterWizardNav from './RegisterWizardNav.vue'

withDefaults(
  defineProps<{
    nextLabel?: string
    nextDisabled?: boolean
  }>(),
  { nextLabel: '下一步', nextDisabled: false },
)

const emit = defineEmits<{ next: [] }>()

const route = useRoute()
const router = useRouter()

const currentIndex = computed(() => registrationSteps.findIndex((step) => step.path === route.path))
const currentStep = computed(() => registrationSteps[currentIndex.value])
const previousStep = computed(() => (currentIndex.value > 0 ? registrationSteps[currentIndex.value - 1] : null))

function goToPrevious() {
  if (previousStep.value) router.push(previousStep.value.path)
}
</script>

<template>
  <div class="container py-4">
    <RegisterWizardNav class="mb-4" />
    <h2 class="mb-4">{{ currentStep?.title }}</h2>

    <slot />

    <div class="mt-4 d-flex justify-content-between">
      <button
        class="btn btn-outline-secondary"
        type="button"
        :disabled="!previousStep"
        @click="goToPrevious"
      >
        上一步
      </button>
      <button class="btn btn-primary" type="button" :disabled="nextDisabled" @click="emit('next')">
        {{ nextLabel }}
      </button>
    </div>
  </div>
</template>
