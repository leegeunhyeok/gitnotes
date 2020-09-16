<template>
  <div class="home">
    <Profile :username="store.state.login" :photo="store.state.photo" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';
import Profile from '@/components/Profile.vue';

export default defineComponent({
  name: 'Home',
  components: { Profile },
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
  padding: 1rem;
  max-width: 800px;
  margin: auto;
}
</style>
