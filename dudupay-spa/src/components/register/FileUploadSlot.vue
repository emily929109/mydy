<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string | null
    label: string
    required?: boolean
    error?: string
  }>(),
  { required: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

// 月 1 不真的上傳，選檔案當下用 FileReader 轉 base64 做本地預覽，比照現有系統「選了就先預覽」的體驗。
function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    emit('update:modelValue', null)
    return
  }
  const reader = new FileReader()
  reader.onload = () => emit('update:modelValue', reader.result as string)
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="mb-3">
    <label class="form-label">{{ label }}<span v-if="required" class="text-danger"> *</span></label>
    <input class="form-control" type="file" accept="image/jpeg,image/png,image/gif" @change="onFileChange" />
    <div v-if="error" class="text-danger small mt-1">{{ error }}</div>
    <img v-if="modelValue" :src="modelValue" class="mt-2 img-thumbnail" style="max-width: 120px" alt="預覽" />
  </div>
</template>
