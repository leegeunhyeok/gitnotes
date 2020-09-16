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
      </div>
      <div class="profile__summary__item">
        <span class="note"></span>
        <p>{{ noteSummary.noteCount }}</p>
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

$gray_10: darken($gray, 10%);
$gray_20: darken($gray, 20%);

.profile {
  @include content;

  & > * {
    margin-top: 1rem;
  }

  &__photo {
    width: 6rem;
    height: 6rem;
    margin: auto;

    & > * {
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid $gray_10;
      -webkit-mask-image: -webkit-radial-gradient(white, black);
    }
  }

  &__name {
    font-size: 1.2rem;

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

    &__item {
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
        margin: 0;
      }
    }
  }
}
</style>
