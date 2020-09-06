import { provide, inject } from 'vue';
import { createStore, Store } from 'vuex';
import userModule from '@/store/user';

export interface RootState {
  count: number;
}

const initalState: RootState = {
  count: 0,
};

const StoreSymbol = Symbol();
const store = createStore({
  state: initalState,
  mutations: {
    SET_COUNT(state, count) {
      state.count = count;
    },
  },
  actions: {
    INCREASE({ state, commit }) {
      commit('SET_COUNT', state.count + 1);
    },
    DECREASE({ state, commit }) {
      commit('SET_COUNT', state.count - 1);
    },
  },
  modules: {
    user: userModule,
  },
});

export const provideStore = () => {
  provide(StoreSymbol, store);
};

export const useStore = () => {
  const store = inject<Store<RootState>>(StoreSymbol);
  if (!store) {
    throw new Error('No store provided');
  }
  return store;
};

export default store;
