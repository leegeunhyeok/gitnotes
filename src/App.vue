<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { provideStore } from '@/store';
import { provideRouter } from '@/router';

export default defineComponent({
  name: 'App',
  setup() {
    provideStore();
    provideRouter();
  },
});
</script>

<style lang="scss">
@import '@/styles';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
