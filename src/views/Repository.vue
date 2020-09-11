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
        <Button color="blue" :disabled="!repositoryName" @click="doRepositoryTask">{{ nextText }}</Button>
      </div>
      <div class="component-group">
        <a @click="createNewRepository = !createNewRepository">{{ toggleText }}</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, computed } from 'vue';
import { useStore } from '@/store';
import { useRouter } from 'vue-router';
import { ActionTypes } from '@/store/actions';
import { MutationTypes } from '@/store/mutations';
import { showNotification } from '@/services/notification';
import GitNotesDB from '@/database';
import M, { messageFrom } from '@/messages';
import Button from '@/components/Button.vue';

export default defineComponent({
  name: 'Repository',
  components: { Button },
  setup() {
    const store = useStore();
    const router = useRouter();
    const createNewRepository = ref(true);
    const repositoryName = ref('');
    const nextText = computed(() => (createNewRepository.value ? '새로 만들기' : '저장소 찾기'));
    const toggleText = computed(() =>
      createNewRepository.value ? '기존 저장소로 시작할래요' : '새 저장소에 시작할래요',
    );

    // Need user name & token
    onBeforeMount(() => !(store.state.name && store.state.token) && router.push({ name: 'Main' }));

    const saveRepositoryAndContinue = () => {
      return GitNotesDB.getInstance()
        .insert('repository', {
          name: store.state.repository,
          branch: store.state.branch,
        })
        .then(() => {
          // TODO: create base file, routing, etc..
        });
    };

    const createRepository = () => {
      return store
        .dispatch(ActionTypes.CREATE_REPOSITORY, repositoryName.value)
        .then(() => {
          return saveRepositoryAndContinue();
        })
        .catch((err) => {
          const status = err?.response?.status;
          if (status === 422) {
            showNotification(M.ALREADY_EXIST_REPO);
          } else {
            showNotification(messageFrom(status));
          }
        });
    };

    const findRepository = () => {
      return store
        .dispatch(ActionTypes.USE_EXIST_REPOSITORY, repositoryName.value)
        .then(() => {
          return saveRepositoryAndContinue();
        })
        .catch((err) => {
          const status = err?.response?.status;
          if (status === 404) {
            showNotification(M.REPO_NOT_FOIND);
          } else {
            showNotification(messageFrom(status));
          }
        });
    };

    const doRepositoryTask = () => {
      store.commit(MutationTypes.SET_LOADING, true);
      (createNewRepository.value ? createRepository() : findRepository()).finally(() => {
        store.commit(MutationTypes.SET_LOADING, false);
      });
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
  padding-top: 2rem;

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
