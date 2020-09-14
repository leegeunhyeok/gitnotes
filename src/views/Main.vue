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
              <Button color="blue" @click="nextToRegistToken">계속하기</Button>
            </div>
            <div class="component-group">
              <a @click="resetUserProfile">다시 입력할래요</a>
            </div>
          </div>
          <div v-else>
            <h3>👋 Github 계정을 입력해주세요!</h3>
            <div class="component-group">
              <input
                type="text"
                placeholder="username"
                spellcheck="false"
                @keydown="resetUserProfile"
                v-model="input"
              />
            </div>
            <div class="component-group">
              <Button
                color="blue"
                :disabled="!input || loading"
                @click="getUserProfile"
              >{{ input && !loading ? '시작하기' : '...' }}</Button>
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
import { ActionTypes } from '@/store/actions';
import { MutationTypes } from '@/store/mutations';
import { showNotification } from '@/services/notification';
import core from '@/core';
import GithubAPI from '@/apis/github';
import M, { messageFrom } from '@/messages';
import Button from '@/components/Button.vue';
import Image from '@/components/Image.vue';

export default defineComponent({
  name: 'Main',
  components: { Button, Image },
  setup() {
    const store = useStore();
    const router = useRouter();
    const doRegistration = ref(false);
    const photoLoaded = ref(false);
    const input = ref('');
    const available = ref(false);
    const loading = computed(() => store.state.loading);
    const userName = computed(() => store.state.name);
    const userBio = computed(() => store.state.bio);
    const userPhoto = computed(() => store.state.photo);
    GithubAPI.resetPersonalAccessToken();

    // Init (Load user data from IDB -> Fetch git tree -> Load metadata)
    (async function init() {
      const hasStoredUser = await store.dispatch(ActionTypes.LOAD_USER, undefined);
      doRegistration.value = !hasStoredUser;
      if (!hasStoredUser) throw new Error('No user found');
      await store.dispatch(ActionTypes.GIT_INIT, undefined);
      await store.dispatch(ActionTypes.LOAD_METADATA, undefined);
      store.commit(MutationTypes.APP_INITIALIZAED, undefined);
      router.push({ name: 'Home' });
    })().catch(() => {
      // Need registration
      setTimeout(() => {
        doRegistration.value = true;
      }, 1000);
    });

    // Get user profile data from Github API
    const getUserProfile = () => {
      store.commit(MutationTypes.SET_LOADING, true);
      store
        .dispatch(ActionTypes.GET_PROFILE, input.value)
        .then(() => (available.value = true)) // Success
        .catch((err) => {
          console.error(err);
          const status = err?.response?.status;
          if (status === 403) {
            showNotification(M.LIMIT_EXECEEDED);
          } else if (status === 404) {
            showNotification(M.USER_NOT_FOUND);
          } else {
            showNotification(messageFrom(status));
          }
        })
        .finally(() => {
          store.commit(MutationTypes.SET_LOADING, false);
          store.state.name || store.commit(MutationTypes.SET_NAME, input.value);
        });
    };

    // Reset user state (vuex)
    const resetUserProfile = () => {
      available.value = false;
      store.commit(MutationTypes.RESET_USER, undefined);
    };

    const nextToRegistToken = () => router.push({ name: 'Token' });

    return {
      doRegistration,
      input,
      available,
      photoLoaded,
      getUserProfile,
      resetUserProfile,
      nextToRegistToken,
      loading,
      userName,
      userBio,
      userPhoto,
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
</style>
