<template>
  <div class="repository">
    <h3>{{ createNewRepository ? '🎉 새로운 저장소로 시작하기' : '⭐️ 기존 저장소 사용하기' }}</h3>
    <div class="component-group">
      <p>노트를 저장할 저장소를 선택합니다</p>
    </div>
    <div class="repository__form">
      <div class="component-group">
        <input type="text" placeholder="Repository" spellcheck="false" v-model="repositoryName" />
      </div>
      <div class="component-group">
        <Button color="blue" :disabled="!repositoryName" @click="doRepositoryTask"
          >{{ nextText }}
        </Button>
      </div>
      <div class="component-group">
        <a @click="createNewRepository = !createNewRepository">{{ toggleText }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import Button from '@/components/Button';

export default defineComponent({
  name: 'Repository',
  components: { Button },
  setup() {
    const createNewRepository = ref(true);
    const repositoryName = ref('');
    const nextText = computed(() => (createNewRepository.value ? '새로 만들기' : '저장소 찾기'));
    const toggleText = computed(() =>
      createNewRepository.value ? '기존 저장소로 시작할래요' : '새 저장소에 시작할래요',
    );

    const doRepositoryTask = () => {
      // TODO
    };

    return {
      createNewRepository,
      repositoryName,
      nextText,
      toggleText,
      doRepositoryTask,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/colors';
@import '@/styles/responsive';

$width-limit: 350px;

.repository {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  &__form {
    width: 80%;
    max-width: $width-limit;
    height: 10.8rem;

    @include size(md) {
      width: 75%;
    }

    @include size(lg) {
      width: 40%;
    }

    h3 {
      height: 30px;
    }

    input {
      text-align: center;
    }

    input,
    button {
      width: 100%;
    }

    a {
      cursor: pointer;
      font-size: 0.8rem;
      color: #999;
    }
  }
}
</style>
