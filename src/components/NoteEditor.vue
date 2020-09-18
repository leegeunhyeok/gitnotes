<template>
  <div class="editor">
    <div class="editor__container">
      <div class="editor__container__header">
        <Button :color="theme" @click="onClose"/>
      </div>
      <div class="editor__container__body">
        <input type="text" placeholder="제목" spellcheck="false">
        <textarea v-model="content" placeholder="내용" spellcheck="false"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, ref } from 'vue';
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
      default: ''
    }
  },
  components: { Button },
  setup (props: EditorProps, { emit }: SetupContext) {
    const { getters } = useStore();
    const content = ref(props.initialContent);
    const onClose = () => emit('close');
    return { theme: getters[GetterTypes.THEME], content, onClose };
  }
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

    &__header {
      padding-top: 0;
      height: 50px;
      
      & > button {
        width: 24px;
        height: 24px;
        background-image: url('~@/assets/close.svg');
        background-position: 1px 1px;
        float: right;
      }
    }

    &__body {
      position: relative;
      height: 100%;

      @mixin field {
        outline: none;
        padding: 1rem;
        font-size: 1rem;
        border-radius: 12px;
        background-color: #fff;
        border: none;
        width: 100%;
      }

      input[type=text] {
        @include field;
        margin-bottom: 14px;
      }

      textarea {
        position: absolute;
        left: 0;
        top: 5rem;
        bottom: 4rem;
        resize: none;
        @include field;
      }
    }
  }
}
</style>
