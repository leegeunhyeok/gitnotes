<template>
  <div class="loading">
    <div class="loading__icon">
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
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 9999;

  &__icon {
    padding: 0.5rem;
    border-radius: 50%;
    animation: 1s spin linear infinite;

    &__dot {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      margin: 0 4px;

      &:nth-child(1) {
        animation: bounce 4s infinite;
      }
      &:nth-child(2) {
        animation: bounce 4s 0.2s infinite;
      }
      &:nth-child(3) {
        animation: bounce 4s 0.4s infinite;
      }
    }
  }
}

@keyframes bounce {
  0% {
    transform: translateY(0);
    background-color: #ffcdd2;
  }

  12.5% {
    transform: translateY(1rem);
  }

  25% {
    transform: translateY(0rem);
    background-color: #c8e6e1;
  }

  37.5% {
    transform: translateY(1rem);
  }

  50% {
    transform: translateY(0rem);
    background-color: #faf0c8;
  }

  62.5% {
    transform: translateY(1rem);
  }

  75% {
    transform: translateY(0rem);
    background-color: #c8e6fa;
  }

  87.5% {
    transform: translateY(1rem);
  }

  100% {
    transform: translateY(0);
    background-color: #ffcdd2;
  }
}
</style>
