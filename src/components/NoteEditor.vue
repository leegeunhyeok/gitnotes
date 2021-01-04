<template>
  <div class="editor">
    <div class="editor__container">
      <div class="editor__container__header">
        <Button color="dark" @click="onClose">
          <span />
        </Button>
      </div>
      <div class="editor__container__body">
        <div class="editor__title">
          <input type="text" placeholder="제목" spellcheck="false" v-model="title" />
        </div>
        <div class="editor__tag">
          <div class="editor__tag--selected" @click="showTagList = !showTagList">
            Tag:
            <span class="tag" :class="selectedTag.color" :key="selectedTag.id">{{
              selectedTag.name
            }}</span>
          </div>
          <transition name="fade">
            <div class="editor__tag__list" v-show="showTagList">
              <p>Tag list</p>
              <!-- TODO: Add tags -->
              <span class="tag empty" @click="setTag(null)">Empty</span>
              <span
                class="tag"
                v-for="tag in tags"
                :class="tag.color"
                :key="tag.id"
                @click="setTag(tag)"
              >
                {{ tags }}
              </span>
              <!-- Samples -->
              <span class="tag red">1</span>
              <span class="tag yellow">2</span>
              <span class="tag green">3</span>
              <span class="tag blue">4</span>
              <span class="tag purple">5</span>
              <span class="tag red">6</span>
              <span class="tag yellow">7</span>
              <span class="tag green">8</span>
              <span class="tag blue">9</span>
              <span class="tag purple">10</span>
            </div>
          </transition>
        </div>
        <div class="editor__content">
          <textarea placeholder="내용" spellcheck="false" v-model="content" />
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
import { EmptyTag, Types as CoreTypes } from '@/core';

import Button from '@/components/Button.vue';
import { ActionTypes } from '@/store/actions';
import { useLoadingView } from '@/compositions/Loading';

interface EditorProps {
  initialTitle?: string;
  initialContent?: string;
}

export default defineComponent({
  name: 'Editor',
  props: {
    initialTitle: String,
    initialContent: String,
  },
  components: { Button },
  setup(props: EditorProps, { emit }: SetupContext) {
    const { getters, dispatch } = useStore();
    const loadingView = useLoadingView();
    const showTagList = ref(false);
    const title = ref(props.initialTitle || '');
    const content = ref(props.initialContent || '');
    const selectedTag = ref<CoreTypes.Tag>(EmptyTag);

    const onClose = () => emit('close');
    const onSave = () => {
      loadingView.show();
      dispatch(ActionTypes.ADD_NOTE, {
        title: title.value || '',
        content: content.value || '',
        // tagId
      })
        .catch(console.error)
        .finally(() => loadingView.hide());
    };

    const setTag = (tag: CoreTypes.Tag | null) => {
      selectedTag.value = tag || EmptyTag;
      showTagList.value = false;
    };

    return {
      tags: getters[GetterTypes.TAGS],
      selectedTag,
      showTagList,
      title,
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
@import '@/styles/tag';

@mixin field {
  outline: none;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 25px;
  background-color: #fff;
  border: none;
  width: 100%;
}

@include theme {
  .editor {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9998;
    background-color: t(color-bg-primary);

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
      position: relative;
      width: 100%;
      padding-top: 0.6rem;
      padding-bottom: 0.6rem;

      &--selected {
        cursor: pointer;
        // color: darken($gray, 20%);
        height: 100%;
        text-align: left;
      }

      &__list {
        @include field;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        text-align: left;
        border-radius: 0;
        border-top-left-radius: 25px;
        border-top-right-radius: 25px;
        padding-bottom: 0;
        border-bottom: 1px solid #eee;
        max-height: 400px;
        overflow-y: auto;

        & > p {
          color: #bbbbbb;
          margin-top: 0;
        }

        & > span {
          display: inline-block;
          margin-bottom: 1rem;
        }
      }
    }

    &__content {
      height: calc(100% - 12rem);
    }
  }
}
</style>
