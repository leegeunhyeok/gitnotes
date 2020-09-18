import core, { GitNotesMeta, Note, GitNotesCore } from '@/core';
import GithubAPI from '@/apis/github';
import { ActionTree, ActionContext } from 'vuex';
import { State } from '@/store/state';
import { Mutations, MutationTypes } from '@/store/mutations';
import { Repository, RepositoryFileContent, User } from '@/interfaces/github';

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1],
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

export enum ActionTypes {
  PREPARE_DATABASE = 'PREPARE_DATABASE',
  LOAD_USER = 'LOAD_USER',
  GET_PROFILE = 'GET_PROFILE',
  TOKEN_VALIDATION = 'TOKEN_VALIDATION',
  GET_REPOSITORY = 'GET_REPOSITORY',
  GIT_INIT = 'GIT_INIT',
  CREATE_REPOSITORY = 'CREATE_REPOSITORY',
  LOAD_METADATA = 'LOAD_METADATA',
  SAVE_METADATA = 'SAVE_METADATA',
  GET_NOTE_CONTENT = 'GET_NOTE_CONTENT',
  PUT_NOTE_CONTENT = 'PUT_NOTE_CONTENT',
  DELETE_NOTE = 'DELETE_NOTE',
}

export interface Actions {
  [ActionTypes.PREPARE_DATABASE](context: AugmentedActionContext): void;
  [ActionTypes.LOAD_USER](context: AugmentedActionContext): Promise<boolean>;
  [ActionTypes.GET_PROFILE](context: AugmentedActionContext, payload: string): Promise<User>;
  [ActionTypes.TOKEN_VALIDATION](context: AugmentedActionContext, payload: string): Promise<User>;
  [ActionTypes.GET_REPOSITORY](
    context: AugmentedActionContext,
    payload: { username: string; repositoryName: string },
  ): Promise<Repository>;
  [ActionTypes.GIT_INIT](context: AugmentedActionContext): Promise<void>;
  [ActionTypes.CREATE_REPOSITORY](
    context: AugmentedActionContext,
    payload: string,
  ): Promise<Repository>;
  [ActionTypes.LOAD_METADATA](context: AugmentedActionContext): Promise<void>;
  [ActionTypes.SAVE_METADATA](
    context: AugmentedActionContext,
    payload: GitNotesMeta,
  ): Promise<GitNotesMeta>;
  [ActionTypes.GET_NOTE_CONTENT](
    context: AugmentedActionContext,
    payload: { name: string; tag?: string },
  ): Promise<string>;
  [ActionTypes.PUT_NOTE_CONTENT](
    context: AugmentedActionContext,
    payload: { name: string; content: string; tag?: string },
  ): Promise<RepositoryFileContent>;
  [ActionTypes.DELETE_NOTE](
    context: AugmentedActionContext,
    payload: { name: string; tag?: string },
  ): Promise<boolean>;
}

export const actions: ActionTree<State, State> & Actions = {
  [ActionTypes.PREPARE_DATABASE]({ commit }) {
    core.prepareDatabase();
    commit(MutationTypes.SET_DB_LOADED, true);
  },
  [ActionTypes.LOAD_USER]({ commit }) {
    return core.getUserFromDB().then(user => {
      if (!user) false;
      commit(MutationTypes.SET_LOGIN, user.login);
      commit(MutationTypes.SET_NAME, user.name);
      commit(MutationTypes.SET_BIO, user.bio);
      commit(MutationTypes.SET_PHOTO, user.photo);
      commit(MutationTypes.SET_TOKEN, user.token);
      commit(MutationTypes.SET_REPOSITORY, {
        name: user.repository,
        branch: user.branch,
      });
      return true;
    });
  },
  [ActionTypes.GET_PROFILE]({ commit }, username) {
    return GithubAPI.getUser(username).then(user => {
      commit(MutationTypes.SET_LOGIN, user.login);
      commit(MutationTypes.SET_NAME, user.name || '');
      commit(MutationTypes.SET_BIO, user.bio || '');
      commit(MutationTypes.SET_PHOTO, user.avatar_url || '');
      return user;
    });
  },
  [ActionTypes.TOKEN_VALIDATION](_, token) {
    return GithubAPI.me(token);
  },
  [ActionTypes.GIT_INIT]({ state, commit }) {
    return core
      .gitInit(state.login, state.repository, state.branch, state.token)
      .then(() => commit(MutationTypes.GIT_INITIALIZAED, undefined));
  },
  [ActionTypes.GET_REPOSITORY]({ commit }, { username, repositoryName }) {
    return GithubAPI.getRepository(username, repositoryName).then(repository => {
      commit(MutationTypes.SET_REPOSITORY, {
        name: repository.name,
        branch: repository.default_branch,
      });
      return repository;
    });
  },
  [ActionTypes.CREATE_REPOSITORY]({ commit }, repositoryName: string) {
    return GithubAPI.createRepository(repositoryName, GitNotesCore.REPO_DESC).then(repository => {
      commit(MutationTypes.SET_REPOSITORY, {
        name: repository.name,
        branch: repository.default_branch,
      });
      return repository;
    });
  },
  [ActionTypes.LOAD_METADATA]({ state, commit }) {
    if (!state.gitInit) throw new Error('Git not initialized');
    return core.loadMeta().then(meta => {
      const { tags, notes } = meta;
      commit(MutationTypes.SET_TAGS, tags);
      commit(MutationTypes.SET_NOTES, notes);
      commit(MutationTypes.APP_INITIALIZAED, undefined);
    });
  },
  [ActionTypes.SAVE_METADATA]({ state }) {
    if (!state.init) throw new Error('Application not initialized');
    return core.saveMeta(state.theme, state.tags, state.notes);
  },
  [ActionTypes.GET_NOTE_CONTENT]({ state }, { name, tag }) {
    if (!state.init) throw new Error('Application not initialized');
    return core.getNote(name, tag);
  },
  [ActionTypes.PUT_NOTE_CONTENT]({ state }, { name, content, tag }) {
    if (!state.init) throw new Error('Application not initialized');
    return core.putNote(name, content, tag);
  },
  [ActionTypes.DELETE_NOTE]({ state }, { name, tag }) {
    if (!state.init) throw new Error('Application not initialized');
    return core.deleteNote(name, tag).then(res => res.deleted);
  },
};
