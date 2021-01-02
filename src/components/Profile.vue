<template>
  <div class="profile">
    <div class="profile__photo">
      <span />
      <Image :src="user.photo" />
    </div>
    <div class="profile__name">
      {{ user.name }}
      <p class="profile__name--login" v-if="user.login !== user.name">@{{ user.login }}</p>
    </div>
    <div class="profile__summary">
      <div class="profile__summary__item">
        <span class="tag"></span>
        <p>{{ noteSummary.tagCount }}</p>
        <h6>Tags</h6>
      </div>
      <div class="profile__summary__item">
        <span class="note"></span>
        <p>{{ noteSummary.noteCount }}</p>
        <h6>Notes</h6>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from '@/store';
import { GetterTypes } from '@/store/getters';
import Image from '@/components/Image.vue';

export default defineComponent({
  name: 'Profile',
  components: {
    Image,
  },
  setup() {
    const { getters } = useStore();
    const user = computed(() => getters[GetterTypes.USER]);
    const noteSummary = computed(() => getters[GetterTypes.SUMMARY]);

    return { user, noteSummary };
  },
});
</script>

<style lang="scss">
@import '@/styles/colors';
@import '@/styles/content';
@import '@/styles/responsive';

$profile_size: 10rem;

@mixin grow($delay: 0s) {
  will-change: transform;
  transform: scale(0);
  animation: grow 1s $delay alternate forwards;
}

@include theme {
  .profile {
    @include content;
    padding-top: 0;

    & > * {
      margin-top: 1rem;

      @include size(lg) {
        margin-top: 1.5rem;
      }
    }

    &__photo {
      position: relative;
      width: $profile_size;
      height: $profile_size;
      margin: auto;
      @include grow;

      & * {
        border-radius: 50%;
        overflow: hidden;
        -webkit-mask-image: -webkit-radial-gradient(white, black);
      }

      & > span {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: $profile_size;
        height: $profile_size;
        opacity: 0.5;
        animation: breath 1s 1s alternate infinite;
        background-color: t(color-text-primary);
      }

      & .image {
        border: 3px solid t(color-text-primary);
      }
    }

    &__name {
      font-size: 1.2rem;
      @include grow(0.1s);

      &--login {
        font-size: 0.8rem;
        margin: 0.2rem 0;
        color: t(color-text-tertiary);
      }
    }

    &__summary {
      $icon-size: 24px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      @include grow(0.2s);
      @include size(lg) {
        justify-content: space-evenly;
      }

      &__item {
        position: relative;

        & > * {
          float: left;
          line-height: $icon-size;
        }

        span {
          display: block;
          width: $icon-size;
          height: $icon-size;
          margin-right: 12px;
          background-size: $icon-size $icon-size;

          &.tag {
            background-image: url('~@/assets/tag.svg');
          }

          &.note {
            background-image: url('~@/assets/note.svg');
          }
        }

        p {
          color: t(color-text-tertiary);
          margin: 0;
        }

        h6 {
          position: absolute;
          top: 1.2rem;
          margin: 0;
          color: t(color-text-tertiary);
          font-weight: normal;
          width: 100%;
          text-align: center;
        }
      }
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

@keyframes breath {
  100% {
    transform: scale(1.1);
  }
}
</style>
