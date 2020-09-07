<template>
  <div class="image">
    <transition name="fade">
      <img :src="src" @load="checkRender" v-show="isLoaded" />
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
  setup(props: ImageProps, { emit }: SetupContext) {
    const loaded = ref(false);
    const rendered = ref(false);
    const isLoaded = computed(() => loaded.value && rendered.value);

    const img = new Image();
    img.src = computed(() => props.src).value;
    img.onload = () => (loaded.value = true);
    img.onerror = () => emit('on-error');

    const checkRender = () => {
      requestAnimationFrame(() => {
        rendered.value = true;
        emit('on-load');
      });
    };

    return { checkRender, isLoaded };
  },
});
</script>

<style lang="scss" scoped>
.image {
  width: 100%;
  height: 100%;
  background-color: #eee;

  img {
    width: 100%;
  }
}
</style>