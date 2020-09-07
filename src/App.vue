<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { provideStore } from '@/store';
import { provideRouter } from '@/router';
import GitNotesDB from '@/database';

export default defineComponent({
  name: 'App',
  setup() {
    provideStore();
    provideRouter();

    const db = GitNotesDB.getInstance();
    GitNotesDB.getInstance()
      .store('user', {
        name: String,
        bio: String,
        photo: String,
        pat: String,
      })
      .store('tag', {
        id: String,
        name: String,
        color: String,
        createdAt: Date,
      })
      .store('note', {
        id: String,
        title: String,
        content: String,
        createdAt: Date,
        updatedAt: Date,
      })
      .open(2)
      .then(() => {
        db.insert('tag', {
          id: 'test',
          name: 'james',
          color: '#123123',
          createdAt: new Date(),
        });
      });
  },
});
</script>

<style lang="scss">
@import '@/styles';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
