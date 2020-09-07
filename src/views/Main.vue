<template>
  <div class="main">
    <div class="main__logo">
      <transition name="fade" mode="out-in">
        <div :key="1" v-if="userPhoto">
          <Image :src="userPhoto" />
        </div>
        <div :key="2" v-else>
          <img src="@/assets/logo.png" />
        </div>
      </transition>
    </div>
    <transition name="grow">
      <div class="main__regist" v-if="doRegistration">
        <h3>👋 Github 계정을 입력해주세요!</h3>
        <div class="component-group">
          <input type="text" placeholder="username" v-model="username" />
        </div>
        <div class="component-group">
          <Button color="blue" :disabled="!username">{{ username ? '시작하기' : '...'}}</Button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { from } from 'rxjs';
import { delay } from 'rxjs/operators';
import { defineComponent, onBeforeUnmount, ref } from 'vue';
import { useRouter } from '@/router';
import Button from '@/components/Button.vue';
import Image from '@/components/Image.vue';
import GitNotesDB from '@/database';

export default defineComponent({
  name: 'Main',
  components: { Button, Image },
  setup() {
    const router = useRouter();
    const doRegistration = ref(false);
    const username = ref('');
    const userPhoto = ref('');
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

    return { doRegistration, username, userPhoto };
  },
});
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &__logo {
    width: 60%;
    max-width: 20rem;

    img {
      width: 100%;
    }
  }

  &__regist {
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