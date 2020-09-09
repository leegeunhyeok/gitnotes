import { createStore, Store as VuexStore, CommitOptions, DispatchOptions } from 'vuex';
import { State, state } from '@/store/state';
import { Mutations, mutations } from '@/store/mutations';
import { Actions, actions } from '@/store/actions';

const store = createStore({
  state,
  mutations,
  actions,
});

export type Store = Omit<VuexStore<State>, 'getters' | 'commit' | 'dispatch'> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload?: P,
    options?: CommitOptions,
  ): ReturnType<Mutations[K]>;
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload?: Parameters<Actions[K]>[1],
    options?: DispatchOptions,
  ): ReturnType<Actions[K]>;
};

export default store;
