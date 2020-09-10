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
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
import GitNotesDB from '@/database';
import Controller from '@/services/notification';
import Notification from '@/components/Notification.vue';
import Loading from '@/components/Loading.vue';

export default defineComponent({
  name: 'App',
  components: { Notification, Loading },
  setup() {
    const store = useStore();
    const isLoading = computed(() => store.state.loading);
    // Notification state
    const message = ref('');
    const show = ref(false);

    // Notification event bind + state management
    Controller.getInstance().register(event => {
      event.message !== null && (message.value = event.message);
      show.value = event.show;
    });

    // Create basic IDB object stores.
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

    return { message, show, isLoading };
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
