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

@mixin button($backgroundColor, $tintColor, $textColor) {
  cursor: pointer;
  outline: none;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid $tintColor;
  border-radius: 3rem;
  color: $textColor;
  background-color: $backgroundColor;
  transition: background-color 0.2s, opacity 0.5s;

  &.enter:not(:disabled) {
    @debug $backgroundColor;
    background-color: tint($backgroundColor, 5%);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

@include theme {
  .button {
    @include button(
      color(color-auto-white),
      color(color-auto-gray-3),
      color(color-btn-primary-text)
    );

    &--red {
      @include button(
        color(color-auto-red-5),
        color(color-auto-red-6),
        color(color-btn-primary-text)
      );
    }

    &--orange {
      @include button(
        color(color-auto-orange-5),
        color(color-auto-orange-6),
        color(color-btn-primary-text)
      );
    }

    &--yellow {
      @include button(
        color(color-auto-yellow-5),
        color(color-auto-yellow-6),
        color(color-btn-primary-text)
      );
    }

    &--green {
      @include button(
        color(color-auto-green-5),
        color(color-auto-green-6),
        color(color-btn-primary-text)
      );
    }

    &--blue {
      @include button(
        color(color-auto-blue-5),
        color(color-auto-blue-6),
        color(color-btn-primary-text)
      );
    }

    &--purple {
      @include button(
        color(color-auto-purple-5),
        color(color-auto-purple-6),
        color(color-btn-primary-text)
      );
    }

    &--pink {
      @include button(
        color(color-auto-pink-5),
        color(color-auto-pink-6),
        color(color-btn-primary-text)
      );
    }

    &--gray {
      @include button(
        color(color-auto-gray-5),
        color(color-auto-gray-6),
        color(color-btn-primary-text)
      );
    }

    &--dark {
      @include button(color(dark), color(color-auto-black), color(color-btn-primary-text));
    }
  }
}
</style>
