import { GetterTree } from 'vuex';
import { State } from '@/store/state';
import { GitNotesTheme, Note, Tag } from '@/core';

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
  [GetterTypes.THEME](state: S): GitNotesTheme;
  [GetterTypes.USER](state: S): UserBasic;
  [GetterTypes.TAGS](state: S): Tag[];
  [GetterTypes.NOTES](state: S): Note[];
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
  [GetterTypes.TAGS]({ tags }) {
    return tags;
  },
  [GetterTypes.NOTES]({ notes }) {
    return notes;
  },
  [GetterTypes.SUMMARY]({ tags, notes }) {
    return { tagCount: tags.length, noteCount: notes.length };
  },
  [GetterTypes.APPLICATION_INITIALIZED]({ init }) {
    return init;
  },
  [GetterTypes.USER_STATE_AVAILABLE](state) {
    return !!(state.name && state.token);
  },
  [GetterTypes.REPOSITORY_STATE_AVAILABLE](state) {
    return !!(state.repository && state.branch);
  },
};
