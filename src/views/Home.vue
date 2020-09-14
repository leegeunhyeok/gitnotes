<template>
  <div class="home">
    <h2>test</h2>
    <div>
      <button @click="increase">+</button>
      <button @click="decrease">-</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';
import core from '@/core';

export default defineComponent({
  name: 'Home',
  setup() {
    const store = useStore();
    const router = useRouter();
    store.state.init || router.push({ name: 'Main' });
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
