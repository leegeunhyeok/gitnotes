<template>
  <div class="note">
    <span class="note__tag" :class="tag.color" v-if="tag">{{ tag.name }}</span>
    <p>{{ title }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Tag } from '@/core';

interface NoteProps {
  title: string;
  tag?: Tag;
}

export default defineComponent({
  name: 'Note',
  props: {
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    tag: Object
  },
  setup () {
    // TODO
  }
});
</script>

<style lang="scss">
@import '@/styles/colors';
@import '@/styles/responsive';

.note {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: .8rem;

  &__tag {
    padding: .2rem .4rem;
    border-radius: 20px;
    color: #fff;
    font-size: .8rem;
    font-weight: bold;
    margin-right: .5rem;

    @include size(lg) {
      margin-right: 1rem;
    }

    &.red {
      background-color: $red;
    }

    &.pink {
      background-color: $pink;
    }

    &.orange {
      background-color: $orange;
    }

    &.yellow {
      background-color: $yellow;
    }

    &.green {
      background-color: $green;
    }

    &.blue {
      background-color: $blue;
    }

    &.purple {
      background-color: $purple;
    }

    &.black {
      background-color: $black;
    }
  }

  & > p {
    display: inline-block;
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 1rem;
    line-height: 140%;
  }
}
</style>
