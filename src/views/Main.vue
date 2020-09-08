<template>
  <div class="main">
    <div class="main__logo" :class="{ outline: loading }">
      <transition name="fade" mode="out-in">
        <Image
          :src="userPhoto"
          :key="1"
          @on-load="photoLoaded = true"
          @on-error="photoLoaded = false"
          v-if="loading"
        />
        <img src="@/assets/logo.png" :key="2" v-else />
      </transition>
    </div>
    <transition name="grow">
      <div class="main__regist" v-if="doRegistration">
        <transition name="fade" mode="out-in">
          <h3 v-if="photoLoaded">{{ userName }}</h3>
          <h3 v-else>👋 Github 계정을 입력해주세요!</h3>
        </transition>
        <div class="component-group">
          <input type="text" placeholder="username" v-model="input" />
        </div>
        <div class="component-group">
          <Button
            color="blue"
            :disabled="!input"
            @click="getUserProfile"
          >{{ input ? '시작하기' : '...'}}</Button>
        </div>
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
import Button from '@/components/Button.vue';
import Image from '@/components/Image.vue';
import GitNotesDB from '@/database';
import { ActionTypes } from '@/store/actions';
import { MutationTypes } from '@/store/mutations';

export default defineComponent({
  name: 'Main',
  components: { Button, Image },
  setup() {
    const store = useStore() as Store;
    const router = useRouter();
    const doRegistration = ref(false);
    const photoLoaded = ref(false);
    const input = ref('');
    const loading = ref(false);
    const userName = computed(() => store.state.name);
    const userBio = computed(() => store.state.bio);
    const userPhoto = computed(() => store.state.photo);

    const subscription = from(GitNotesDB.getInstance().select('user'))
      .pipe(delay(1000))
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

    onBeforeUnmount(() => subscription.unsubscribe());

    const getUserProfile = () => {
      loading.value = true;
      store.commit(MutationTypes.SET_LOADING, true);
      store
        .dispatch(ActionTypes.GET_PROFILE, input.value)
        .catch((err) => (loading.value = false && console.log(err.response.status)))
        .finally(() => {
          store.commit(MutationTypes.SET_LOADING, false);
          store.state.name || store.commit(MutationTypes.SET_NAME, input.value);
        });
    };

    return {
      doRegistration,
      input,
      loading,
      photoLoaded,
      getUserProfile,
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
    width: 60vw;
    height: 60vw;
    max-width: $width-limit;
    border-style: solid;
    border-width: 1px;
    border-color: $white;
    border-radius: 50%;
    overflow: hidden;

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

    @include size(md) {
      width: 60%;
    }

    @include size(lg) {
      width: 40%;
    }

    input {
      text-align: center;
    }

    input,
    button {
      width: 100%;
    }
  }
}
</style>