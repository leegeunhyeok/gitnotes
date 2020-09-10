<template>
  <div class="image">
    <transition name="fade">
      <img :src="src" @load="isRendered" @error="onError" v-show="!loading" />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, ref, computed } from 'vue';

export interface ImageProps {
  src: string;
}

export default defineComponent({
  name: 'Image',
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  emits: {
    'on-load': null,
    'on-error': null,
  },
  setup(props: ImageProps, { emit }: SetupContext) {
    const rendered = ref(false);
    const loading = computed(() => !rendered.value);

    // 1. Image onload (Focused at network)
    // 2. Waiting for requestAnimationFrame() -> Triggered after image render
    const isRendered = () => {
      requestAnimationFrame(() => {
        rendered.value = true;
        emit('on-load');
      });
    };

    const onError = () => emit('on-error');

    return { loading, isRendered, onError };
  },
});
</script>

<style lang="scss" scoped>
.image {
  width: 100%;
  height: 100%;
  background-color: #eee;

  img {
    display: block;
    width: 100%;
  }
}
</style>
