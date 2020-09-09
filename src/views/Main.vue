<template>
  <div class="main">
    <div class="main__logo" :class="{ outline: userPhoto }">
      <transition name="fade" mode="out-in">
        <Image
          :src="userPhoto"
          :key="1"
          @on-load="photoLoaded = true"
          @on-error="photoLoaded = false"
          v-if="userPhoto"
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
              <Button color="blue">계속하기</Button>
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
import { from } from 'rxjs';
import { delay } from 'rxjs/operators';
import { defineComponent, onBeforeUnmount, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Store } from '@/store';
import GitNotesDB from '@/database';
import { ActionTypes } from '@/store/actions';
import { MutationTypes } from '@/store/mutations';
import { showNotification } from '@/services/notification';
import { ErrorMessages } from '@/messages';
import Button from '@/components/Button.vue';
import Image from '@/components/Image.vue';

export default defineComponent({
  name: 'Main',
  components: { Button, Image },
  setup() {
    const store = useStore() as Store;
    const router = useRouter();
    const doRegistration = ref(false);
    const photoLoaded = ref(false);
    const input = ref('');
    const available = ref(false);
    const loading = computed(() => store.state.loading);
    const userName = computed(() => store.state.name);
    const userBio = computed(() => store.state.bio);
    const userPhoto = computed(() => store.state.photo);

    const subscription = from(GitNotesDB.getInstance().select('user'))
      .pipe(delay(1500))
      .subscribe({
        next(users) {
          doRegistration.value = !users.length;
        },
        error(e) {
          doRegistration.value = true;
          console.error(e);
        },
        complete() {
          !doRegistration.value && router.push({ name: 'Home' });
        },
      });

    const getUserProfile = () => {
      store.commit(MutationTypes.SET_LOADING, true);
      store
        .dispatch(ActionTypes.GET_PROFILE, input.value)
        .then(() => (available.value = true))
        .catch((err) => {
          const status = err.response.status;
          if (status === 403) {
            showNotification(ErrorMessages.LIMIT_EXECEEDED);
          } else if (status === 404) {
            showNotification(ErrorMessages.USER_NOT_FOUND);
          }
        })
        .finally(() => {
          store.commit(MutationTypes.SET_LOADING, false);
          store.state.name || store.commit(MutationTypes.SET_NAME, input.value);
        });
    };

    const resetUserProfile = () => {
      available.value = false;
      store.commit(MutationTypes.RESET_USER);
    };

    onBeforeUnmount(() => subscription.unsubscribe());

    return {
      doRegistration,
      input,
      available,
      photoLoaded,
      getUserProfile,
      resetUserProfile,
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