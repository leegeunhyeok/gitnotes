<template>
  <div class="note">
    <span class="tag" :class="tag.color" v-if="tag">{{ tag.name }}</span>
    <p>{{ title }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Tag } from '@/core/types';

interface NoteProps {
  title: string;
  tag?: Tag;
}

export default defineComponent({
  name: 'Note',
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    tag: Object,
  },
  setup() {
    // TODO
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/colors';
@import '@/styles/responsive';
@import '@/styles/tag';

@include theme {
  .note {
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    transition: background-color 0.2s;

    &:hover {
      background-color: t(color-btn-hover-bg);
    }

    span.tag {
      @include size(lg) {
        margin-right: 1rem;
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
}
</style>
