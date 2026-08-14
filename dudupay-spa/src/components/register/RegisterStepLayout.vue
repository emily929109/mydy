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
    <div class="row justify-content-center">
      <div class="col-lg-7 col-sm-10 col-xxl-5 px-0 px-md-3">
        <div class="card mb-4">
          <div class="card-header bg-light pt-3 pb-2">
            <RegisterWizardNav />
          </div>
          <div class="card-body py-4">
            <h3 class="fw-bold text-primary mb-4">{{ currentStep?.title }}</h3>

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
        </div>
      </div>
    </div>
  </div>
</template>
