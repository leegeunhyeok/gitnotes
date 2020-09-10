<template>
  <div class="modal" @click="close">
    <div class="modal__mask">
      <div class="modal__panel">
        <header>
          <slot name="header"></slot>
        </header>
        <main>
          <slot name="body"></slot>
        </main>
        <footer>
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from 'vue';

export default defineComponent({
  name: 'Modal',
  setup(_, { emit }: SetupContext) {
    return { close: () => emit('close') };
  },
});
</script>

<style lang="scss">
@import '@/styles/responsive';

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;

  &__mask {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.3);
    width: 100%;
    height: 100%;
  }

  &__panel {
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    padding: 1rem;
    border-radius: 20px;
    background-color: #fff;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    overflow-y: auto;

    @include size(md) {
      width: 80%;
    }

    @include size(lg) {
      width: 50%;
    }

    header,
    main,
    footer {
      width: 100%;
    }

    main {
      padding: 1rem 0;
      max-height: 50vh;
      overflow-y: auto;
    }
  }
}
</style>
