<template>
  <div class="main">
    <div class="main__logo" :class="{ outline: available && userPhoto }">
      <transition name="fade" mode="out-in">
        <Image
          :src="userPhoto"
          :key="1"
          @on-load="photoLoaded = true"
          @on-error="photoLoaded = false"
          v-if="available && userPhoto"
        />
        <img src="@/assets/logo.png" :key="2" v-else />
      </transition>
    </div>
    <transition name="grow">
      <div class="main__regist" v-if="doRegistration">
        <transition name="fade" mode="out-in">
          <div v-if="available">
            <h3>{{ userName }}</h3>
            <div class="component-group">
              <Button color="blue" @click="next">계속하기</Button>
            </div>
            <div class="component-group">
              <a @click="reset">다른 계정으로 시작할래요</a>
            </div>
          </div>
          <div v-else>
            <h3>GitNotes</h3>
            <div class="component-group">
              <Button color="blue" @click="login">
                <span class="github-icon" />
                GitHub 계정으로 시작하기
              </Button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from '@/store';
import { useRouter } from 'vue-router';
import { useLoadingView } from '@/compositions/Loading';
import { useUser } from '@/compositions/User';
import { ActionTypes } from '@/store/actions';
import { MutationTypes } from '@/store/mutations';
import { showNotification } from '@/services/notification';
import M from '@/messages';
import Button from '@/components/Button.vue';
import Image from '@/components/Image.vue';

export default defineComponent({
  name: 'Main',
  components: { Button, Image },
  setup() {
    const store = useStore();
    const router = useRouter();
    const LoadingView = useLoadingView();
    const doRegistration = ref(false);
    const photoLoaded = ref(false);
    const input = ref('');
    const available = ref(false);
    const loading = computed(() => store.state.loading);

    // Init (Load user data from IDB -> Fetch git tree -> Load metadata)
    (async function init() {
      const hasStoredUser = await store.dispatch(ActionTypes.LOAD_USER, undefined);
      doRegistration.value = !hasStoredUser;
      if (!hasStoredUser) throw new Error('No user found');

      // Show splash image (Minimum 1.5 sec)
      await Promise.all([
        (async () => {
          await store.dispatch(ActionTypes.LOAD_METADATA, undefined);
        })(),
        new Promise(resolve => setTimeout(resolve, 1500)),
      ]);
      store.commit(MutationTypes.APP_INITIALIZAED, undefined);
      router.push({ name: 'Home' });
    })().catch(() => {
      // Need registration
      setTimeout(() => (doRegistration.value = true), 1000);
    });

    // GitHub Login via Firebase OAuth
    const login = () => {
      store
        .dispatch(ActionTypes.GITHUB_LOGIN, undefined)
        .then(token => {
          store.commit(MutationTypes.SET_TOKEN, token);
          store.dispatch(ActionTypes.GET_PROFILE, token);
        })
        .then(() => (available.value = true)) // Success
        .catch(() => {
          showNotification(M.USER_NOT_FOUND);
        })
        .finally(() => {
          LoadingView.hide();
          store.state.name || store.commit(MutationTypes.SET_NAME, input.value);
        });
    };

    // Reset user state (vuex)
    const reset = () => {
      available.value = false;
      store.commit(MutationTypes.RESET_USER, undefined);
    };

    const next = () => router.push({ name: 'Repository' });

    return {
      doRegistration,
      input,
      available,
      photoLoaded,
      login,
      reset,
      next,
      loading,
      ...useUser(),
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/colors';
@import '@/styles/responsive';

$width-limit: 350px;

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &__logo {
    width: 70vw;
    height: 70vw;
    max-width: $width-limit;
    border-style: solid;
    border-width: 1px;
    border-color: #fff;
    border-radius: 50%;
    overflow: hidden;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    transform: translateZ(0);

    @include size(md) {
      width: $width-limit - 80px;
      height: $width-limit - 80px;
    }

    @include size(lg) {
      width: $width-limit - 40px;
      height: $width-limit - 40px;
    }

    &.outline {
      border-color: $gray;
    }

    img {
      display: block;
      width: 100%;
    }
  }

  &__regist {
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

span.github-icon {
  display: inline-block;
  vertical-align: middle;
  width: 1rem;
  height: 1rem;
  background-image: url('~@/assets/github.svg');
  background-repeat: no-repeat;
}
</style>
