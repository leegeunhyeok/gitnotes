<template>
  <button
    :class="buttonStyleClass"
    @mouseenter="enter"
    @mouseleave="leave"
    @touchstart="enter"
    @touchend="leave"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useTouchable } from '@/compositions/Touchable';

export interface ButtonProps {
  color?: string;
}

export default defineComponent({
  name: 'Button',
  props: {
    color: String,
  },
  setup(props: ButtonProps) {
    const { touchClass, enter, leave } = useTouchable('enter');

    const buttonStyleClass = computed(() => {
      const colorClass = props.color ? `button--${props.color}` : 'button';
      return {
        [colorClass]: true,
        ...touchClass,
      };
    });

    return { buttonStyleClass, enter, leave };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/colors';

@mixin button($backgroundColor, $textColor) {
  cursor: pointer;
  outline: none;
  padding: 0.8rem;
  font-size: 1rem;
  border: none;
  border-radius: 3rem;
  color: $textColor;
  background-color: $backgroundColor;
  transition: background-color 0.2s, opacity 0.5s;

  &.enter:not(:disabled) {
    background-color: darken($backgroundColor, 20%);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

@include theme {
  .button {
    @include button(t(color-auto-white), t(color-btn-primary-text));

    &--red {
      @include button(t(color-auto-red-4), t(color-btn-primary-text));
    }

    &--orange {
      @include button(t(color-auto-orange-4), t(color-btn-primary-text));
    }

    &--yellow {
      @include button(t(color-auto-yellow-4), t(color-btn-primary-text));
    }

    &--green {
      @include button(t(color-auto-green-4), t(color-btn-primary-text));
    }

    &--blue {
      @include button(t(color-auto-blue-4), t(color-btn-primary-text));
    }

    &--purple {
      @include button(t(color-auto-purple-4), t(color-btn-primary-text));
    }

    &--pink {
      @include button(t(color-auto-pink-4), t(color-btn-primary-text));
    }

    &--gray {
      @include button(t(color-auto-gray-4), t(color-btn-primary-text));
    }

    &--dark {
      @include button(t(dark), t(color-btn-primary-text));
    }
  }
}
</style>
