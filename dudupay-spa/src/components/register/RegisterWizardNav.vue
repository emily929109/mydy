<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { registrationSteps } from '../../config/registrationSteps'
import { useRegistrationStore } from '../../stores/registration'

const route = useRoute()
const store = useRegistrationStore()

const activeIndex = computed(() => {
  const index = registrationSteps.findIndex((step) => step.path === route.path)
  return index === -1 ? 0 : index
})
</script>

<template>
  <el-steps :active="activeIndex" finish-status="success" align-center>
    <el-step
      v-for="step in registrationSteps"
      :key="step.key"
      :title="step.title"
      :status="store.isStepCompleted(step.key) ? 'success' : undefined"
    />
  </el-steps>
</template>
