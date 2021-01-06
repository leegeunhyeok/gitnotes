import core, { GitNotesError, Types as CoreTypes } from '@/core';
import { Types as GitHubTypes } from '@/core/github';
import { ActionTree, ActionContext } from 'vuex';
import { State } from '@/store/state';
import { Mutations, MutationTypes } from '@/store/mutations';

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1],
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

export enum ActionTypes {
  // via GitHub APIs
  GITHUB_LOGIN = 'GIHUB_LOGIN',
  TOKEN_VALIDATION = 'TOKEN_VALIDATION',
  GET_PROFILE = 'GET_PROFILE',
  GET_REPOSITORY = 'GET_REPOSITORY',
  CREATE_REPOSITORY = 'CREATE_REPOSITORY',
  LOAD_METADATA = 'LOAD_METADATA',
  SAVE_METADATA = 'SAVE_METADATA',
  GET_NOTE = 'GET_NOTE',
  ADD_NOTE = 'ADD_NOTE',
  PUT_NOTE = 'PUT_NOTE',
  DELETE_NOTE = 'DELETE_NOTE',
  // defaults
  LOAD_USER = 'LOAD_USER',
  SAVE_USER = 'SAVE_USER',
  CLEAR_USER = 'CLEAR_USER',
}

export interface Actions {
  [ActionTypes.GITHUB_LOGIN](context: AugmentedActionContext): Promise<string>;
  [ActionTypes.TOKEN_VALIDATION](
    context: AugmentedActionContext,
    payload: string,
  ): Promise<boolean>;
  [ActionTypes.GET_PROFILE](
    context: AugmentedActionContext,
    payload: string,
  ): Promise<GitHubTypes.GitHubUser>;
  [ActionTypes.GET_REPOSITORY](
    context: AugmentedActionContext,
    payload: { username: string; repositoryName: string },
  ): Promise<GitHubTypes.GitHubRepository>;
  [ActionTypes.CREATE_REPOSITORY](
    context: AugmentedActionContext,
    payload: string,
  ): Promise<GitHubTypes.GitHubRepository>;
  [ActionTypes.LOAD_METADATA](context: AugmentedActionContext): Promise<void>;
  [ActionTypes.SAVE_METADATA](
    context: AugmentedActionContext,
    payload: CoreTypes.GitNotesMeta,
  ): Promise<CoreTypes.GitNotesMeta>;
  [ActionTypes.GET_NOTE](context: AugmentedActionContext, payload: string): Promise<string>;
  [ActionTypes.ADD_NOTE](
    context: AugmentedActionContext,
    payload: { title: string; content: string; tagId?: string },
  ): Promise<CoreTypes.GitNotesMeta>;
  [ActionTypes.PUT_NOTE](
    context: AugmentedActionContext,
    payload: { noteId: string; title?: string; content?: string; tagId?: string },
  ): Promise<CoreTypes.GitNotesMeta>;
  [ActionTypes.DELETE_NOTE](
    context: AugmentedActionContext,
    payload: string,
  ): Promise<CoreTypes.GitNotesMeta>;
  [ActionTypes.LOAD_USER](
    context: AugmentedActionContext,
  ): Promise<CoreTypes.User & CoreTypes.Profile>;
  [ActionTypes.SAVE_USER](context: AugmentedActionContext): Promise<boolean>;
  [ActionTypes.CLEAR_USER](context: AugmentedActionContext): Promise<boolean>;
}

export const actions: ActionTree<State, State> & Actions = {
  [ActionTypes.GITHUB_LOGIN]() {
    return core.github.login().then(token => {
      if (!token) throw new GitNotesError('token not provided');
      return token;
    });
  },
  [ActionTypes.TOKEN_VALIDATION](_, token) {
    core.github.setToken(token);
    return core.github.getUser().then(({ status }) => status === 200);
  },
  [ActionTypes.GET_PROFILE]({ commit }, token) {
    core.github.setToken(token);
    return core.github.getUser().then(({ data }) => {
      commit(MutationTypes.SET_LOGIN, data.login);
      commit(MutationTypes.SET_NAME, data.name || '');
      commit(MutationTypes.SET_BIO, data.bio || '');
      commit(MutationTypes.SET_PHOTO, data.avatar_url || '');
      return data;
    });
  },
  [ActionTypes.GET_REPOSITORY]({ commit }, { username, repositoryName }) {
    return core.github.getRepository(username, repositoryName).then(({ data }) => {
      commit(MutationTypes.SET_REPOSITORY, {
        name: data.name,
        branch: data.default_branch,
      });
      return data;
    });
  },
  [ActionTypes.CREATE_REPOSITORY]({ commit }, repositoryName: string) {
    return core.github.createRepository(repositoryName, 'GitNotes').then(({ data }) => {
      commit(MutationTypes.SET_REPOSITORY, {
        name: data.name,
        branch: data.default_branch,
      });
      return data;
    });
  },
  [ActionTypes.LOAD_METADATA]({ commit }) {
    return core.loadMeta().then(meta => {
      const { tags, notes } = meta;
      commit(MutationTypes.SET_TAGS, tags);
      commit(MutationTypes.SET_NOTES, notes);
      commit(MutationTypes.APP_INITIALIZAED, undefined);
    });
  },
  [ActionTypes.SAVE_METADATA]() {
    return core.saveMeta();
  },
  [ActionTypes.GET_NOTE](_, noteId) {
    return core.getNote(noteId);
  },
  [ActionTypes.ADD_NOTE](_, { title, content, tagId }) {
    return core.createNote(title, content, tagId);
  },
  [ActionTypes.PUT_NOTE](_, { noteId, title, content, tagId }) {
    return core.updateNote(noteId, title, content, tagId);
  },
  [ActionTypes.DELETE_NOTE](_, noteId) {
    return core.deleteNote(noteId);
  },
  [ActionTypes.LOAD_USER]({ commit }) {
    return core.getUser().then(user => {
      if (!user) null;
      core.initUser(user);
      commit(MutationTypes.SET_LOGIN, user.login);
      commit(MutationTypes.SET_NAME, user.name);
      commit(MutationTypes.SET_BIO, user.bio);
      commit(MutationTypes.SET_PHOTO, user.photo);
      commit(MutationTypes.SET_TOKEN, user.token);
      commit(MutationTypes.SET_REPOSITORY, {
        name: user.repository,
        branch: user.branch,
      });
      return user;
    });
  },
  [ActionTypes.SAVE_USER]({ state }) {
    const { login, name, bio, photo, repository, branch, token } = state;
    return core.saveUser({ login, name, bio, photo, repository, branch, token });
  },
  [ActionTypes.CLEAR_USER]() {
    return core.deleteUser();
  },
};
