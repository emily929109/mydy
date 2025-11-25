<script setup>
import { ref } from "vue";
import DatePicker from "primevue/datepicker";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";

const date = ref(null);
</script>

<template>
  <div style="padding: 40px">
    <FloatLabel>
      <DatePicker id="birthday" v-model="date" />
      <label for="birthday">生日</label>
    </FloatLabel>
  </div>
</template>

<style scoped></style>
