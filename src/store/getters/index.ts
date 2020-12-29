import { GetterTree } from 'vuex';
import { State } from '@/store/state';
import { Types as CoreTypes } from '@/core';

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
  THEME = 'THEME',
  USER = 'USER',
  TAGS = 'TAGS',
  NOTES = 'NOTES',
  SUMMARY = 'SUMMARY',
  APPLICATION_INITIALIZED = 'APPLICATION_INITIALIZED',
  USER_STATE_AVAILABLE = 'USER_STATE_AVAILABLE',
  REPOSITORY_STATE_AVAILABLE = 'REPOSITORY_STATE_AVAILABLE',
}

export interface Getters<S = State> {
  [GetterTypes.THEME](state: S): CoreTypes.GitNotesTheme;
  [GetterTypes.USER](state: S): UserBasic;
  [GetterTypes.TAGS](state: S): CoreTypes.Tag[];
  [GetterTypes.NOTES](state: S): CoreTypes.Note[];
  [GetterTypes.SUMMARY](state: S): NoteSummary;
  [GetterTypes.APPLICATION_INITIALIZED](state: S): boolean;
  [GetterTypes.USER_STATE_AVAILABLE](state: S): boolean;
  [GetterTypes.REPOSITORY_STATE_AVAILABLE](state: S): boolean;
}

export const getters: GetterTree<State, State> & Getters = {
  [GetterTypes.THEME]({ theme }) {
    return theme;
  },
  [GetterTypes.USER]({ login, name, bio, photo }) {
    return { login, name, bio, photo };
  },
  [GetterTypes.TAGS]({ _meta }) {
    return _meta.tags;
  },
  [GetterTypes.NOTES]({ _meta }) {
    return _meta.notes;
  },
  [GetterTypes.SUMMARY]({ _meta }) {
    return { tagCount: _meta.tags.length, noteCount: _meta.notes.length };
  },
  [GetterTypes.APPLICATION_INITIALIZED]({ ready }) {
    return ready;
  },
  [GetterTypes.USER_STATE_AVAILABLE](state) {
    return !!(state.name && state.token);
  },
  [GetterTypes.REPOSITORY_STATE_AVAILABLE](state) {
    return !!(state.repository && state.branch);
  },
};
