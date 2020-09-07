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
import { defineComponent, ref, computed } from 'vue';
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
  transition: background-color 0.3s, opacity 0.5s;

  &.enter:not(:disabled) {
    background-color: darken($backgroundColor, 10%);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.button {
  @include button($white, $black);

  &--red {
    @include button($red, $white);
  }

  &--orange {
    @include button($orange, $white);
  }

  &--yellow {
    @include button($yellow, $black);
  }

  &--green {
    @include button($green, $white);
  }

  &--blue {
    @include button($blue, $white);
  }

  &--purple {
    @include button($purple, $white);
  }

  &--black {
    @include button($black, $white);
  }

  &--white {
    @include button($white, $black);
  }
}
</style>