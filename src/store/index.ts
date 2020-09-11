import { inject, provide } from 'vue';
import { createStore, Store as VuexStore, CommitOptions, DispatchOptions } from 'vuex';
import { State, state } from '@/store/state';
import { Mutations, mutations } from '@/store/mutations';
import { Actions, actions } from '@/store/actions';

const store = createStore({
  state,
  mutations,
  actions,
});

type Store = Omit<VuexStore<State>, 'getters' | 'commit' | 'dispatch'> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions,
  ): ReturnType<Mutations[K]>;
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload: Parameters<Actions[K]>[1],
    options?: DispatchOptions,
  ): ReturnType<Actions[K]>;
};

const StoreSymbol = Symbol();
export const provideStore = () => provide(StoreSymbol, store);
export const useStore = () => {
  const store = inject<Store>(StoreSymbol);
  if (!store) throw new Error('Store not provided');
  return store;
};
export default store;
