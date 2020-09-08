<template>
  <div id="app">
    <router-view />
    <transition name="fade">
      <Loading v-show="isLoading" />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import GitNotesDB from '@/database';

import Loading from '@/components/Loading.vue';

export default defineComponent({
  name: 'App',
  components: { Loading },
  setup() {
    const store = useStore();
    const isLoading = computed(() => store.state.loading);

    GitNotesDB.getInstance()
      .store('user', {
        name: String,
        bio: String,
        photo: String,
        pat: String,
      })
      .store('tag', {
        id: String,
        name: String,
        color: String,
        createdAt: Date,
      })
      .store('note', {
        id: String,
        title: String,
        content: String,
        createdAt: Date,
        updatedAt: Date,
      })
      .version(1);

    return { isLoading };
  },
});
</script>

<style lang="scss">
@import '@/styles';

#app {
  text-align: center;
  color: #2c3e50;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
