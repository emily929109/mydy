<template>
  <div class="wrapper"></div>
</template>

<script>
export default {
  name: "Block",
  props: {
    delay: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped>
.wrapper {
  width: 100px;
  height: 100px;
  background-color: red;
}
</style>
