<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    label: string
    id?: string
    type?: string
    error?: string
    disabled?: boolean
  }>(),
  { type: 'text', disabled: false },
)

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <input
      :id="id"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
  </div>
</template>
