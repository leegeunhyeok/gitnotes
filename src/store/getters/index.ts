import { GetterTree } from 'vuex';
import { State } from '@/store/state';

export enum GetterTypes {
  USER_STATE_AVAILABLE = 'USER_STATE_AVAILABLE',
  REPOSITORY_STATE_AVAILABLE = 'REPOSITORY_STATE_AVAILABLE',
}

export interface Getters<S = State> {
  [GetterTypes.USER_STATE_AVAILABLE](state: S): boolean;
  [GetterTypes.REPOSITORY_STATE_AVAILABLE](state: S): boolean;
}

export const getters: GetterTree<State, State> & Getters = {
  [GetterTypes.USER_STATE_AVAILABLE](state) {
    return !!(state.name && state.token);
  },
  [GetterTypes.REPOSITORY_STATE_AVAILABLE](state) {
    return !!(state.repository && state.branch);
  },
};
