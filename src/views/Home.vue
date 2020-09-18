<template>
  <div class="home">
    <Profile/>
    <!-- Notes -->
    <div class="home__footer">
      <Button :color="theme">
        <span/>
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';
import { GetterTypes } from '@/store/getters';
import Button from '@/components/Button.vue';
import Profile from '@/components/Profile.vue';

export default defineComponent({
  name: 'Home',
  components: { Button, Profile },
  setup() {
    const { getters } = useStore();
    const router = useRouter();
    getters[GetterTypes.APPLICATION_INITIALIZED] || router.push({ name: 'Main' });

    return { theme: getters[GetterTypes.THEME] };
  },
});
</script>

<style lang="scss" scoped>

@mixin grow($delay: 0s) {
  will-change: transform;
  transform: scale(0);
  animation: grow .5s $delay alternate forwards;
}

.home {
  padding: 1rem;
  max-width: 700px;
  margin: auto;

  &__footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-bottom: 2rem;
    @include grow(.6s);

    button {
      box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.2);
    }

    span {
      display: block;
      width: 24px;
      height: 24px;
      background-image: url('~@/assets/pen.svg');
    }
  }
}

@keyframes grow {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
