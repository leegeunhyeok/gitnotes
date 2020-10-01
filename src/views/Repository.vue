<template>
  <div class="repository">
    <transition name="fade" mode="out-in">
      <div v-if="!done">
        <h3>
          {{ createNewRepository ? '📦 새로운 저장소로 시작하기' : '⭐️ 기존 저장소 사용하기' }}
        </h3>
        <div class="component-group">
          <p>노트를 저장할 저장소를 선택합니다</p>
        </div>
        <div class="repository__form">
          <div class="component-group">
            <input
              type="text"
              placeholder="Repository"
              spellcheck="false"
              v-model="repositoryName"
            />
          </div>
          <div class="component-group">
            <Button color="blue" :disabled="!repositoryName" @click="doRepositoryTask">{{
              nextText
            }}</Button>
          </div>
          <div class="component-group">
            <a @click="createNewRepository = !createNewRepository">{{ toggleText }}</a>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="repository__done">🎉</div>
        <h3>좋아요!</h3>
        <p>기본 정보를 준비하고 있습니다{{ dots }}</p>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onBeforeUnmount, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';
import { ActionTypes } from '@/store/actions';
import { MutationTypes } from '@/store/mutations';
import { showNotification } from '@/services/notification';
import M, { messageFrom } from '@/messages';
import Button from '@/components/Button.vue';
import core from '@/core';

const dotInterval = (tick = 500) => {
  const dotString = '...';
  const dots = ref('');
  let dotsIndex = dotString.length;

  const id = window.setInterval(() => {
    dots.value = '...'.slice(dotsIndex--);
    if (dotsIndex < 0) dotsIndex = dotString.length;
  }, tick);

  onBeforeUnmount(() => clearInterval(id));

  return dots;
};

export default defineComponent({
  name: 'Repository',
  components: { Button },
  setup() {
    const store = useStore();
    const router = useRouter();
    const createNewRepository = ref(true);
    const repositoryName = ref('');
    const done = ref(false);
    const dots = dotInterval();
    const nextText = computed(() => (createNewRepository.value ? '새로 만들기' : '저장소 찾기'));
    const toggleText = computed(() =>
      createNewRepository.value ? '기존 저장소로 시작할래요' : '새 저장소에 시작할래요',
    );

    // Need user name & token
    onBeforeMount(() => !store.getters.USER_STATE_AVAILABLE && router.push({ name: 'Main' }));

    const registUserAndContinue = () => {
      return core
        .saveUser({
          login: store.state.login,
          name: store.state.name,
          bio: store.state.bio,
          photo: store.state.photo,
          theme: store.state.theme,
          token: store.state.token,
          repository: store.state.repository,
          branch: store.state.branch,
        })
        .then(() => {
          done.value = true;
          return Promise.all([
            createNewRepository.value &&
              core
                .createMeta(store.state.login, store.state.repository, store.state.token)
                .then(() => {
                  return core.putNote('환영합니다 👋', '# GitNotes 시작하기');
                }),
            new Promise(resolve => setTimeout(resolve, 2000)),
          ]).then(() => {
            store.commit(MutationTypes.APP_INITIALIZAED, undefined);
            router.push({ name: 'Home' });
          });
        });
    };

    const createRepository = () => {
      return store
        .dispatch(ActionTypes.CREATE_REPOSITORY, repositoryName.value)
        .then(() => registUserAndContinue())
        .catch(err => {
          console.error(err);
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
        .dispatch(ActionTypes.GET_REPOSITORY, {
          username: store.state.login,
          repositoryName: repositoryName.value,
        })
        .then(() => registUserAndContinue())
        .catch(err => {
          console.error(err);
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
      done,
      dots,
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

  & > div {
    width: 80%;
    max-width: $width-limit;
    @include size(md) {
      width: 75%;
    }
    @include size(lg) {
      width: 40%;
    }
  }

  &__form {
    width: 100%;
    height: 10.8rem;

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

  &__done {
    animation-name: done;
    animation-delay: 0s;
    animation-duration: 1s;
    animation-fill-mode: forwards;
  }
}

@keyframes done {
  0% {
    font-size: 0;
  }

  50% {
    font-size: 8rem;
  }

  100% {
    font-size: 6rem;
  }
}
</style>
