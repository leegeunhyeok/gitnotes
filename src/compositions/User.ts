import { computed } from 'vue';
import { useStore } from '@/store';

export const useUser = () => {
  const { state } = useStore();
  const userName = computed(() => state.name);
  const userBio = computed(() => state.bio);
  const userPhoto = computed(() => state.photo);
  return { userName, userBio, userPhoto };
};
