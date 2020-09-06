<template>
  <div class="main">
    <div class="main__logo">
      <img src="@/assets/logo.png" />
    </div>
    <transition name="fade">
      <div class="main__regist" :class="{ hide: !doRegistration }">
        <h3>👋 Gitnub 계정을 입력해주세요!</h3>
        <div class="component-group">
          <input type="text" placeholder="username" v-model="username" />
        </div>
        <div class="component-group">
          <button :disabled="!username">{{buttonText}}</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'Main',
  setup() {
    const doRegistration = ref(false);
    const username = ref('');
    const buttonText = computed(() => (username.value ? `${username.value}로 시작하기` : '...'));

    // TODO: Check user data from IDB
    setTimeout(() => {
      doRegistration.value = true;
    }, 2000);

    return { doRegistration, username, buttonText };
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
    max-width: 260px;

    img {
      width: 100%;
    }
  }

  &__regist {
    overflow: hidden;
    max-height: 300px;
    transition: max-height 0.5s, opacity 0.5s;

    &.hide {
      max-height: 0;
      opacity: 0;
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