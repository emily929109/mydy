<script setup lang="ts">
import { ref } from 'vue'

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

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif']
const MAX_SIZE_BYTES = 9.9 * 1024 * 1024

const selectionError = ref('')

// 月 1 不真的上傳，選檔案當下用 FileReader 轉 base64 做本地預覽，比照現有系統「選了就先預覽」的體驗。
// 型別/大小驗證放在這裡做：這是唯一摸得到原始 File 物件的地方，讀成 base64 之後就只剩字串了。
function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    selectionError.value = ''
    emit('update:modelValue', null)
    return
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    selectionError.value = '檔案格式須為 jpg/jpeg/png/gif'
    input.value = ''
    emit('update:modelValue', null)
    return
  }
  if (file.size > MAX_SIZE_BYTES) {
    selectionError.value = '檔案大小不可超過 9.9MB'
    input.value = ''
    emit('update:modelValue', null)
    return
  }

  selectionError.value = ''
  const reader = new FileReader()
  reader.onload = () => emit('update:modelValue', reader.result as string)
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="upload-slot mb-3">
    <div class="form-label">{{ label }}<span v-if="required" class="text-danger"> *</span></div>
    <label class="upload-slot-box" :class="{ 'is-invalid': selectionError || error }">
      <svg
        v-if="!modelValue"
        class="upload-slot-icon"
        viewBox="0 0 24 24"
        width="30"
        height="30"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M7 18a4 4 0 0 1-.6-7.96 5 5 0 0 1 10.5-1.98A4.5 4.5 0 0 1 17 17H7Z" />
        <path d="M12 12v6m-2.5-3.5L12 12l2.5 2.5" />
      </svg>
      <img v-else :src="modelValue" class="upload-slot-preview" alt="預覽" />
      <input class="visually-hidden" type="file" accept="image/jpeg,image/png,image/gif" @change="onFileChange" />
    </label>
    <div v-if="selectionError || error" class="text-danger small mt-1">{{ selectionError || error }}</div>
  </div>
</template>

<style scoped>
.upload-slot-box {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  width: 100%;
  max-width: 220px;
  cursor: pointer;
  overflow: hidden;
  border: 1px dashed var(--bs-primary);
  border-radius: 1rem;
  background-color: #ebebeb;
}

.upload-slot-box.is-invalid {
  border-color: var(--bs-danger);
}

.upload-slot-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  color: var(--bs-primary);
  transform: translate(-50%, -50%);
}

.upload-slot-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
