import { GetterTree } from 'vuex';
import { State } from '@/store/state';

interface UserBasic {
  name: string;
  bio: string;
  photo: string;
}

interface NoteSummary {
  tagCount: number;
  noteCount: number;
}

export enum GetterTypes {
  USER = 'USER',
  SUMMARY = 'SUMMARY',
  USER_STATE_AVAILABLE = 'USER_STATE_AVAILABLE',
  REPOSITORY_STATE_AVAILABLE = 'REPOSITORY_STATE_AVAILABLE',
}

export interface Getters<S = State> {
  [GetterTypes.USER](state: S): UserBasic;
  [GetterTypes.SUMMARY](state: S): NoteSummary;
  [GetterTypes.USER_STATE_AVAILABLE](state: S): boolean;
  [GetterTypes.REPOSITORY_STATE_AVAILABLE](state: S): boolean;
}

export const getters: GetterTree<State, State> & Getters = {
  [GetterTypes.USER]({ login, name, bio, photo }) {
    return { login, name, bio, photo };
  },
  [GetterTypes.SUMMARY]({ tags, notes }) {
    return { tagCount: tags.length, noteCount: notes.length };
  },
  [GetterTypes.USER_STATE_AVAILABLE](state) {
    return !!(state.name && state.token);
  },
  [GetterTypes.REPOSITORY_STATE_AVAILABLE](state) {
    return !!(state.repository && state.branch);
  },
};
