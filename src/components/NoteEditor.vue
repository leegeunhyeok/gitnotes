<template>
  <div class="editor">
    <div class="editor__container">
      <div class="editor__container__header">
        <Button :color="theme" @click="onClose">
          <span />
        </Button>
      </div>
      <div class="editor__container__body">
        <input type="text" placeholder="제목" spellcheck="false" />
        <textarea v-model="content" placeholder="내용" spellcheck="false" />
        <Button @click="onSave">저장하기</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, onMounted, onBeforeUnmount, ref } from 'vue';
import { useStore } from '@/store';
import { GetterTypes } from '@/store/getters';
import Button from '@/components/Button.vue';

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
    return { theme: getters[GetterTypes.THEME], content, onClose, onSave };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/colors';
@import '@/styles/content';
@import '@/styles/responsive';

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
      height: calc(100% - 4rem);

      @mixin field {
        outline: none;
        padding: 1rem;
        font-size: 1rem;
        border-radius: 24px;
        background-color: #fff;
        border: none;
        width: 100%;
      }

      & > * {
        display: block;
      }

      input[type='text'] {
        @include field;
        margin-bottom: 14px;
      }

      textarea {
        @include field;
        resize: none;
        height: calc(100% - 8rem);
        margin-bottom: 14px;
      }

      button {
        width: 100%;
        padding: 1rem;
      }
    }
  }
}
</style>
