import { MutationTree } from 'vuex';
import { State } from '@/store/state';
import { Tag, Note } from '@/core';

export enum MutationTypes {
  GIT_INITIALIZAED = 'GIT_INITIALIZAED',
  APP_INITIALIZAED = 'APP_INITIALIZAED',
  SET_DB_LOADED = 'SET_DB_LOADED',
  SET_LOADING = 'SET_LOADING',
  SET_NOTES = 'SET_NOTES',
  SET_TAGS = 'SET_TAGS',
  SET_LOGIN = 'SET_LOGIN',
  SET_NAME = 'SET_NAME',
  SET_BIO = 'SET_BIO',
  SET_PHOTO = 'SET_PHOTO',
  SET_TOKEN = 'SET_TOKEN',
  RESET_USER = 'RESET_USER',
  SET_REPOSITORY = 'SET_REPOSITORY',
}

export type Mutations<S = State> = {
  [MutationTypes.GIT_INITIALIZAED](state: S): void;
  [MutationTypes.APP_INITIALIZAED](state: S): void;
  [MutationTypes.SET_DB_LOADED](state: S, payload: boolean): void;
  [MutationTypes.SET_LOADING](state: S, payload: boolean): void;
  [MutationTypes.SET_TAGS](state: S, payload: Tag[]): void;
  [MutationTypes.SET_NOTES](state: S, payload: Note[]): void;
  [MutationTypes.SET_LOGIN](state: S, payload: string): void;
  [MutationTypes.SET_NAME](state: S, payload: string): void;
  [MutationTypes.SET_BIO](state: S, payload: string): void;
  [MutationTypes.SET_PHOTO](state: S, payload: string): void;
  [MutationTypes.SET_TOKEN](state: S, payload: string): void;
  [MutationTypes.RESET_USER](state: S): void;
  [MutationTypes.SET_REPOSITORY](state: S, payload: { name: string; branch: string }): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.GIT_INITIALIZAED](state) {
    state.gitInit = true;
  },
  [MutationTypes.APP_INITIALIZAED](state) {
    state.init = true;
  },
  [MutationTypes.SET_DB_LOADED](state, prepared) {
    state.databasePrepared = prepared;
  },
  [MutationTypes.SET_LOADING](state, loading) {
    state.loading = loading;
  },
  [MutationTypes.SET_TAGS](state, tags) {
    state.tags = tags;
  },
  [MutationTypes.SET_NOTES](state, notes) {
    state.notes = notes;
  },
  [MutationTypes.SET_LOGIN](state, login: string) {
    state.login = login;
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
  [MutationTypes.SET_TOKEN](state, token: string) {
    state.token = token;
  },
  [MutationTypes.RESET_USER](state) {
    state.login = '';
    state.name = '';
    state.bio = '';
    state.photo = '';
    state.repository = '';
    state.branch = '';
    state.token = '';
  },
  [MutationTypes.SET_REPOSITORY](state, { name, branch }) {
    state.repository = name;
    state.branch = branch;
  },
};
