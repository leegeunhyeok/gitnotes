<template>
  <div class="regist">
    <h3>🔑 깃허브 액세스 토큰이 필요합니다</h3>
    <div class="regist__form">
      <div class="component-group">
        <input type="password" placeholder="Access token" v-model="token" />
      </div>
      <div class="component-group">
        <Button color="blue" :disabled="!token" @click="tokenValidation">확인</Button>
      </div>
      <div class="component-group">
        <a @click="showModal = true">토큰은 어떻게 발급받나요?</a>
      </div>
    </div>
    <transition name="fade">
      <Modal @close="showModal = false" v-show="showModal">
        <template v-slot:header>💡도움말</template>
        <template v-slot:body>
          <div class="component-group">
            <img src="@/assets/guide/access_token.png" />
          </div>
          <div class="component-group">
            <p>
              <a
                href="https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
              >여기</a>를 참고하여 발급받을 수 있으며,
              <br />위 사진과 같은 저장소 권한이 필요합니다 😉
            </p>
          </div>
          <div class="component-group">
            <p>
              토큰 값은 사용자 브라우저에 저장되며,
              <br />외부 서버 혹은 제 3자에게
              <u style="color: tomato">일절 공개하지 않습니다</u> 🔐
            </p>
          </div>
        </template>
        <template v-slot:footer>
          <Button style="width: 100%" color="green" @click="showModal = false">알겠어요</Button>
        </template>
      </Modal>
    </transition>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { MutationTypes } from '@/store/mutations';
import { showNotification } from '@/services/notification';
import GithubAPI from '@/apis/github';
import M, { messageFrom } from '@/messages';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

export default defineComponent({
  name: 'Regist',
  components: { Button, Modal },
  setup() {
    const store = useStore();
    const router = useRouter();
    const token = ref('');
    const showModal = ref(false);

    // Github Personal Access Token validation
    const tokenValidation = () => {
      store.commit(MutationTypes.SET_LOADING, true);
      GithubAPI.setPersonalAccessToken(token.value);
      GithubAPI.me()
        .then(() => {
          // Validated! -> Go to next step
          store.commit(MutationTypes.SET_TOKEN, token.value);
          router.push({ name: 'Repository' });
        })
        .catch((err) => {
          // Error! -> Notification
          const status = err.response.status;
          if (status === 401) {
            showNotification(M.TOKEN_CHECK);
          } else {
            showNotification(messageFrom(status));
          }
        })
        .finally(() => store.commit(MutationTypes.SET_LOADING, false));
    };

    return { token, showModal, tokenValidation };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/colors';
@import '@/styles/responsive';

$width-limit: 350px;

.regist {
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
