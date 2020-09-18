<template>
  <div class="profile">
    <div class="profile__photo">
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
import Image from '@/components/Image.vue';

export default defineComponent({
  name: 'Profile',
  components: {
    Image,
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.getters.USER);
    const noteSummary = computed(() => store.getters.SUMMARY);

    return { user, noteSummary };
  },
});
</script>

<style lang="scss">
@import '@/styles/colors';
@import '@/styles/content';
@import '@/styles/responsive';

$gray_10: darken($gray, 10%);
$gray_20: darken($gray, 20%);


@mixin grow($delay: 0s) {
  will-change: transform;
  transform: scale(0);
  animation: grow 1s $delay alternate forwards;
}

.profile {
  @include content;

  & > * {
    margin-top: 1.5rem;
  }

  &__photo {
    position: relative;
    width: 10rem;
    height: 10rem;
    margin: auto;
    @include grow;

    & * {
      border-radius: 50%;
      overflow: hidden;
      -webkit-mask-image: -webkit-radial-gradient(white, black);
    }

    & .image {
      img {
        border: 3px solid #fff;
      }

      @at-root #app.red & {
        border: 3px solid $red;
      }

      @at-root #app.pink & {
        border: 3px solid $pink;
      }

      @at-root #app.orange & {
        border: 3px solid $orange;
      }

      @at-root #app.yellow & {
        border: 3px solid $yellow;
      }

      @at-root #app.green & {
        border: 3px solid $green;
      }

      @at-root #app.blue & {
        border: 3px solid $blue;
      }

      @at-root #app.purple & {
        border: 3px solid $purple;
      }

      @at-root #app.black & {
        border: 3px solid $black;
      }
    }
  }

  &__name {
    font-size: 1.2rem;
    @include grow(0.1s);

    &--login {
      font-size: 0.8rem;
      margin: 0.2rem 0;
      color: $gray_20;
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
        color: $gray_20;
        margin: 0;
      }

      h6 {
        position: absolute;
        top: 1.2rem;
        margin: 0;
        color: $gray_20;
        font-weight: normal;
        width: 100%;
        text-align: center;
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
</style>
