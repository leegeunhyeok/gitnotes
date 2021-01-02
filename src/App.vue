<template>
  <div id="app">
    <transition name="notification">
      <Notification :message="message" v-show="show" />
    </transition>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <transition name="fade">
      <Loading v-show="isLoading" />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import store, { provideStore } from '@/store';
import Controller from '@/services/notification';
import Notification from '@/components/Notification.vue';
import Loading from '@/components/Loading.vue';

const useNotification = () => {
  const show = ref(false);
  const message = ref('');

  // Notification event bind + state management
  Controller.getInstance().register(event => {
    event.message !== null && (message.value = event.message);
    show.value = event.show;
  });

  const isDark = false;
  onMounted(() => document.body.classList.add(isDark ? 'dark' : 'light'));

  return { show, message };
};

export default defineComponent({
  name: 'App',
  components: { Notification, Loading },
  setup() {
    provideStore();
    const { show, message } = useNotification();
    const isLoading = computed(() => store.state.loading);
    return { show, message, isLoading };
  },
});
</script>

<style lang="scss">
@import '@/styles';

#app {
  text-align: center;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
