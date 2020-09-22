<template>
  <div class="editor">
    <div class="editor__container">
      <div class="editor__container__header">
        <Button :color="theme" @click="onClose">
          <span />
        </Button>
      </div>
      <div class="editor__container__body">
        <div class="editor__title">
          <input type="text" placeholder="제목" spellcheck="false" />
        </div>
        <div class="editor__tag">
          <!-- TODO: Add tags -->
          <span class="empty">없음</span>
          <span v-for="tag in tags" :class="tag.color" :key="tag.id" @click="setTag(tag)">
            {{ tags }}
          </span>
          <!-- Samples -->
          <span class="red">1</span>
          <span class="yellow">2</span>
          <span class="green">3</span>
          <span class="blue">4</span>
          <span class="purple">5</span>
          <span class="red">1</span>
          <span class="yellow">2</span>
          <span class="green">3</span>
          <span class="blue">4</span>
          <span class="purple">5</span>
        </div>
        <div class="editor__content">
          <textarea v-model="content" placeholder="내용" spellcheck="false" />
        </div>
        <div class="editor__control">
          <Button @click="onSave">저장하기</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, ref } from 'vue';
import { useStore } from '@/store';
import { GetterTypes } from '@/store/getters';
import Button from '@/components/Button.vue';
import { Tag } from '@/core';

interface EditorProps {
  initialContent?: string;
}

export default defineComponent({
  name: 'Editor',
  props: {
    initialContent: {
      type: String,
      default: '',
    },
  },
  components: { Button },
  setup(props: EditorProps, { emit }: SetupContext) {
    const { getters } = useStore();
    const content = ref(props.initialContent);

    const onClose = () => emit('close');
    const onSave = () => {
      // TODO: Save data (Github, IDB)
      console.log('save');
    };

    const setTag = (tag: Tag | null) => {
      console.log(tag?.id);
    };

    return {
      theme: getters[GetterTypes.THEME],
      tags: getters[GetterTypes.TAGS],
      content,
      onClose,
      onSave,
      setTag,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/colors';
@import '@/styles/content';
@import '@/styles/responsive';

@mixin field {
  outline: none;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 2rem;
  background-color: #fff;
  border: none;
  width: 100%;
}

.editor {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;

  @at-root #app.red & {
    background-color: $red;
  }

  @at-root #app.pink & {
    background-color: $pink;
  }

  @at-root #app.orange & {
    background-color: $orange;
  }

  @at-root #app.yellow & {
    background-color: $yellow;
  }

  @at-root #app.green & {
    background-color: $green;
  }

  @at-root #app.blue & {
    background-color: $blue;
  }

  @at-root #app.purple & {
    background-color: $purple;
  }

  @at-root #app.black & {
    background-color: $black;
  }

  &__container {
    @include content;
    margin: auto;
    height: 100%;
    max-width: 700px;

    &__header {
      display: inline-block;
      padding-top: 0;
      width: 100%;

      & > button {
        float: right;

        span {
          display: block;
          width: 24px;
          height: 24px;
          background-image: url('~@/assets/close.svg');
        }
      }
    }

    &__body {
      position: relative;
      height: calc(100% - 5rem);

      & > div {
        display: block;
        width: 100%;
        margin-bottom: 14px;
      }

      input[type='text'] {
        @include field;
      }

      textarea {
        @include field;
        resize: none;
        height: 100%;
      }

      button {
        width: 100%;
        padding: 1rem;
      }
    }
  }

  &__tag {
    @include field;
    width: 100%;
    padding-top: 0.6rem;
    padding-bottom: 0.6rem;
    white-space: nowrap;
    overflow-x: auto;

    & > span {
      cursor: pointer;
      padding: 0.4rem 1rem;
      font-size: 1rem;
      border-radius: 2rem;
      color: #fff;
      margin-right: 1rem;
      transition: 0.2s;
      display: inline-block;

      &:nth-last-child(1) {
        margin-right: 0;
      }

      &:hover {
        opacity: 0.5;
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

      &.empty {
        color: lighten($black, 30%);
        background-color: #fff;
        border: 1px dashed darken($gray, 20%);
      }
    }
  }

  &__content {
    height: calc(100% - 12rem);
  }
}
</style>
