<template>
  <div class="home">
    <img :src="src" />
    <h2>{{ bio }}</h2>
  </div>
</template>

<script lang="ts">
import github from '@/apis/github';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'Home',
  setup() {
    const src = ref('');
    const bio = ref('');

    // Test
    onMounted(() => {
      // github.setPersonalAccessToken('');
      github.getUser('leegeunhyeok').then((data) => {
        src.value = data.avatar_url || '';
        bio.value = data.bio || '';
      });

      // github
      //   .putRepositoryContent({
      //     user: 'leegeunhyeok',
      //     repository: 'test2',
      //     path: 'test.txt',
      //     content: 'SGVsbG8hIQ==',
      //     message: 'TEST',
      //   })
      //   .then(console.log);
    });

    return { src, bio };
  },
});
</script>

<style lang="scss" scoped>
.home {
  img {
    max-width: 400px;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>