<template>
  <h1>Reaction Timer</h1>
  <button @click="startTimer">Start</button>
  <Block v-if="isPlaying" :delay="delay" />
</template>

<script>
import Block from "@/components/Block.vue";

export default {
  name: "App",
  components: { Block },
  data() {
    return {
      isPlaying: false,
      delay: null,
    };
  },
  methods: {
    startTimer() {
      this.delay = Math.random() * 5000 + 2000;
      this.isPlaying = true;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #444;
  margin-top: 60px;
}
</style>
