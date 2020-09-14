<template>
  <div class="home">
    <h2>{{ store.state.login }}</h2>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';

export default defineComponent({
  name: 'Home',
  setup() {
    const store = useStore();
    const router = useRouter();
    store.state.init || router.push({ name: 'Main' });

    return { store };
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
