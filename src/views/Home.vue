<template>
  <div class="home">
    <h2>{{ name }}</h2>
    <div>
      <button @click="increase">+</button>
      <button @click="decrease">-</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Home',
  setup() {
    // TODO
  },
});
</script>

<style lang="scss" scoped>
.home {
  img {
    max-width: 400px;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>
