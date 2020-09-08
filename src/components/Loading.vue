<template>
  <div class="loading">
    <div class="loading__icon">
      <span class="loading__icon__dot" />
      <span class="loading__icon__dot" />
      <span class="loading__icon__dot" />
      <span class="loading__icon__dot" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Loading',
});
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 9999;

  &__icon {
    padding: 0.5rem;
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    -webkit-animation: 1s spin linear infinite;
    animation: 1s spin linear infinite;

    &__dot {
      display: block;
      width: 50%;
      height: 50%;
      border-radius: 50%;
      float: left;

      &:nth-child(1) {
        background-color: #ffcdd2;
      }
      &:nth-child(2) {
        background-color: #c8e6e1;
      }
      &:nth-child(3) {
        background-color: #faf0c8;
      }
      &:nth-child(4) {
        background-color: #c8e6fa;
      }
    }
  }
}

@-webkit-keyframes spin {
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>