<template>
  <div class="home">
    <header>
      <Button :class="syncing ? 'syncing' : null">
        <span />
      </Button>
    </header>
    <Profile />
    <div class="home__filter">
      <transition name="collapse">
        <div class="home__filter__list" v-show="showFilterList">
          <span class="tag all">All</span>
          <span class="tag empty">Empty</span>
          <span class="tag red">A</span>
          <span class="tag green">B</span>
          <span class="tag blue">C</span>
        </div>
      </transition>
      <Button @click="showFilterList = !showFilterList" />
    </div>
    <main>
      <Note
        v-for="note in notes"
        :id="note.id"
        :title="note.title"
        :tag="note.tag"
        :key="note.id"
        @click="getNoteContent(note)"
      />
    </main>
    <!-- Notes -->
    <transition name="fade">
      <NoteEditor
        :initialTitle="title"
        :initialContent="content"
        @close="writing = false"
        v-show="writing"
      />
    </transition>
    <div class="home__footer">
      <Button color="primary" @click="writing = true">
        <span />
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';
import { GetterTypes } from '@/store/getters';
import { ActionTypes } from '@/store/actions';
import { Types as CoreTypes } from '@/core';
import { useLoadingView } from '@/compositions/Loading';
import Button from '@/components/Button.vue';
import Profile from '@/components/Profile.vue';
import Note from '@/components/Note.vue';
import NoteEditor from '@/components/NoteEditor.vue';

export default defineComponent({
  name: 'Home',
  components: { Button, Profile, Note, NoteEditor },
  setup() {
    const { getters, dispatch } = useStore();
    const router = useRouter();
    const loadingView = useLoadingView();
    const showFilterList = ref(false);
    const writing = ref(false);
    const title = ref('');
    const content = ref('');
    getters[GetterTypes.APPLICATION_INITIALIZED] || router.push({ name: 'Main' });

    watch(
      () => writing.value,
      val => {
        if (val) {
          document.body.setAttribute('style', 'overflow:hidden');
        } else {
          document.body.removeAttribute('style');
        }
      },
    );

    const getNoteContent = (note: CoreTypes.Note) => {
      loadingView.show();
      dispatch(ActionTypes.GET_NOTE, note.id)
        .then(noteContent => {
          title.value = note.title;
          content.value = noteContent;
          writing.value = true;
        })
        .finally(() => loadingView.hide());
    };

    return {
      notes: getters[GetterTypes.NOTES],
      showFilterList,
      writing,
      title,
      content,
      getNoteContent,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/colors';
@import '@/styles/tag';

@mixin grow($delay: 0s) {
  will-change: transform;
  transform: scale(0);
  animation: grow 0.5s $delay alternate forwards;
}

.home {
  padding: 0.5rem;
  max-width: 700px;
  margin: auto;

  header {
    text-align: right;
    padding: 0.5rem;
    padding-bottom: 0;

    button {
      padding: 5px;

      & > span {
        display: block;
        width: 24px;
        height: 24px;
        background-image: url('~@/assets/sync.svg');
      }

      &.syncing {
        &:hover {
          cursor: default;
          background-color: #fff;
        }

        & > span {
          animation: spin 2s linear infinite;
        }
      }
    }
  }

  &__filter {
    $line-color: darken($gray, 5%);
    position: relative;
    padding: 0 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e1e1e1;
    @include grow(0.6s);

    & > button {
      position: absolute;
      left: 50%;
      bottom: -25px;
      padding: 0.2rem 0.8rem;
      border: 1px solid $line-color;
      height: 24px;
      width: 60px;
      background-image: url('~@/assets/filter.svg');
      background-repeat: no-repeat;
      background-position: 16px;
      transform: translate(-50%, -50%);
    }

    &__list {
      width: 100%;
      padding: 1rem 0;
      max-height: 2rem;
      overflow-x: auto;
      white-space: nowrap;
    }
  }

  main {
    padding: 0 1rem;
    margin-bottom: 5.5rem;
    opacity: 0;
    animation: fade 0.4s 1s linear forwards;
  }

  &__footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-top: 1rem;
    padding-bottom: 2rem;
    background: rgb(255, 255, 255);
    background: linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
    @include grow(0.8s);

    button {
      box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.2);
    }

    span {
      display: block;
      width: 24px;
      height: 24px;
      background-image: url('~@/assets/pen.svg');
    }
  }
}

@keyframes grow {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fade {
  100% {
    opacity: 1;
  }
}

@keyframes spin {
  100% {
    transform: rotate(-360deg);
  }
}
</style>
