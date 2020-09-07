<template>
  <div class="main">
    <div class="main__logo">
      <img src="@/assets/logo.png" />
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
import { defineComponent, ref } from 'vue';
import Button from '@/components/Button.vue';

export default defineComponent({
  name: 'Main',
  components: { Button },
  setup() {
    const doRegistration = ref(false);
    const username = ref('');

    // TODO: Check user data from IDB
    setTimeout(() => {
      doRegistration.value = true;
    }, 2000);

    return { doRegistration, username };
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