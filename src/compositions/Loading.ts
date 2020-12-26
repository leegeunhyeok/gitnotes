import { useStore } from '@/store';
import { MutationTypes } from '@/store/mutations';

/**
 * Composition helper for global loading View
 */
export const useLoadingView = () => {
  const store = useStore();
  const show = () => store.commit(MutationTypes.SET_LOADING, true);
  const hide = () => store.commit(MutationTypes.SET_LOADING, false);
  return { show, hide };
};
