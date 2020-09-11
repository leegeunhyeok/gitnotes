import { ActionTree, ActionContext } from 'vuex';
import { State } from '@/store/state';
import { Mutations, MutationTypes } from '@/store/mutations';
import GithubAPI from '@/apis/github';

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1],
  ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

export enum ActionTypes {
  GET_PROFILE = 'GET_PROFILE',
  CREATE_REPOSITORY = 'CREATE_REPOSITORY',
  USE_EXIST_REPOSITORY = 'USE_EXIST_REPOSITORY',
}

export interface Actions {
  [ActionTypes.GET_PROFILE](context: AugmentedActionContext, payload: string): Promise<void>;
  [ActionTypes.CREATE_REPOSITORY](context: AugmentedActionContext, payload: string): Promise<void>;
  [ActionTypes.USE_EXIST_REPOSITORY](
    context: AugmentedActionContext,
    payload: string,
  ): Promise<void>;
}

export const actions: ActionTree<State, State> & Actions = {
  [ActionTypes.GET_PROFILE]({ commit }, name) {
    return GithubAPI.getUser(name).then(user => {
      commit(MutationTypes.SET_NAME, user.name);
      commit(MutationTypes.SET_BIO, user.bio || '');
      commit(MutationTypes.SET_PHOTO, user.avatar_url || '');
    });
  },
  [ActionTypes.CREATE_REPOSITORY]({ commit }, name: string) {
    return GithubAPI.createRepository(name, '🌈 GitNotes').then(repository => {
      const name = repository.name;
      const branch = repository.default_branch;
      commit(MutationTypes.SET_REPOSITORY, { name, branch });
    });
  },
  [ActionTypes.USE_EXIST_REPOSITORY]({ state, commit }, name) {
    return GithubAPI.getRepository(state.name || '', name).then(repository => {
      const name = repository.name;
      const branch = repository.default_branch;
      commit(MutationTypes.SET_REPOSITORY, { name, branch });
    });
  },
};
