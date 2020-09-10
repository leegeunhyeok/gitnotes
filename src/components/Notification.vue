<template>
  <div class="notification">{{ message }}</div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Notification',
  props: {
    message: String,
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
