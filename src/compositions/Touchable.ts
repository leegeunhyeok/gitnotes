import { ref, reactive } from 'vue';

export const useTouchable = (activeClass: string) => {
  const isEnter = ref(false);
  const touchClass = reactive({ [activeClass]: isEnter.value });

  const enter = () => (touchClass[activeClass] = isEnter.value = true);
  const leave = () => (touchClass[activeClass] = isEnter.value = false);

  return {
    isEnter,
    touchClass,
    enter,
    leave,
  };
};
