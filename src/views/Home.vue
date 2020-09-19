<template>
  <div class="home">
    <header>
      <Button :class="syncing ? 'syncing' : null">
        <span/>
      </Button>
    </header>
    <Profile/>
    <div class="home__filter">
      <hr/>
      <Button/>
    </div>
    <main>
      <Note v-for="note in notes" :id="note.id" :title="note.title" :tag="note.tag" :key="note.id" @click="getNoteContent"/>
    </main>
    <!-- Notes -->
    <transition name="fade">
      <NoteEditor v-model:initialContent="content" @close="writing = false" v-show="writing"/>
    </transition>
    <div class="home__footer">
      <Button :color="theme" @click="writing = true">
        <span/>
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';
import { GetterTypes } from '@/store/getters';
import { ActionTypes } from '@/store/actions';
import { Note as NoteModel, Tag } from '@/core';
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
    const writing = ref(false);
    const content = ref('');
    const notes = computed(() => {
      // getters[GetterTypes.NOTES]
      // getters[GetterTypes.TAGS]
      const tags = [
        {
          id: '23daasd',
          name: 'web',
          color: 'blue'
        }
      ] as Tag[]

      return ([{
        id: 'test',
        tag: '23daasd',
        title: 'Vue.js 3 기초 정리',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        id: 'test2',
        tag: '23daasd',
        title: 'React 기초 정리!!',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        id: 'test3',
        tag: '23daasd',
        title: 'React 기초 정리!!',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        id: 'test4',
        tag: '23daasd',
        title: 'React 기초 정리!!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        id: 'test5',
        tag: '23daasd',
        title: 'React 기초 정리!!',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        id: 'test6',
        tag: '23daasd',
        title: 'React 기초 정리!!',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        id: 'test7',
        tag: '23daasd',
        title: 'React 기초 정리!!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        id: 'test8',
        tag: '23daasd',
        title: 'React 기초 정리!!',
        createdAt: new Date(),
        updatedAt: new Date(),
      }] as NoteModel[]).map((note) => {
        return {
          ...note,
          ...(note.tag ? { tag: tags.find((tag) => tag.id === note.tag) || note.tag } : null)
        }
      });
    })
    getters[GetterTypes.APPLICATION_INITIALIZED] || router.push({ name: 'Main' });
    
    const getNoteContent = (note: NoteModel) => {
      dispatch(ActionTypes.GET_NOTE_CONTENT, { name: note.title, tagId: note.tag }).then(noteContent => {
        content.value = noteContent;
      });
    }

    return {
      theme: getters[GetterTypes.THEME],
      notes: notes,
      writing,
      content,
      getNoteContent
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/colors';

@mixin grow($delay: 0s) {
  will-change: transform;
  transform: scale(0);
  animation: grow .5s $delay alternate forwards;
}

.home {
  padding: .5rem;
  max-width: 700px;
  margin: auto;

  header {
    text-align: right;
    padding: .5rem;
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
    @include grow(.6s);

    & > hr {
      border: none;
      width: 100%;
      height: 1px;
      background-color: $line-color;
    }

    & > button {
      position: absolute;
      top: 50%;
      left: 50%;
      padding: .2rem .8rem;
      border: 1px solid $line-color;
      height: 24px;
      width: 60px;
      background-image: url('~@/assets/filter.svg');
      background-repeat: no-repeat;
      background-position: 16px;
      transform: translate(-50%, -50%);
    }
  }
  
  main {
    padding: 0 1rem;
    margin-bottom: 5.5rem;
    opacity: 0;
    animation: fade .4s .8s linear forwards;
  }

  &__footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-bottom: 2rem;
    @include grow(.8s);

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
