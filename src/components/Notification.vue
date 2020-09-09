<template>
  <transition name="notification">
    <div class="notification" v-show="show">{{ message }}</div>
  </transition>
</template>

<script>
import { defineComponent, ref } from 'vue';
import Controller from '@/services/notification';

export default defineComponent({
  name: 'Notification',
  setup() {
    const message = ref('');
    const show = ref(false);

    Controller.getInstance().register((event) => {
      event.message !== null && (message.value = event.message);
      show.value = event.show;
    });

    return { message, show };
  },
});
</script>

<style lang="scss" scoped>
.notification {
  position: fixed;
  top: 0px;
  left: 50%;
  padding: 1rem;
  margin-top: 1rem;
  max-width: 90%;
  background-color: #fff;
  border-radius: 3rem;
  font-size: 1rem;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, 0);
}
</style>