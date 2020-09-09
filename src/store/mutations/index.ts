import { MutationTree } from 'vuex';
import { State } from '@/store/state';

export enum MutationTypes {
  SET_LOADING = 'SET_LOADING',
  SET_NAME = 'SET_NAME',
  SET_BIO = 'SET_BIO',
  SET_PHOTO = 'SET_PHOTO',
  RESET_USER = 'RESET_USER',
}

export type Mutations<S = State> = {
  [MutationTypes.SET_LOADING](state: S, payload: boolean): void;
  [MutationTypes.SET_NAME](state: S, payload: string): void;
  [MutationTypes.SET_BIO](state: S, payload: string): void;
  [MutationTypes.SET_PHOTO](state: S, payload: string): void;
  [MutationTypes.RESET_USER](state: S): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.SET_LOADING](state, payload) {
    state.loading = payload;
  },
  [MutationTypes.SET_NAME](state, name: string) {
    state.name = name;
  },
  [MutationTypes.SET_BIO](state, bio: string) {
    state.bio = bio;
  },
  [MutationTypes.SET_PHOTO](state, photo: string) {
    state.photo = photo;
  },
  [MutationTypes.RESET_USER](state) {
    state.name = '';
    state.bio = '';
    state.photo = '';
  },
};
